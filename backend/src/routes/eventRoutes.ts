import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authenticateToken, requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();
const controller = new EventController();

router.get('/eligible', authenticateToken, controller.getEligibleEvents);
router.get('/organizer/my-events', authenticateToken, requireAuth, requireRole(['EVENT_ORGANIZER', 'PLATFORM_ADMIN']), controller.getOrganizerEvents);
router.get('/:id', authenticateToken, controller.getEventById);

router.post('/', authenticateToken, requireAuth, requireRole(['EVENT_ORGANIZER', 'PLATFORM_ADMIN']), controller.createEvent);
router.put('/:id', authenticateToken, requireAuth, requireRole(['EVENT_ORGANIZER', 'PLATFORM_ADMIN']), controller.updateEvent);
router.post('/:id/cancel', authenticateToken, requireAuth, requireRole(['EVENT_ORGANIZER', 'PLATFORM_ADMIN']), controller.cancelEvent);
router.post('/:id/announcement', authenticateToken, requireAuth, requireRole(['EVENT_ORGANIZER', 'PLATFORM_ADMIN']), controller.sendAnnouncement);
router.post('/:id/contact', authenticateToken, requireAuth, controller.contactOrganizer);

export default router;
