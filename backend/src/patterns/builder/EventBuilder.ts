import { EventType, EventStatus } from '../../types';
import { EventCreationData } from '../factory/EventFactory';

export interface EventBuilderValidationResult {
  valid: boolean;
  errors: string[];
}

export class EventBuilder {
  private title?: string;
  private description?: string;
  private category: string = 'Technical';
  private eventType: EventType = 'INTER_COLLEGE';
  private collegeId?: number;
  private organizerId?: number;
  private organizerName?: string;
  private date?: string;
  private startTime: string = '09:00 AM';
  private endTime: string = '05:00 PM';
  private venue: string = 'Main Auditorium';
  private registrationStartTime?: string;
  private registrationDeadline?: string;
  private capacity: number = 100;
  private registrationFee: number = 0;
  private eligibilityDescription?: string;
  private status: EventStatus = 'DRAFT';
  private contactInformation?: string;
  private prizePool: number = 0;
  private minTeamSize: number = 1;
  private maxTeamSize: number = 1;
  private speakers: string[] = [];
  private sponsors: string[] = [];

  // --- Step 1: Core Required Fields ---
  public setTitle(title: string): this {
    this.title = title ? title.trim() : '';
    return this;
  }

  public setDate(date: string): this {
    this.date = date ? date.trim() : '';
    return this;
  }

  public setCollege(collegeId: number): this {
    this.collegeId = collegeId;
    return this;
  }

  // --- Step 2: Schedule & Logistics ---
  public setSchedule(startTime: string, endTime: string): this {
    this.startTime = startTime;
    this.endTime = endTime;
    return this;
  }

  public setVenue(venue: string): this {
    this.venue = venue ? venue.trim() : '';
    return this;
  }

  public setRegistrationDeadline(deadline: string): this {
    this.registrationDeadline = deadline ? deadline.trim() : '';
    return this;
  }

  public setCapacity(capacity: number): this {
    this.capacity = capacity;
    return this;
  }

  // --- Step 3: Scope & Category ---
  public setCategory(category: string): this {
    this.category = category;
    return this;
  }

  public setInterCollege(isInterCollege: boolean): this {
    this.eventType = isInterCollege ? 'INTER_COLLEGE' : 'INTRA_COLLEGE';
    return this;
  }

  public setEventType(eventType: EventType): this {
    this.eventType = eventType;
    return this;
  }

  // --- Step 4: Optional Fields & Extras ---
  public setDescription(description: string): this {
    this.description = description ? description.trim() : '';
    return this;
  }

  public setPrizePool(amount: number): this {
    this.prizePool = Math.max(0, amount || 0);
    return this;
  }

  public setTeamSize(min: number, max: number): this {
    this.minTeamSize = Math.max(1, min || 1);
    this.maxTeamSize = Math.max(this.minTeamSize, max || this.minTeamSize);
    return this;
  }

  public addSpeaker(speaker: string): this {
    if (speaker && speaker.trim()) {
      this.speakers.push(speaker.trim());
    }
    return this;
  }

  public setSpeakers(speakers: string[]): this {
    this.speakers = speakers ? [...speakers] : [];
    return this;
  }

  public addSponsor(sponsor: string): this {
    if (sponsor && sponsor.trim()) {
      this.sponsors.push(sponsor.trim());
    }
    return this;
  }

  public setSponsors(sponsors: string[]): this {
    this.sponsors = sponsors ? [...sponsors] : [];
    return this;
  }

  public setRegistrationFee(fee: number): this {
    this.registrationFee = Math.max(0, fee || 0);
    return this;
  }

  public setOrganizer(organizerId: number, organizerName: string): this {
    this.organizerId = organizerId;
    this.organizerName = organizerName;
    return this;
  }

  public setEligibilityDescription(desc: string): this {
    this.eligibilityDescription = desc;
    return this;
  }

  public setContactInformation(contact: string): this {
    this.contactInformation = contact;
    return this;
  }

  public setStatus(status: EventStatus): this {
    this.status = status;
    return this;
  }

  // --- Validation & Assembly ---
  public validate(): EventBuilderValidationResult {
    const errors: string[] = [];

    // Required fields: title, date, college
    if (!this.title || this.title.length === 0) {
      errors.push('Event title is required.');
    }
    if (!this.date || this.date.length === 0) {
      errors.push('Event date is required.');
    }
    if (!this.collegeId || this.collegeId <= 0) {
      errors.push('Organizing college is required.');
    }

    // Constraints & logic
    if (this.capacity <= 0) {
      errors.push('Capacity must be at least 1 seat.');
    }

    if (this.registrationDeadline && this.date) {
      const deadlineTime = new Date(this.registrationDeadline).getTime();
      const eventTime = new Date(this.date).getTime();
      if (!isNaN(deadlineTime) && !isNaN(eventTime) && deadlineTime > eventTime) {
        errors.push('Registration deadline cannot be after the event date.');
      }
    }

    if (this.minTeamSize > this.maxTeamSize) {
      errors.push(`Minimum team size (${this.minTeamSize}) cannot exceed maximum team size (${this.maxTeamSize}).`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public build(): EventCreationData {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`EventBuilder Validation Failed: ${validation.errors.join(' ')}`);
    }

    return {
      title: this.title!,
      description: this.description || `${this.title} at ${this.venue}. Join us for an exciting campus experience!`,
      category: this.category,
      eventType: this.eventType,
      collegeId: this.collegeId!,
      organizerId: this.organizerId || 1,
      organizerName: this.organizerName || 'College Organizing Committee',
      date: this.date!,
      startTime: this.startTime,
      endTime: this.endTime,
      venue: this.venue,
      registrationStartTime: this.registrationStartTime,
      registrationDeadline: this.registrationDeadline || this.date!,
      capacity: this.capacity,
      registrationFee: this.registrationFee,
      eligibilityDescription: this.eligibilityDescription || (this.eventType === 'INTRA_COLLEGE' ? 'Host institution students only.' : 'Open to enrolled students across colleges.'),
      status: this.status,
      contactInformation: this.contactInformation || `Inquiries: ${this.organizerName || 'Organizers'}`,
      prizePool: this.prizePool,
      minTeamSize: this.minTeamSize,
      maxTeamSize: this.maxTeamSize,
      speakers: [...this.speakers],
      sponsors: [...this.sponsors],
      isInterCollege: this.eventType === 'INTER_COLLEGE'
    };
  }
}
