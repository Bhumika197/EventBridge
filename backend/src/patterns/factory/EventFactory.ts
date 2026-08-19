import { Event, EventType, EventStatus } from '../../types';

/**
 * FACTORY METHOD DESIGN PATTERN
 * 
 * Problem: Events have category-specific default values, eligibility descriptions, 
 * contact guidelines, and rules. Instantiating events directly using raw constructors
 * spreads category instantiation logic across the application.
 * 
 * Solution: Define an interface / abstract class for creating an Event object, 
 * but let subclasses decide which specific Event type/category structure to instantiate.
 */

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
  registrationDeadline: string;
  capacity: number;
  registrationFee?: number;
  eligibilityDescription?: string;
  status?: EventStatus;
  contactInformation?: string;
}

export abstract class EventFactory {
  /**
   * The Factory Method.
   */
  public abstract createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>;
}

// Concrete Event Factories:

export class TechnicalEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Technical',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to all students with basic programming or engineering knowledge.',
      status: data.status || 'PUBLISHED',
      contactInformation: data.contactInformation || `Tech Support: tech@eventbridge.edu | Organizer: ${data.organizerName}`
    };
  }
}

export class CulturalEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Cultural',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to all enrolled students interested in music, dance, or performing arts.',
      status: data.status || 'PUBLISHED',
      contactInformation: data.contactInformation || `Cultural Desk: cultural@eventbridge.edu | Organizer: ${data.organizerName}`
    };
  }
}

export class SportsEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Sports',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Physical fitness required. Proper athletic attire mandatory.',
      status: data.status || 'PUBLISHED',
      contactInformation: data.contactInformation || `Sports Officer: sports@eventbridge.edu | Organizer: ${data.organizerName}`
    };
  }
}

export class LiteraryEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Literary',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to all aspiring writers, debaters, and literary enthusiasts.',
      status: data.status || 'PUBLISHED',
      contactInformation: data.contactInformation || `Literary Club: literary@eventbridge.edu | Organizer: ${data.organizerName}`
    };
  }
}

export class WorkshopEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Workshop',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Hands-on workshop. Laptops required unless specified otherwise.',
      status: data.status || 'PUBLISHED',
      contactInformation: data.contactInformation || `Workshop Coordinator: workshop@eventbridge.edu | Organizer: ${data.organizerName}`
    };
  }
}

export class ManagementEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Management',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to business, management, and strategy enthusiasts.',
      status: data.status || 'PUBLISHED',
      contactInformation: data.contactInformation || `Biz Cell: management@eventbridge.edu | Organizer: ${data.organizerName}`
    };
  }
}

export class SocialEventFactory extends EventFactory {
  public createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'> {
    return {
      ...data,
      category: 'Social/Community',
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || 'Open to all community members and student volunteers.',
      status: data.status || 'PUBLISHED',
      contactInformation: data.contactInformation || `Community Desk: social@eventbridge.edu | Organizer: ${data.organizerName}`
    };
  }
}

export class EventFactoryProvider {
  private static factories: Record<string, EventFactory> = {
    'Technical': new TechnicalEventFactory(),
    'Cultural': new CulturalEventFactory(),
    'Sports': new SportsEventFactory(),
    'Literary': new LiteraryEventFactory(),
    'Workshop': new WorkshopEventFactory(),
    'Management': new ManagementEventFactory(),
    'Social/Community': new SocialEventFactory(),
    'Social': new SocialEventFactory()
  };

  public static getFactory(category: string): EventFactory {
    return this.factories[category] || new TechnicalEventFactory();
  }
}
