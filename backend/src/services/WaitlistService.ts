import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';
import { EventSubject } from '../patterns/observer/EventSubject';
import { Registration, Event } from '../types';
import { logger } from '../utils/logger';

export class WaitlistService {
  private regRepo: RegistrationRepository;
  private eventRepo: EventRepository;
  private eventSubject: EventSubject;

  constructor() {
    this.regRepo = new RegistrationRepository();
    this.eventRepo = new EventRepository();
    this.eventSubject = EventSubject.getInstance();
  }

  public async addToWaitlist(studentId: number, eventId: number): Promise<Registration> {
    const reg = await this.regRepo.createWaitlisted(eventId, studentId);
    logger.info(`Student #${studentId} joined waitlist for Event #${eventId} (Queue position #${reg.queuePosition})`);
    return reg;
  }

  public async promoteNextInQueue(eventId: number): Promise<Registration | null> {
    const nextWaitlisted = await this.regRepo.getNextWaitlisted(eventId);
    if (!nextWaitlisted) {
      return null;
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event) return null;

    // Atomically promote student from WAITLISTED to CONFIRMED
    const promoted = await this.regRepo.promoteWaitlisted(nextWaitlisted.registrationId, eventId);
    if (!promoted) return null;

    await this.eventRepo.incrementRegistrations(eventId, 1);

    logger.info(`Waitlist promotion executed: Student #${promoted.studentId} promoted to CONFIRMED for Event #${eventId} ("${event.title}")`);

    // Notify Observers of waitlist promotion
    await this.eventSubject.notifyObservers(
      event,
      'WAITLIST_PROMOTED',
      `Great news! A spot opened up for "${event.title}", and your registration has been promoted from the waitlist to CONFIRMED.`,
      promoted.studentId
    );

    return promoted;
  }

  public async getEventWaitlist(eventId: number): Promise<Registration[]> {
    const all = await this.regRepo.findByEvent(eventId);
    return all.filter(r => r.status === 'WAITLISTED');
  }
}
