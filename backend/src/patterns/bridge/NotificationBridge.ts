import { NotificationRepository } from '../../repositories/NotificationRepository';
import { NotificationType, NotificationChannelType, NotificationRecord } from '../../types';

/**
 * BRIDGE DESIGN PATTERN
 * 
 * Problem: Notifications vary in both notification business types (Registration, Event Updates, Cancellations)
 * and delivery mechanisms (In-App, Email, SMS). Creating classes for every combination (e.g. InAppRegistrationConfirmation, EmailRegistrationConfirmation, SMSRegistrationConfirmation) causes an explosion of 3x7 = 21 subclasses.
 * 
 * Solution: Decouple the Notification Abstraction from its Delivery Channel Implementation using Bridge.
 */

// ----------------------------------------------------
// 1. Implementation Interface (Implementor)
// ----------------------------------------------------
export interface NotificationChannel {
  getChannelType(): NotificationChannelType;
  send(userId: number, eventId: number | undefined, type: NotificationType, message: string): Promise<NotificationRecord>;
}

// Concrete Implementor: In-App Channel
export class InAppChannel implements NotificationChannel {
  private repo = new NotificationRepository();
  getChannelType(): NotificationChannelType { return 'In-App'; }
  async send(userId: number, eventId: number | undefined, type: NotificationType, message: string): Promise<NotificationRecord> {
    return this.repo.create(userId, eventId, type, 'In-App', `[In-App Notification] ${message}`);
  }
}

// Concrete Implementor: Email Channel (Simulated)
export class EmailChannel implements NotificationChannel {
  private repo = new NotificationRepository();
  getChannelType(): NotificationChannelType { return 'Email'; }
  async send(userId: number, eventId: number | undefined, type: NotificationType, message: string): Promise<NotificationRecord> {
    const formattedMsg = `[Simulated Email Sent] Subject: ${type} | Body: ${message}`;
    return this.repo.create(userId, eventId, type, 'Email', formattedMsg);
  }
}

// Concrete Implementor: SMS Channel (Simulated)
export class SMSChannel implements NotificationChannel {
  private repo = new NotificationRepository();
  getChannelType(): NotificationChannelType { return 'SMS'; }
  async send(userId: number, eventId: number | undefined, type: NotificationType, message: string): Promise<NotificationRecord> {
    const formattedMsg = `[Simulated SMS Dispatch] Msg: ${type}: ${message}`;
    return this.repo.create(userId, eventId, type, 'SMS', formattedMsg);
  }
}

// ----------------------------------------------------
// 2. Abstraction (Bridge Base Class)
// ----------------------------------------------------
export abstract class NotificationBridge {
  protected channel: NotificationChannel;

  constructor(channel?: NotificationChannel) {
    this.channel = channel || new InAppChannel();
  }

  public setChannel(channel: NotificationChannel): void {
    this.channel = channel;
  }

  public abstract dispatch(userId: number, eventId: number | undefined, eventTitle: string, extraInfo?: string): Promise<NotificationRecord>;
}

// ----------------------------------------------------
// 3. Refined Abstractions
// ----------------------------------------------------

export class RegistrationConfirmationNotification extends NotificationBridge {
  async dispatch(userId: number, eventId: number | undefined, eventTitle: string): Promise<NotificationRecord> {
    const type: NotificationType = 'Registration Confirmation';
    const message = `Your registration for "${eventTitle}" has been successfully confirmed. See you there!`;
    return this.channel.send(userId, eventId, type, message);
  }
}

export class EventUpdatedNotification extends NotificationBridge {
  async dispatch(userId: number, eventId: number | undefined, eventTitle: string, changes?: string): Promise<NotificationRecord> {
    const type: NotificationType = 'Event Updated';
    const message = `Important Update for "${eventTitle}": ${changes || 'Event details (date, venue, or schedule) have been modified by the organizer.'}`;
    return this.channel.send(userId, eventId, type, message);
  }
}

export class EventCancelledNotification extends NotificationBridge {
  async dispatch(userId: number, eventId: number | undefined, eventTitle: string, reason?: string): Promise<NotificationRecord> {
    const type: NotificationType = 'Event Cancelled';
    const message = `Notice: "${eventTitle}" has been CANCELLED by the organizing team. Reason: ${reason || 'Unforeseen administrative constraints.'}`;
    return this.channel.send(userId, eventId, type, message);
  }
}

export class OrganizerAnnouncementNotification extends NotificationBridge {
  async dispatch(userId: number, eventId: number | undefined, eventTitle: string, announcement?: string): Promise<NotificationRecord> {
    const type: NotificationType = 'Organizer Announcement';
    const message = `Announcement for "${eventTitle}": ${announcement || 'Please check your portal for updated event guidelines.'}`;
    return this.channel.send(userId, eventId, type, message);
  }
}
