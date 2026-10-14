import { Router } from 'express';
import { RegistrationController } from '../controllers/RegistrationController';
import { authenticateToken, requireAuth } from '../middleware/authMiddleware';

const router = Router();
const controller = new RegistrationController();

router.post('/event/:eventId', authenticateToken, requireAuth, controller.register);
router.delete('/:id', authenticateToken, requireAuth, controller.cancel);
router.get('/my-registrations', authenticateToken, requireAuth, controller.getMyRegistrations);
router.get('/event/:eventId/list', authenticateToken, requireAuth, controller.getEventRegistrations);

router.get('/notifications', authenticateToken, requireAuth, controller.getMyNotifications);
router.put('/notifications/:id/read', authenticateToken, requireAuth, controller.markNotificationRead);

export default router;
