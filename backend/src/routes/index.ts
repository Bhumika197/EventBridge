import { Router } from 'express';
import authRoutes from './authRoutes';
import eventRoutes from './eventRoutes';
import registrationRoutes from './registrationRoutes';
import adminRoutes from './adminRoutes';
import patternRoutes from './patternRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/admin', adminRoutes);
router.use('/patterns', patternRoutes);

export default router;
