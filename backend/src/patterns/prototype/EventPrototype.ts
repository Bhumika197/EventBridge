import { Event, EventType, EventStatus } from '../../types';
import { EventCreationData } from '../factory/EventFactory';

export interface Prototype<T> {
  clone(): T;
}

export class EventPrototype implements Prototype<EventPrototype> {
  public title: string;
  public description: string;
  public category: string;
  public eventType: EventType;
  public collegeId: number;
  public organizerId: number;
  public organizerName: string;
  public date: string;
  public startTime: string;
  public endTime: string;
  public venue: string;
  public registrationStartTime?: string;
  public registrationDeadline: string;
  public capacity: number;
  public registrationFee: number;
  public eligibilityDescription: string;
  public status: EventStatus;
  public contactInformation: string;
  public prizePool: number;
  public minTeamSize: number;
  public maxTeamSize: number;
  public speakers: string[];
  public sponsors: string[];

  constructor(event: Partial<Event> | EventCreationData) {
    this.title = event.title || 'Untitled Event';
    this.description = event.description || '';
    this.category = event.category || 'Technical';
    this.eventType = event.eventType || 'INTER_COLLEGE';
    this.collegeId = event.collegeId || 1;
    this.organizerId = event.organizerId || 1;
    this.organizerName = event.organizerName || 'Organizer';
    this.date = event.date || '';
    this.startTime = event.startTime || '09:00 AM';
    this.endTime = event.endTime || '05:00 PM';
    this.venue = event.venue || '';
    this.registrationStartTime = event.registrationStartTime;
    this.registrationDeadline = event.registrationDeadline || event.date || '';
    this.capacity = event.capacity || 100;
    this.registrationFee = event.registrationFee || 0;
    this.eligibilityDescription = event.eligibilityDescription || 'Open to enrolled students.';
    this.status = 'DRAFT';
    this.contactInformation = event.contactInformation || '';
    this.prizePool = event.prizePool || 0;
    this.minTeamSize = event.minTeamSize || 1;
    this.maxTeamSize = event.maxTeamSize || 1;

    // Deep copy arrays from source event
    if (Array.isArray(event.speakers)) {
      this.speakers = [...event.speakers];
    } else if (typeof event.speakers === 'string') {
      try {
        this.speakers = JSON.parse(event.speakers);
      } catch {
        this.speakers = [];
      }
    } else {
      this.speakers = [];
    }

    if (Array.isArray(event.sponsors)) {
      this.sponsors = [...event.sponsors];
    } else if (typeof event.sponsors === 'string') {
      try {
        this.sponsors = JSON.parse(event.sponsors);
      } catch {
        this.sponsors = [];
      }
    } else {
      this.sponsors = [];
    }
  }

  /**
   * Prototype clone() method:
   * Creates an exact deep clone of the event, deep-copying arrays (speakers, sponsors),
   * resetting operational state (currentRegistrations=0, status=DRAFT),
   * and optionally applying organizer adjustments like new date and venue.
   */
  public clone(overrides?: {
    date?: string;
    venue?: string;
    title?: string;
    registrationDeadline?: string;
    startTime?: string;
    endTime?: string;
  }): EventPrototype {
    const cloned = new EventPrototype({
      title: overrides?.title || `${this.title} (Clone)`,
      description: this.description,
      category: this.category,
      eventType: this.eventType,
      collegeId: this.collegeId,
      organizerId: this.organizerId,
      organizerName: this.organizerName,
      date: overrides?.date || this.date,
      startTime: overrides?.startTime || this.startTime,
      endTime: overrides?.endTime || this.endTime,
      venue: overrides?.venue || this.venue,
      registrationStartTime: undefined,
      registrationDeadline: overrides?.registrationDeadline || overrides?.date || this.registrationDeadline,
      capacity: this.capacity,
      registrationFee: this.registrationFee,
      eligibilityDescription: this.eligibilityDescription,
      status: 'DRAFT',
      contactInformation: this.contactInformation,
      prizePool: this.prizePool,
      minTeamSize: this.minTeamSize,
      maxTeamSize: this.maxTeamSize,
      speakers: [...this.speakers], // Deep copy
      sponsors: [...this.sponsors]  // Deep copy
    });

    return cloned;
  }

  public toEventCreationData(): EventCreationData {
    return {
      title: this.title,
      description: this.description,
      category: this.category,
      eventType: this.eventType,
      collegeId: this.collegeId,
      organizerId: this.organizerId,
      organizerName: this.organizerName,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      venue: this.venue,
      registrationStartTime: this.registrationStartTime,
      registrationDeadline: this.registrationDeadline,
      capacity: this.capacity,
      registrationFee: this.registrationFee,
      eligibilityDescription: this.eligibilityDescription,
      status: 'DRAFT',
      contactInformation: this.contactInformation,
      prizePool: this.prizePool,
      minTeamSize: this.minTeamSize,
      maxTeamSize: this.maxTeamSize,
      speakers: [...this.speakers],
      sponsors: [...this.sponsors],
      isInterCollege: this.eventType === 'INTER_COLLEGE'
    };
  }
}
