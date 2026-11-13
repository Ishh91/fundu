import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/index.js';
import { createHttpError } from '../utils/error.js';
import { normalizeDoc } from '../utils/dbHelpers.js';
import { issueSession, isAdmin, requireAdmin, requireAuth } from '../middleware/auth.js';
import { createOtp, verifyOtp as checkOtp, hasActiveOtp, otpTtlSeconds } from '../utils/otpStore.js';
import { sendOtp } from '../services/smsService.js';
import { sendViaNodemailer } from './emailRoutes.js';
import { verifyFirebasePhoneToken } from '../utils/firebaseToken.js';
import { STAFF_ROLE, sanitizePermissions } from '../config/permissions.js';

const MIN_PASSWORD_LENGTH = 6;
const RESET_RESEND_COOLDOWN_TTL_SECONDS = 540; // OTP TTL is 600s, so >540 means <60s old
const resetOtpKey = (email) => `reset:${email}`;

const router = Router();
const inMemoryUsers = new Map();

async function safeFindUser(query) {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUser = await User.findOne(query).maxTimeMS(3000);
      if (dbUser) return dbUser;
    } catch {
      // Fall through to memory store if Mongo times out
    }
  }
  if (query.$or) {
    for (const cond of query.$or) {
      if (cond.email) {
        const found = Array.from(inMemoryUsers.values()).find((u) => u.email === cond.email);
        if (found) return found;
      }
      if (cond.phone) {
        const found = Array.from(inMemoryUsers.values()).find((u) => u.phone === cond.phone);
        if (found) return found;
      }
    }
    return null;
  }
  if (query.email) {
    return Array.from(inMemoryUsers.values()).find((u) => u.email === query.email) || null;
  }
  if (query.phone) {
    return Array.from(inMemoryUsers.values()).find((u) => u.phone === query.phone) || null;
  }
  return null;
}

async function safeCreateUser(doc) {
  if (mongoose.connection.readyState === 1) {
    try {
      return await User.create(doc);
    } catch {
      // Fall through to memory store if Mongo times out
    }
  }
  const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newUser = {
    _id: id,
    id: id,
    ...doc,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryUsers.set(id, newUser);
  return newUser;
}

/* ────────────────────────────────────────────────────────────────
   POST /auth/check-email
   Public pre-check to verify if an email is already registered.
   ────────────────────────────────────────────────────────────── */
router.post('/check-email', async (req, res, next) => {
  try {
    const cleanEmail = String(req.body.email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return res.json({ data: { exists: false } });
    }
    const user = await safeFindUser({ email: cleanEmail });
    if (user) {
      return res.json({
        data: {
          exists: true,
          message: `Email address "${cleanEmail}" is ALREADY registered! Please Sign In instead.`,
        },
      });
    }
    res.json({ data: { exists: false } });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/check-phone
   Public pre-check to verify if a mobile number is already registered.
   ────────────────────────────────────────────────────────────── */
router.post('/check-phone', async (req, res, next) => {
  try {
    const rawPhone = req.body.phone;
    if (!rawPhone) {
      return res.json({ data: { exists: false } });
    }
    const cleanPhone = normalisePhone(rawPhone);
    if (!isValidPhone(cleanPhone)) {
      return res.json({ data: { exists: false } });
    }
    const user = await safeFindUser({ phone: cleanPhone });
    if (user) {
      return res.json({
        data: {
          exists: true,
          message: `Account with mobile number +91 ${cleanPhone} exists.`,
        },
      });
    }
    res.json({ data: { exists: false } });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/delete-user
   Admin endpoint to delete a user/vendor by ID.
   ────────────────────────────────────────────────────────────── */
router.post('/delete-user', async (req, res, next) => {
  try {
    requireAdmin(req.auth);
    const { userId } = req.body;
    if (!userId) {
      throw createHttpError(400, 'User ID is required.');
    }

    if (typeof userId !== 'string') {
      throw createHttpError(400, 'User ID must be a string.');
    }
    if (userId === req.auth.sub) {
      throw createHttpError(400, 'You cannot delete your own admin account.');
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      await User.deleteOne({ _id: userId });
    }
    inMemoryUsers.delete(userId);

    console.log(`🗑️ Deleted user ID: ${userId} by Admin.`);
    res.json({ data: { success: true, message: 'User deleted successfully.' } });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/clean-test-users
   Clears all non-admin test users from MongoDB database.
   ────────────────────────────────────────────────────────────── */
router.post('/clean-test-users', async (req, res, next) => {
  try {
    requireAdmin(req.auth);
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@fundu.in').toLowerCase().trim();
    const result = await User.deleteMany({
      email: { $ne: adminEmail },
      role: { $ne: 'admin' },
    });
    console.log(`🧹 Cleared ${result.deletedCount} non-admin test users from MongoDB.`);
    res.json({
      data: {
        success: true,
        deletedCount: result.deletedCount,
        message: `Successfully cleared ${result.deletedCount} non-admin test accounts from database.`,
      },
    });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   Helper: normalise phone to 10-digit string
   ────────────────────────────────────────────────────────────── */
const normalisePhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  // Strip leading 91 country code if 12 digits
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
};

const isValidPhone = (phone) => /^\d{10}$/.test(phone);

/* ────────────────────────────────────────────────────────────────
   POST /auth/otp/send
   Body: { phone, email?, fullName? }
   Rate-limited to once per 60 seconds per number.
   Sends OTP via SMS and also via Email if email is provided (optional).
   ────────────────────────────────────────────────────────────── */
router.post('/otp/send', async (req, res, next) => {
  try {
    const phone = normalisePhone(req.body.phone);
    const cleanEmail = req.body.email ? String(req.body.email).toLowerCase().trim() : null;
    const fullName = req.body.fullName ? String(req.body.fullName).trim() : 'User';

    if (!isValidPhone(phone)) {
      throw createHttpError(400, 'Please enter a valid 10-digit Indian mobile number.');
    }

    if (cleanEmail && !cleanEmail.includes('@')) {
      throw createHttpError(400, 'Please enter a valid email address.');
    }

    // 60-second resend cooldown (enforced in production only)
    const isDevMode = process.env.OTP_DEV_MODE === 'true' || process.env.SMS_PROVIDER === 'console' || !process.env.SMS_PROVIDER;
    if (!isDevMode && hasActiveOtp(phone)) {
      const ttl = otpTtlSeconds(phone);
      if (ttl > 540) { // OTP was created <60 seconds ago (600 - 60 = 540)
        throw createHttpError(429, `Please wait ${600 - ttl} seconds before requesting a new OTP.`);
      }
    }

    const otp = createOtp(phone);
    let smsSent = false;
    let smsError = null;

    try {
      const result = await sendOtp(phone, otp);
      smsSent = Boolean(result.sent);
      if (!result.sent) smsError = result.error;
    } catch (err) {
      smsError = err.message;
    }

    // If email is provided (optional), send the exact same OTP to their email inbox
    let emailSent = false;
    if (cleanEmail) {
      try {
        const mailRes = await sendViaNodemailer({
          to: cleanEmail,
          subject: `Fundu Verification Code: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; color: white;">
                <h2 style="margin: 0; color: #38bdf8;">Fundu Security</h2>
                <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Account Verification</p>
              </div>
              <div style="padding: 20px 0;">
                <p>Hi <strong>${fullName}</strong>,</p>
                <p>Your verification OTP code for Fundu registration is:</p>
                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                  <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #0284c7; letter-spacing: 8px;">${otp}</span>
                </div>
                <p style="font-size: 12px; color: #64748b;">This code expires in 10 minutes. Do not share it with anyone.</p>
              </div>
            </div>
          `,
          from: `"Fundu Verification" <${process.env.SMTP_USER || 'trustiqueassist0003@gmail.com'}>`,
        });
        emailSent = Boolean(mailRes.success);
      } catch (err) {
        console.error('⚠️ [Email OTP Error]:', err?.message || err);
      }
    }

    // If both failed in strict prod mode, report error; otherwise proceed smoothly
    if (!smsSent && !emailSent && process.env.NODE_ENV === 'production' && !isDevMode) {
      throw createHttpError(400, smsError || 'Failed to send OTP. Please try again.');
    }

    let message = `OTP sent to +91 ${phone}.`;
    if (emailSent && cleanEmail) {
      message = `OTP sent to +91 ${phone} and ${cleanEmail}.`;
    }

    const response = {
      message,
      emailSent,
      smsSent,
    };

    // Only expose devOtp if OTP_DEV_MODE is explicitly true
    if (process.env.OTP_DEV_MODE === 'true') {
      response.devOtp = otp;
    }

    res.json({ data: response });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/otp/verify
   Body: { phone, otp, fullName?, email?, password? }
   Auto-creates account on first login or updates missing info.
   ────────────────────────────────────────────────────────────── */
router.post('/otp/verify', async (req, res, next) => {
  try {
    const phone = normalisePhone(req.body.phone);
    const { otp, fullName, email, password } = req.body;

    if (!isValidPhone(phone)) {
      throw createHttpError(400, 'Invalid phone number.');
    }

    if (!otp || String(otp).trim().length !== 6) {
      throw createHttpError(400, 'Please enter the 6-digit OTP.');
    }

    const { valid, reason } = checkOtp(phone, String(otp).trim());
    if (!valid) throw createHttpError(400, reason);

    const cleanEmail = email ? String(email).toLowerCase().trim() : null;

    // Find or create user. The OTP only proves ownership of the phone number,
    // so the account must be looked up by phone alone (never by email).
    let user = await User.findOne({ phone });

    if (!user) {
      if (cleanEmail && (await User.findOne({ email: cleanEmail }))) {
        throw createHttpError(409, 'This email address is already registered with another account.');
      }
      user = await User.create({
        phone,
        email: cleanEmail || null,
        full_name: fullName ? String(fullName).trim() : null,
        passwordHash: password ? await bcrypt.hash(String(password), 10) : null,
        role: 'customer',
        is_verified: true,
      });
    } else {
      if (!user.is_verified) user.is_verified = true;
      if (fullName && !user.full_name) user.full_name = String(fullName).trim();
      if (cleanEmail && !user.email && !(await User.findOne({ email: cleanEmail }))) user.email = cleanEmail;
      if (password && !user.passwordHash) user.passwordHash = await bcrypt.hash(String(password), 10);
      await user.save();
    }

    res.json({
      data: {
        session: issueSession(user),
        profile: normalizeDoc(user),
        isNewUser: !user.full_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/otp/verify-firebase
   Body: { idToken, phone, fullName?, email? }
   Called after client-side Firebase Phone Auth verification succeeds.
   The Firebase ID token is verified server-side; a phone number in the
   request body is never trusted on its own.
   Finds or creates MongoDB user and issues standard session JWT.
   ────────────────────────────────────────────────────────────── */
router.post('/otp/verify-firebase', async (req, res, next) => {
  try {
    const rawPhone = req.body.phone;
    if (!rawPhone) {
      throw createHttpError(400, 'Phone number is required.');
    }

    const phone = normalisePhone(rawPhone);
    if (!isValidPhone(phone)) {
      throw createHttpError(400, 'Invalid phone number format.');
    }

    const verifiedPhone = await verifyFirebasePhoneToken(req.body.idToken);
    if (verifiedPhone !== phone) {
      throw createHttpError(401, 'Phone verification does not match this mobile number.');
    }

    const { fullName } = req.body;
    const cleanEmail = req.body.email ? String(req.body.email).toLowerCase().trim() : null;

    let user;

    if (cleanEmail) {
      // Find matching user with BOTH phone and this specific email
      user = await User.findOne({ phone, email: cleanEmail });
    } else {
      // Find user by phone
      user = await User.findOne({ phone });
    }

    if (!user) {
      if (cleanEmail) {
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
          throw createHttpError(409, 'This email address is already registered with another account.');
        }
      }

      user = await User.create({
        phone,
        email: cleanEmail || undefined,
        full_name: fullName ? String(fullName).trim() : null,
        role: 'customer',
        is_verified: true,
      });
    } else if (!user.is_verified) {
      user.is_verified = true;
      if (cleanEmail && !user.email) {
        user.email = cleanEmail;
      }
      await user.save();
    }

    res.json({
      data: {
        session: issueSession(user),
        profile: normalizeDoc(user),
        isNewUser: !user.full_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/register
   Phone is MANDATORY. Email is OPTIONAL (kept for record).
   If phone is already registered with another email, a new distinct
   user record is created for the new email.
   ────────────────────────────────────────────────────────────── */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, phone, role, businessName, creditLimit, gstNumber } = req.body;
    if (!fullName) {
      throw createHttpError(400, 'Full name is required.');
    }

    const cleanPhone = phone ? normalisePhone(phone) : '';
    if (!cleanPhone || !isValidPhone(cleanPhone)) {
      throw createHttpError(400, 'A valid 10-digit mobile number is mandatory.');
    }

    const cleanEmail = email ? String(email).toLowerCase().trim() : null;
    if (cleanEmail && !cleanEmail.includes('@')) {
      throw createHttpError(400, 'Please enter a valid email address.');
    }

    if (cleanEmail) {
      // Check if this exact email is already used by another account
      const existingEmail = await safeFindUser({ email: cleanEmail });
      if (existingEmail) {
        throw createHttpError(409, 'This email address is already registered. Please use another email or Sign In.');
      }
    } else {
      // If no email provided, check if a phone-only user with no email already exists
      const existingNoEmail = await User.findOne({
        phone: cleanPhone,
        $or: [{ email: null }, { email: { $exists: false } }, { email: '' }],
      });
      if (existingNoEmail) {
        throw createHttpError(409, 'An account with this mobile number already exists. Please Sign In.');
      }
    }

    // Only a signed-in admin may create staff/vendor accounts or set credit terms.
    // Public self-registration is always a plain customer account.
    const createdByAdmin = isAdmin(req.auth);
    const requestedRole = role ? String(role) : 'customer';
    if (requestedRole !== 'customer' && !createdByAdmin) {
      throw createHttpError(403, 'Only an admin can create non-customer accounts.');
    }

    const user = await safeCreateUser({
      email: cleanEmail,
      passwordHash: password ? await bcrypt.hash(String(password), 10) : null,
      full_name: String(fullName).trim(),
      phone: cleanPhone,
      role: requestedRole,
      business_name: businessName || null,
      credit_limit: createdByAdmin && creditLimit ? Number(creditLimit) : 200000,
      permissions: requestedRole === STAFF_ROLE ? sanitizePermissions(req.body.permissions) : [],
      gst_number: gstNumber || null,
      is_verified: true,
    });

    res.status(201).json({
      data: {
        session: issueSession(user),
        profile: normalizeDoc(user),
      },
    });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/login  (email+password — kept for admin accounts)
   ────────────────────────────────────────────────────────────── */
router.post('/login', async (req, res, next) => {
  try {
    const rawIdentifier = String(req.body.email || req.body.identifier || req.body.phone || '').trim();
    const password = req.body.password;

    if (!rawIdentifier || !password) {
      throw createHttpError(400, 'Mobile number/email and password are required.');
    }

    const cleanEmail = rawIdentifier.toLowerCase().trim();
    const cleanPhone = normalisePhone(rawIdentifier);

    const queryConditions = [
      { email: cleanEmail },
      { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    ];
    if (isValidPhone(cleanPhone)) {
      queryConditions.push({ phone: cleanPhone });
    }

    const user = await safeFindUser({ $or: queryConditions });
    if (!user) {
      throw createHttpError(401, `⚠️ Account Not Found: No registered account with "${rawIdentifier}". Please check details or Create New Account.`);
    }

    if (!user.passwordHash) {
      throw createHttpError(401, 'Account password not set. Please reset your password or contact support.');
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      throw createHttpError(401, `❌ Incorrect Password: The password entered for "${rawIdentifier}" is incorrect. Please try again or click Reset Password.`);
    }

    res.json({
      data: {
        session: issueSession(user),
        profile: normalizeDoc(user),
      },
    });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/reset-password/request
   Body: { email }
   Generates a reset OTP on the server and emails it to the account.
   The OTP never leaves the server except through that email.
   ────────────────────────────────────────────────────────────── */
router.post('/reset-password/request', async (req, res, next) => {
  try {
    const cleanEmail = String(req.body.email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw createHttpError(400, 'Please enter your registered email address.');
    }

    const key = resetOtpKey(cleanEmail);
    if (hasActiveOtp(key) && otpTtlSeconds(key) > RESET_RESEND_COOLDOWN_TTL_SECONDS) {
      throw createHttpError(429, 'Please wait a minute before requesting another reset code.');
    }

    const user = await safeFindUser({ email: cleanEmail });
    if (!user) {
      throw createHttpError(404, `⚠️ Account Not Found: No registered account with "${cleanEmail}".`);
    }

    const otp = createOtp(key);
    const mailRes = await sendViaNodemailer({
      to: cleanEmail,
      subject: 'Fundu Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="margin: 0 0 12px;">Fundu Password Reset</h2>
          <p>Use this code to reset your Fundu password:</p>
          <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #0284c7; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #64748b;">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
        </div>
      `,
    });

    if (!mailRes.success) {
      console.error('Password reset email failed:', mailRes.error);
      throw createHttpError(503, 'Could not send the reset code right now. Please try again later or contact support.');
    }

    res.json({ data: { success: true, message: `Reset code sent to ${cleanEmail}.` } });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   POST /auth/reset-password
   Body: { email, otp, newPassword }
   Resets the password only after the emailed reset OTP is verified.
   ────────────────────────────────────────────────────────────── */
router.post('/reset-password', async (req, res, next) => {
  try {
    const cleanEmail = String(req.body.email || '').toLowerCase().trim();
    const otp = String(req.body.otp || '').trim();
    const newPassword = req.body.newPassword ? String(req.body.newPassword) : '';

    if (!cleanEmail || !otp || !newPassword) {
      throw createHttpError(400, 'Email, reset code and new password are required.');
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw createHttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    }

    const { valid, reason } = checkOtp(resetOtpKey(cleanEmail), otp);
    if (!valid) throw createHttpError(400, reason);

    const user = await safeFindUser({ email: cleanEmail });
    if (!user) {
      throw createHttpError(404, `⚠️ Account Not Found: No registered account with "${cleanEmail}".`);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    if (mongoose.connection.readyState === 1 && user._id) {
      await User.updateOne({ _id: user._id }, { $set: { passwordHash: newHash } });
    }
    user.passwordHash = newHash;

    console.log(`🔑 Reset password successfully for user ${user.email || user.phone}`);
    res.json({
      data: {
        success: true,
        message: 'Password reset successfully. Please sign in with your new password.',
      },
    });
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────────────
   GET /auth/me
   ────────────────────────────────────────────────────────────── */
router.get('/me', async (req, res, next) => {
  try {
    requireAuth(req.auth);
    const sub = req.auth?.sub;
    if (!sub) throw createHttpError(401, 'Invalid session token.');

    const isObjId = mongoose.Types.ObjectId.isValid(sub);
    const query = isObjId ? { $or: [{ _id: sub }, { id: sub }] } : { id: sub };

    let user = await safeFindUser(query);
    if (!user && isObjId) {
      try {
        user = await User.findById(sub);
      } catch {
        // Ignore cast error
      }
    }

    if (!user) throw createHttpError(401, 'Session expired. Please sign in again.');

    const normUser = normalizeDoc(user);
    res.json({
      data: {
        session: {
          access_token: req.headers.authorization?.slice(7) || '',
          user: {
            id: normUser.id || user.id || sub,
            email: normUser.email || user.email || '',
            role: normUser.role || user.role || 'customer',
          },
        },
        profile: normUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;



