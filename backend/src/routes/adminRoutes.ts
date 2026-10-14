import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateToken, requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();
const controller = new AdminController();

router.use(authenticateToken, requireAuth, requireRole(['PLATFORM_ADMIN']));

router.get('/stats', controller.getPlatformStats);
router.get('/users', controller.getAllUsers);
router.post('/colleges', controller.createCollege);

export default router;
