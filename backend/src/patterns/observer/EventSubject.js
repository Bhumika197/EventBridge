import { RegistrationRepository } from "../../repositories/RegistrationRepository";
import { NotificationRepository } from "../../repositories/NotificationRepository";
import { logger } from "../../utils/logger";
export class EventSubject {
  static instance = null;
  observers = [];
  constructor() {
  }
  static getInstance() {
    if (!EventSubject.instance) {
      EventSubject.instance = new EventSubject();
    }
    return EventSubject.instance;
  }
  attach(observer) {
    if (!this.observers.some((o) => o.getObserverName() === observer.getObserverName())) {
      this.observers.push(observer);
    }
  }
  detach(observer) {
    this.observers = this.observers.filter((o) => o.getObserverName() !== observer.getObserverName());
  }
  async notifyObservers(event, changeType, message, targetUserId) {
    for (const observer of this.observers) {
      try {
        await observer.onEventChanged(event, changeType, message, targetUserId);
      } catch (err) {
        logger.error(`Observer error [${observer.getObserverName()}]:`, err);
      }
    }
  }
}
export class RegisteredStudentsObserver {
  regRepo = new RegistrationRepository();
  notifRepo = new NotificationRepository();
  getObserverName() {
    return "RegisteredStudentsObserver";
  }
  async onEventChanged(event, changeType, message, targetUserId) {
    if (changeType === "WAITLIST_PROMOTED" && targetUserId) {
      await this.notifRepo.create(
        targetUserId,
        event.eventId,
        "Waitlist Promotion",
        "In-App",
        message || `You have been promoted from the waitlist to CONFIRMED for "${event.title}".`
      );
      await this.notifRepo.create(
        targetUserId,
        event.eventId,
        "Waitlist Promotion",
        "Email",
        `[Simulated Email] Subject: Spot Confirmed for ${event.title} | Body: ${message}`
      );
      return;
    }
    const registrations = await this.regRepo.findByEvent(event.eventId);
    if (registrations.length === 0) return;
    for (const reg of registrations) {
      if (reg.status === "CONFIRMED" || reg.status === "WAITLISTED") {
        const notifType = changeType === "CANCELLED" ? "Event Cancelled" : changeType === "ANNOUNCEMENT" ? "Organizer Announcement" : "Event Updated";
        await this.notifRepo.create(
          reg.studentId,
          event.eventId,
          notifType,
          "In-App",
          message || `Event update for "${event.title}": ${changeType}`
        );
      }
    }
  }
}
export class OrganizerObserver {
  notifRepo = new NotificationRepository();
  getObserverName() {
    return "OrganizerObserver";
  }
  async onEventChanged(event, changeType, message) {
    if (changeType === "CREATED" || changeType === "SUBMITTED" || changeType === "STATUS_CHANGE") {
      await this.notifRepo.create(
        event.organizerId,
        event.eventId,
        "Event Updated",
        "In-App",
        `[Organizer Notice] Event "${event.title}" is now in state: ${event.status}.`
      );
    }
  }
}
export class AdminAuditObserver {
  getObserverName() {
    return "AdminAuditObserver";
  }
  async onEventChanged(event, changeType, message) {
    logger.info(`[Admin Audit] Event #${event.eventId} ("${event.title}") action: '${changeType}' | Details: ${message || "N/A"}`);
  }
}
