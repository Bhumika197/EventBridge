import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.post('/register', controller.registerStudent);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/me', authenticateToken, controller.getCurrentUser);
router.get('/colleges', controller.getColleges);

export default router;
