export const MAX_NOTIFICATION_RECIPIENTS = 5;
export const MAX_NOTIFICATION_BODY_CHARS = 200000;

/**
 * Sanity limits for one email / WhatsApp send, so the public notification
 * endpoints cannot be used to blast a long list of people.
 * Returns an error message, or null when the request is acceptable.
 */
export const limitNotification = ({ recipients, body }) => {
  if (!body || !String(body).trim()) return 'Message body is required.';
  if (String(body).length > MAX_NOTIFICATION_BODY_CHARS) return 'Message is too long.';
  if (Array.isArray(recipients) && recipients.length > MAX_NOTIFICATION_RECIPIENTS) {
    return `Too many recipients (maximum ${MAX_NOTIFICATION_RECIPIENTS}).`;
  }
  return null;
};
