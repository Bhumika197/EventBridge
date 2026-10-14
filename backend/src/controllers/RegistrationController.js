import { RegistrationService } from "../services/RegistrationService";
import { NotificationRepository } from "../repositories/NotificationRepository";
export class RegistrationController {
  regService = new RegistrationService();
  notifRepo = new NotificationRepository();
  register = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }
      const eventId = Number(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: "Invalid event ID." });
      }
      const studentId = req.user.userId;
      const result = await this.regService.registerStudentForEvent(studentId, eventId);
      if (!result.success) {
        const isDuplicate = result.validationResult.handlerName === "DuplicateRegistrationHandler";
        return res.status(isDuplicate ? 409 : 400).json({
          success: false,
          reason: result.validationResult.reason,
          handlerName: result.validationResult.handlerName
        });
      }
      if (result.status === "WAITLISTED") {
        return res.status(201).json({
          success: true,
          status: "WAITLISTED",
          queuePosition: result.queuePosition,
          message: `Event is currently at maximum capacity. You have been placed on the waitlist at position #${result.queuePosition}.`,
          data: result.registration
        });
      }
      return res.status(201).json({
        success: true,
        status: "CONFIRMED",
        message: "Successfully registered for event!",
        data: result.registration
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Registration failed." });
    }
  };
  cancel = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }
      const regId = Number(req.params.id);
      if (isNaN(regId)) {
        return res.status(400).json({ success: false, message: "Invalid registration ID." });
      }
      const cancelResult = await this.regService.cancelRegistration(regId, req.user.userId);
      return res.status(200).json({
        success: true,
        message: "Registration cancelled successfully.",
        promotedWaitlistedStudent: cancelResult.promotedStudent ? true : false
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message || "Failed to cancel registration." });
    }
  };
  getMyRegistrations = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }
      const list = await this.regService.getStudentRegistrations(req.user.userId);
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to fetch registrations." });
    }
  };
  getEventRegistrations = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }
      const eventId = Number(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: "Invalid event ID." });
      }
      const list = await this.regService.getEventRegistrations(eventId);
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to fetch event registrations." });
    }
  };
  getMyNotifications = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }
      const list = await this.notifRepo.findByUser(req.user.userId);
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to fetch notifications." });
    }
  };
  markNotificationRead = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }
      const notifId = Number(req.params.id);
      await this.notifRepo.markAsRead(notifId);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to update notification." });
    }
  };
}
