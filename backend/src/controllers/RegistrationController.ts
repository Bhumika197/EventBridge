import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { RegistrationService } from '../services/RegistrationService';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class RegistrationController {
  private regService = new RegistrationService();
  private notifRepo = new NotificationRepository();

  public register = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.eventId);
      const studentId = req.user.userId;

      const result = await this.regService.registerStudentForEvent(studentId, eventId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          reason: result.validationResult.reason,
          handlerName: result.validationResult.handlerName
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Successfully registered for event!',
        data: result.registration
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public cancel = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const regId = Number(req.params.id);
      await this.regService.cancelRegistration(regId, req.user.userId);
      return res.json({ success: true, message: 'Registration cancelled successfully.' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public getMyRegistrations = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const list = await this.regService.getStudentRegistrations(req.user.userId);
      return res.json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getEventRegistrations = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.eventId);
      const list = await this.regService.getEventRegistrations(eventId);
      return res.json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const list = await this.notifRepo.findByUser(req.user.userId);
      return res.json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const notifId = Number(req.params.id);
      await this.notifRepo.markAsRead(notifId);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}
