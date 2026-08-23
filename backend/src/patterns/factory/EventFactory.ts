import { Event, EventType, EventStatus } from '../../types';

export interface EventCreationData {
  title: string;
  description: string;
  category: string;
  eventType: EventType;
  collegeId: number;
  organizerId: number;
  organizerName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  registrationStartTime?: string;
  registrationDeadline: string;
  capacity: number;
  registrationFee?: number;
  eligibilityDescription?: string;
  status?: EventStatus;
  contactInformation?: string;
}

export abstract class EventFactory {
  public abstract createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>;
}

export class TechnicalEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Technical',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to all students with interest in programming, engineering, or computing.',
      status: data.status || 'DRAFT',
      contactInformation: data.contactInformation || `Tech Cell: ${data.organizerName}`
    };
  }
}

export class CulturalEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Cultural',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to all enrolled students with valid institutional student ID.',
      status: data.status || 'DRAFT',
      contactInformation: data.contactInformation || `Cultural Committee: ${data.organizerName}`
    };
  }
}

export class SportsEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Sports',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Physical fitness required. Proper athletic wear mandatory.',
      status: data.status || 'DRAFT',
      contactInformation: data.contactInformation || `Sports Department: ${data.organizerName}`
    };
  }
}

export class WorkshopEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Workshop',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Interactive hands-on session. Bringing a laptop is recommended.',
      status: data.status || 'DRAFT',
      contactInformation: data.contactInformation || `Workshop Coordinator: ${data.organizerName}`
    };
  }
}

export class SeminarEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Seminar',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to all undergraduate and postgraduate students.',
      status: data.status || 'DRAFT',
      contactInformation: data.contactInformation || `Seminar Desk: ${data.organizerName}`
    };
  }
}

export class EventFactoryProvider {
  private static factories: Record<string, EventFactory> = {
    'Technical': new TechnicalEventFactory(),
    'Cultural': new CulturalEventFactory(),
    'Sports': new SportsEventFactory(),
    'Workshop': new WorkshopEventFactory(),
    'Seminar': new SeminarEventFactory(),
    'Management': new TechnicalEventFactory(),
    'Literary': new CulturalEventFactory(),
    'Arts': new CulturalEventFactory(),
    'Social': new CulturalEventFactory(),
    'Social/Community': new CulturalEventFactory()
  };

  public static getFactory(category: string): EventFactory {
    return this.factories[category] || new TechnicalEventFactory();
  }
}
