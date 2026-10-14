import { RegistrationRepository } from "../repositories/RegistrationRepository";
import { EventRepository } from "../repositories/EventRepository";
import { EventSubject } from "../patterns/observer/EventSubject";
import { logger } from "../utils/logger";
export class WaitlistService {
  regRepo;
  eventRepo;
  eventSubject;
  constructor() {
    this.regRepo = new RegistrationRepository();
    this.eventRepo = new EventRepository();
    this.eventSubject = EventSubject.getInstance();
  }
  async addToWaitlist(studentId, eventId) {
    const reg = await this.regRepo.createWaitlisted(eventId, studentId);
    logger.info(`Student #${studentId} joined waitlist for Event #${eventId} (Queue position #${reg.queuePosition})`);
    return reg;
  }
  async promoteNextInQueue(eventId) {
    const nextWaitlisted = await this.regRepo.getNextWaitlisted(eventId);
    if (!nextWaitlisted) {
      return null;
    }
    const event = await this.eventRepo.findById(eventId);
    if (!event) return null;
    const promoted = await this.regRepo.promoteWaitlisted(nextWaitlisted.registrationId, eventId);
    if (!promoted) return null;
    await this.eventRepo.incrementRegistrations(eventId, 1);
    logger.info(`Waitlist promotion executed: Student #${promoted.studentId} promoted to CONFIRMED for Event #${eventId} ("${event.title}")`);
    await this.eventSubject.notifyObservers(
      event,
      "WAITLIST_PROMOTED",
      `Great news! A spot opened up for "${event.title}", and your registration has been promoted from the waitlist to CONFIRMED.`,
      promoted.studentId
    );
    return promoted;
  }
  async getEventWaitlist(eventId) {
    const all = await this.regRepo.findByEvent(eventId);
    return all.filter((r) => r.status === "WAITLISTED");
  }
}
