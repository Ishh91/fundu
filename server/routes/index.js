import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dbRoutes from './dbRoutes.js';
import mobileRoutes from './mobileRoutes.js';
import phoneRoutes from './phoneRoutes.js';
import emailRoutes from './emailRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';
import pincodeRoutes from './pincodeRoutes.js';

const router = Router();

router.use('/phones', phoneRoutes);
router.use('/pincodes', pincodeRoutes);
router.use('/serviceable-pincodes', pincodeRoutes);
router.use('/', mobileRoutes);
router.use('/auth', authRoutes);
router.use('/db', dbRoutes);
router.use('/email', emailRoutes);
router.use('/whatsapp', whatsappRoutes);

export default router;
