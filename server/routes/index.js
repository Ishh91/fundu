import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dbRoutes from './dbRoutes.js';
import mobileRoutes from './mobileRoutes.js';

const router = Router();

router.use('/', mobileRoutes);
router.use('/auth', authRoutes);
router.use('/db', dbRoutes);

export default router;
