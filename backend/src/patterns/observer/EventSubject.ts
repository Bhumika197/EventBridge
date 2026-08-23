import { Event } from '../../types';
import { RegistrationRepository } from '../../repositories/RegistrationRepository';
import { NotificationRepository } from '../../repositories/NotificationRepository';
import { logger } from '../../utils/logger';

export interface IEventObserver {
  getObserverName(): string;
  onEventChanged(event: Event, changeType: string, message?: string, targetUserId?: number): Promise<void>;
}

export class EventSubject {
  private static instance: EventSubject | null = null;
  private observers: IEventObserver[] = [];

  private constructor() {}

  public static getInstance(): EventSubject {
    if (!EventSubject.instance) {
      EventSubject.instance = new EventSubject();
    }
    return EventSubject.instance;
  }

  public attach(observer: IEventObserver): void {
    if (!this.observers.some(o => o.getObserverName() === observer.getObserverName())) {
      this.observers.push(observer);
    }
  }

  public detach(observer: IEventObserver): void {
    this.observers = this.observers.filter(o => o.getObserverName() !== observer.getObserverName());
  }

  public async notifyObservers(event: Event, changeType: string, message?: string, targetUserId?: number): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.onEventChanged(event, changeType, message, targetUserId);
      } catch (err) {
        logger.error(`Observer error [${observer.getObserverName()}]:`, err);
      }
    }
  }
}

// ----------------------------------------------------
// Concrete Observers
// ----------------------------------------------------

export class RegisteredStudentsObserver implements IEventObserver {
  private regRepo = new RegistrationRepository();
  private notifRepo = new NotificationRepository();

  getObserverName(): string { return 'RegisteredStudentsObserver'; }

  async onEventChanged(event: Event, changeType: string, message?: string, targetUserId?: number): Promise<void> {
    if (changeType === 'WAITLIST_PROMOTED' && targetUserId) {
      // Direct notification for promoted student
      await this.notifRepo.create(
        targetUserId,
        event.eventId,
        'Waitlist Promotion',
        'In-App',
        message || `You have been promoted from the waitlist to CONFIRMED for "${event.title}".`
      );
      await this.notifRepo.create(
        targetUserId,
        event.eventId,
        'Waitlist Promotion',
        'Email',
        `[Simulated Email] Subject: Spot Confirmed for ${event.title} | Body: ${message}`
      );
      return;
    }

    const registrations = await this.regRepo.findByEvent(event.eventId);
    if (registrations.length === 0) return;

    for (const reg of registrations) {
      if (reg.status === 'CONFIRMED' || reg.status === 'WAITLISTED') {
        const notifType = changeType === 'CANCELLED' 
          ? 'Event Cancelled' 
          : changeType === 'ANNOUNCEMENT' 
            ? 'Organizer Announcement' 
            : 'Event Updated';

        await this.notifRepo.create(
          reg.studentId,
          event.eventId,
          notifType,
          'In-App',
          message || `Event update for "${event.title}": ${changeType}`
        );
      }
    }
  }
}

export class OrganizerObserver implements IEventObserver {
  private notifRepo = new NotificationRepository();

  getObserverName(): string { return 'OrganizerObserver'; }

  async onEventChanged(event: Event, changeType: string, message?: string): Promise<void> {
    if (changeType === 'CREATED' || changeType === 'SUBMITTED' || changeType === 'STATUS_CHANGE') {
      await this.notifRepo.create(
        event.organizerId,
        event.eventId,
        'Event Updated',
        'In-App',
        `[Organizer Notice] Event "${event.title}" is now in state: ${event.status}.`
      );
    }
  }
}

export class AdminAuditObserver implements IEventObserver {
  getObserverName(): string { return 'AdminAuditObserver'; }

  async onEventChanged(event: Event, changeType: string, message?: string): Promise<void> {
    logger.info(`[Admin Audit] Event #${event.eventId} ("${event.title}") action: '${changeType}' | Details: ${message || 'N/A'}`);
  }
}
