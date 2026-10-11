import { EventAccessProxy } from '../patterns/proxy/EventAccessProxy';
import { EventFactoryProvider, EventCreationData } from '../patterns/factory/EventFactory';
import { EventSubject, RegisteredStudentsObserver, OrganizerObserver, AdminAuditObserver } from '../patterns/observer/EventSubject';
import { EventPrototype } from '../patterns/prototype/EventPrototype';
import { EventOriginator, EventHistoryCaretaker } from '../patterns/memento/EventMemento';
import { Event, User, EventStatus, EventFilterQuery, PaginatedResult } from '../types';
import { logger } from '../utils/logger';

export class EventService {
  private eventProxy: EventAccessProxy;
  private eventSubject: EventSubject;

  constructor() {
    this.eventProxy = new EventAccessProxy();
    this.eventSubject = EventSubject.getInstance();

    this.eventSubject.attach(new RegisteredStudentsObserver());
    this.eventSubject.attach(new OrganizerObserver());
    this.eventSubject.attach(new AdminAuditObserver());
  }

  public deriveRegistrationOpen(event: Event): boolean {
    if (event.status !== 'PUBLISHED') {
      return false;
    }
    const now = Date.now();
    if (event.registrationStartTime) {
      const start = new Date(event.registrationStartTime).getTime();
      if (!isNaN(start) && now < start) return false;
    }
    if (event.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline).getTime();
      if (!isNaN(deadline) && now > deadline) return false;
    }
    return true;
  }

  private attachDerivedFields(event?: Event): Event | undefined {
    if (!event) return undefined;
    return {
      ...event,
      isRegistrationOpen: this.deriveRegistrationOpen(event)
    };
  }

  public async getEligibleEventsForUser(user?: User): Promise<Event[]> {
    const events = await this.eventProxy.findAllEligibleForUser(user);
    return events.map(e => this.attachDerivedFields(e)!);
  }

  public async getPaginatedEvents(filters: EventFilterQuery, user?: User): Promise<PaginatedResult<Event>> {
    const paginated = await this.eventProxy.findPaginated(filters, user);
    return {
      ...paginated,
      data: paginated.data.map(e => this.attachDerivedFields(e)!)
    };
  }

  public async getEventByIdForUser(eventId: number, user?: User) {
    const result = await this.eventProxy.findByIdForUser(eventId, user);
    if (result.event) {
      result.event = this.attachDerivedFields(result.event);
    }
    return result;
  }

  public async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    const events = await this.eventProxy.findByOrganizer(organizerId);
    return events.map(e => this.attachDerivedFields(e)!);
  }

  public async getPendingReviewEvents(user: User): Promise<Event[]> {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new Error('Unauthorized: Only platform administrators can access pending reviews.');
    }
    const events = await this.eventProxy.findPendingReview();
    return events.map(e => this.attachDerivedFields(e)!);
  }

  public async createEvent(data: EventCreationData, user?: User): Promise<Event> {
    const factory = EventFactoryProvider.getFactory(data.category);
    const eventObject = factory.createEvent(data);

    // Initial status defaults to DRAFT unless specified
    if (!eventObject.status) {
      eventObject.status = 'DRAFT';
    }

    const createdEvent = await this.eventProxy.create(eventObject);
    logger.info(`Event created: "${createdEvent.title}" (ID #${createdEvent.eventId}) with status: ${createdEvent.status}`);

    await this.eventSubject.notifyObservers(createdEvent, 'CREATED', `Event "${createdEvent.title}" created as ${createdEvent.status}.`);
    return this.attachDerivedFields(createdEvent)!;
  }

  public async submitForReview(eventId: number, user: User): Promise<Event> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (user.role !== 'PLATFORM_ADMIN' && existing.organizerId !== user.userId) {
      throw new Error('Unauthorized: You can only submit your own events for review.');
    }

    if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
      throw new Error(`Cannot submit event with status '${existing.status}'. Only DRAFT or REJECTED events can be submitted.`);
    }

    await this.eventProxy.updateStatus(eventId, 'SUBMITTED');
    const updated = (await this.eventProxy.findById(eventId))!;
    logger.info(`Event #${eventId} submitted for administrative review by user #${user.userId}`);

    await this.eventSubject.notifyObservers(updated, 'SUBMITTED', `Event "${updated.title}" submitted for review.`);
    return this.attachDerivedFields(updated)!;
  }

  public async reviewEvent(eventId: number, decision: 'APPROVE' | 'REJECT', rejectionReason?: string, adminUser?: User): Promise<Event> {
    if (!adminUser || adminUser.role !== 'PLATFORM_ADMIN') {
      throw new Error('Unauthorized: Only platform administrators can review events.');
    }

    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (existing.status !== 'SUBMITTED') {
      throw new Error(`Cannot review event with status '${existing.status}'. Event must be in 'SUBMITTED' status.`);
    }

    if (decision === 'APPROVE') {
      // Upon approval, move to APPROVED or directly PUBLISHED
      await this.eventProxy.updateStatus(eventId, 'PUBLISHED', undefined, adminUser.userId);
      logger.info(`Event #${eventId} APPROVED and PUBLISHED by Admin #${adminUser.userId}`);
    } else {
      if (!rejectionReason || !rejectionReason.trim()) {
        throw new Error('Rejection reason is required when rejecting an event.');
      }
      await this.eventProxy.updateStatus(eventId, 'REJECTED', rejectionReason.trim(), adminUser.userId);
      logger.info(`Event #${eventId} REJECTED by Admin #${adminUser.userId}. Reason: ${rejectionReason}`);
    }

    const updated = (await this.eventProxy.findById(eventId))!;
    await this.eventSubject.notifyObservers(
      updated,
      decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      decision === 'APPROVE' 
        ? `Event "${updated.title}" has been approved and published.` 
        : `Event "${updated.title}" was rejected. Reason: ${rejectionReason}`
    );

    return this.attachDerivedFields(updated)!;
  }

  public async updateEvent(eventId: number, updates: Partial<Event>, user: User, changeDescription?: string): Promise<Event> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (user.role !== 'PLATFORM_ADMIN' && existing.organizerId !== user.userId) {
      throw new Error('Unauthorized: You can only edit your own events.');
    }

    // --- MEMENTO PATTERN: Save state snapshot before mutating ---
    try {
      const originator = new EventOriginator(existing);
      const caretaker = new EventHistoryCaretaker(eventId);
      const desc = changeDescription || `Updated fields: ${Object.keys(updates).join(', ')}`;
      await caretaker.pushSnapshot(originator, desc);
    } catch (err) {
      logger.warn(`Failed to save memento snapshot for event #${eventId}: ${err}`);
    }

    const updated = await this.eventProxy.update(eventId, updates);
    if (!updated) throw new Error('Failed to update event.');

    const changesText = updates.venue ? `Venue changed to ${updates.venue}` : updates.date ? `Date changed to ${updates.date}` : 'Event details updated.';
    await this.eventSubject.notifyObservers(updated, 'UPDATED', changesText);

    return this.attachDerivedFields(updated)!;
  }

  /**
   * PROTOTYPE PATTERN: Clones an existing event, deep-copying arrays (speakers, sponsors)
   * and resetting operational state.
   */
  public async cloneEvent(
    eventId: number,
    user: User,
    overrides?: { date?: string; venue?: string; title?: string; registrationDeadline?: string }
  ): Promise<Event> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found to clone.');
    }

    if (user.role !== 'PLATFORM_ADMIN' && user.role !== 'EVENT_ORGANIZER') {
      throw new Error('Unauthorized: Only event organizers or administrators can duplicate events.');
    }

    const prototype = new EventPrototype(existing);
    const cloned = prototype.clone(overrides);
    const creationData = cloned.toEventCreationData();
    // Assign creating organizer
    creationData.organizerId = user.userId;
    creationData.organizerName = user.name;
    creationData.collegeId = user.collegeId;

    const createdEvent = await this.createEvent(creationData, user);
    logger.info(`Prototype Pattern: Duplicated Event #${eventId} -> New Event #${createdEvent.eventId} ("${createdEvent.title}")`);
    return createdEvent;
  }

  /**
   * MEMENTO PATTERN: Undoes the most recent edit to an event by restoring
   * the previous state from the history stack.
   */
  public async undoEventEdit(eventId: number, user: User): Promise<Event> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (user.role !== 'PLATFORM_ADMIN' && existing.organizerId !== user.userId) {
      throw new Error('Unauthorized: You can only undo edits on your own events.');
    }

    const originator = new EventOriginator(existing);
    const caretaker = new EventHistoryCaretaker(eventId);
    const restoredState = await caretaker.undo(originator);

    if (!restoredState) {
      throw new Error('No previous snapshot found in history to undo.');
    }

    const updated = await this.eventProxy.update(eventId, restoredState);
    if (!updated) throw new Error('Failed to restore event state.');

    logger.info(`Memento Pattern: Restored Event #${eventId} to previous snapshot state.`);
    await this.eventSubject.notifyObservers(updated, 'UPDATED', 'Reverted to previous version snapshot via Undo.');
    return this.attachDerivedFields(updated)!;
  }

  /**
   * Retrieves version history snapshots for an event
   */
  public async getEventHistory(eventId: number): Promise<{ id: number; description: string; timestamp: string }[]> {
    const caretaker = new EventHistoryCaretaker(eventId);
    return caretaker.getHistoryRecords();
  }

  public async cancelEvent(eventId: number, reason: string, user: User): Promise<void> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (user.role !== 'PLATFORM_ADMIN' && existing.organizerId !== user.userId) {
      throw new Error('Unauthorized: You can only cancel your own events.');
    }

    await this.eventProxy.updateStatus(eventId, 'CANCELLED', reason, user.userId);
    const updated = (await this.eventProxy.findById(eventId))!;

    await this.eventSubject.notifyObservers(updated, 'CANCELLED', reason);
  }

  public async broadcastAnnouncement(eventId: number, announcement: string, user: User): Promise<void> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (user.role !== 'PLATFORM_ADMIN' && existing.organizerId !== user.userId) {
      throw new Error('Unauthorized.');
    }

    await this.eventSubject.notifyObservers(existing, 'ANNOUNCEMENT', announcement);
  }
}
