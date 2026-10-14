import { NotificationRepository } from "../../repositories/NotificationRepository";
export class InAppChannel {
  repo = new NotificationRepository();
  getChannelType() {
    return "In-App";
  }
  async send(userId, eventId, type, message) {
    return this.repo.create(userId, eventId, type, "In-App", `[In-App Notification] ${message}`);
  }
}
export class EmailChannel {
  repo = new NotificationRepository();
  getChannelType() {
    return "Email";
  }
  async send(userId, eventId, type, message) {
    const formattedMsg = `[Simulated Email Sent] Subject: ${type} | Body: ${message}`;
    return this.repo.create(userId, eventId, type, "Email", formattedMsg);
  }
}
export class SMSChannel {
  repo = new NotificationRepository();
  getChannelType() {
    return "SMS";
  }
  async send(userId, eventId, type, message) {
    const formattedMsg = `[Simulated SMS Dispatch] Msg: ${type}: ${message}`;
    return this.repo.create(userId, eventId, type, "SMS", formattedMsg);
  }
}
export class NotificationBridge {
  channel;
  constructor(channel) {
    this.channel = channel || new InAppChannel();
  }
  setChannel(channel) {
    this.channel = channel;
  }
}
export class RegistrationConfirmationNotification extends NotificationBridge {
  async dispatch(userId, eventId, eventTitle) {
    const type = "Registration Confirmation";
    const message = `Your registration for "${eventTitle}" has been successfully confirmed. See you there!`;
    return this.channel.send(userId, eventId, type, message);
  }
}
export class EventUpdatedNotification extends NotificationBridge {
  async dispatch(userId, eventId, eventTitle, changes) {
    const type = "Event Updated";
    const message = `Important Update for "${eventTitle}": ${changes || "Event details (date, venue, or schedule) have been modified by the organizer."}`;
    return this.channel.send(userId, eventId, type, message);
  }
}
export class EventCancelledNotification extends NotificationBridge {
  async dispatch(userId, eventId, eventTitle, reason) {
    const type = "Event Cancelled";
    const message = `Notice: "${eventTitle}" has been CANCELLED by the organizing team. Reason: ${reason || "Unforeseen administrative constraints."}`;
    return this.channel.send(userId, eventId, type, message);
  }
}
export class OrganizerAnnouncementNotification extends NotificationBridge {
  async dispatch(userId, eventId, eventTitle, announcement) {
    const type = "Organizer Announcement";
    const message = `Announcement for "${eventTitle}": ${announcement || "Please check your portal for updated event guidelines."}`;
    return this.channel.send(userId, eventId, type, message);
  }
}
