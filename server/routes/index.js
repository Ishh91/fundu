import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dbRoutes from './dbRoutes.js';
import mobileRoutes from './mobileRoutes.js';
import phoneRoutes from './phoneRoutes.js';
import emailRoutes from './emailRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';
import pincodeRoutes from './pincodeRoutes.js';
import errorRoutes from './errorRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import seoRoutes from './seoRoutes.js';
import pricingRulesRoutes from './pricingRulesRoutes.js';

const router = Router();

router.use('/seo', seoRoutes);
router.use('/errors', errorRoutes);
router.use('/pricing-rules', pricingRulesRoutes);
router.use('/phones', phoneRoutes);
router.use('/pincodes', pincodeRoutes);
router.use('/serviceable-pincodes', pincodeRoutes);
router.use('/', mobileRoutes);
router.use('/auth', authRoutes);
router.use('/db', dbRoutes);
router.use('/payments', paymentRoutes);
router.use('/email', emailRoutes);
router.use('/whatsapp', whatsappRoutes);

export default router;
