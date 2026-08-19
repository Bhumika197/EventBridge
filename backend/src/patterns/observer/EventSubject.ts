import { Event } from '../../types';
import { RegistrationRepository } from '../../repositories/RegistrationRepository';
import {
  NotificationBridge,
  EventUpdatedNotification,
  EventCancelledNotification,
  OrganizerAnnouncementNotification,
  EmailChannel,
  InAppChannel
} from '../bridge/NotificationBridge';

/**
 * OBSERVER DESIGN PATTERN
 * 
 * Problem: When an event venue, date, schedule, or status changes, manually writing logic
 * to find and notify every student, organizer, and administrator leads to tight coupling and duplicated logic.
 * 
 * Solution: Define a one-to-many dependency between EventSubject (Subject) and Observer objects
 * so that when the event changes, all dependents are notified automatically.
 */

export interface IEventObserver {
  getObserverName(): string;
  onEventChanged(event: Event, changeType: string, message?: string): Promise<void>;
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

  public async notifyObservers(event: Event, changeType: string, message?: string): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.onEventChanged(event, changeType, message);
      } catch (err) {
        console.error(`Observer error [${observer.getObserverName()}]:`, err);
      }
    }
  }
}

// ----------------------------------------------------
// Concrete Observers
// ----------------------------------------------------

export class RegisteredStudentsObserver implements IEventObserver {
  private regRepo = new RegistrationRepository();

  getObserverName(): string { return 'RegisteredStudentsObserver'; }

  async onEventChanged(event: Event, changeType: string, message?: string): Promise<void> {
    const registrations = await this.regRepo.findByEvent(event.eventId);
    if (registrations.length === 0) return;

    let notificationBridge: NotificationBridge;

    if (changeType === 'CANCELLED') {
      notificationBridge = new EventCancelledNotification(new EmailChannel());
    } else if (changeType === 'ANNOUNCEMENT') {
      notificationBridge = new OrganizerAnnouncementNotification(new InAppChannel());
    } else {
      notificationBridge = new EventUpdatedNotification(new InAppChannel());
    }

    for (const reg of registrations) {
      if (reg.status === 'CONFIRMED' || reg.status === 'PENDING') {
        await notificationBridge.dispatch(reg.studentId, event.eventId, event.title, message);
      }
    }
  }
}

export class OrganizerObserver implements IEventObserver {
  getObserverName(): string { return 'OrganizerObserver'; }

  async onEventChanged(event: Event, changeType: string, message?: string): Promise<void> {
    const inAppBridge = new EventUpdatedNotification(new InAppChannel());
    await inAppBridge.dispatch(
      event.organizerId,
      event.eventId,
      event.title,
      `[Organizer Confirmation] Action '${changeType}' recorded for your event "${event.title}".`
    );
  }
}

export class AdminAuditObserver implements IEventObserver {
  getObserverName(): string { return 'AdminAuditObserver'; }

  async onEventChanged(event: Event, changeType: string, message?: string): Promise<void> {
    console.log(`[Admin Audit Observer] Event #${event.eventId} ("${event.title}") triggered change '${changeType}'. Info: ${message || 'None'}`);
  }
}
