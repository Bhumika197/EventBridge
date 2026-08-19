import { EventAccessProxy } from '../patterns/proxy/EventAccessProxy';
import { EventFactoryProvider, EventCreationData } from '../patterns/factory/EventFactory';
import { AbstractFactoryProvider } from '../patterns/abstractFactory/EventComponentFactory';
import { EventSubject, RegisteredStudentsObserver, OrganizerObserver, AdminAuditObserver } from '../patterns/observer/EventSubject';
import { Event, User, EventStatus } from '../types';

export class EventService {
  private eventProxy: EventAccessProxy;
  private eventSubject: EventSubject;

  constructor() {
    this.eventProxy = new EventAccessProxy();
    this.eventSubject = EventSubject.getInstance();

    // Register observers for event notifications
    this.eventSubject.attach(new RegisteredStudentsObserver());
    this.eventSubject.attach(new OrganizerObserver());
    this.eventSubject.attach(new AdminAuditObserver());
  }

  public async getEligibleEventsForUser(user?: User): Promise<Event[]> {
    return this.eventProxy.findAllEligibleForUser(user);
  }

  public async getEventByIdForUser(eventId: number, user?: User) {
    return this.eventProxy.findByIdForUser(eventId, user);
  }

  public async getEventsByCollege(collegeId: number): Promise<Event[]> {
    return this.eventProxy.findByCollege(collegeId);
  }

  public async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    return this.eventProxy.findByOrganizer(organizerId);
  }

  public async createEvent(data: EventCreationData): Promise<Event> {
    // 1. Use Factory Method to instantiate event object with category defaults
    const factory = EventFactoryProvider.getFactory(data.category);
    const eventObject = factory.createEvent(data);

    // 2. Use Abstract Factory to generate category components
    const componentFactory = AbstractFactoryProvider.getComponentFactory(data.category);
    const regPolicy = componentFactory.createRegistrationPolicy();
    const eligPolicy = componentFactory.createEligibilityPolicy();

    // Attach policy info to eligibility description if needed
    if (regPolicy && eligPolicy) {
      eventObject.eligibilityDescription += ` | Policy: ${regPolicy.getPolicyName()} (${regPolicy.getRequirements().join(', ')})`;
    }

    // 3. Persist via EventAccessProxy / Repository
    const createdEvent = await this.eventProxy.create(eventObject);

    // 4. Notify Observers of creation
    await this.eventSubject.notifyObservers(createdEvent, 'CREATED', `New event "${createdEvent.title}" published.`);

    return createdEvent;
  }

  public async updateEvent(eventId: number, updates: Partial<Event>, updatedBy: User): Promise<Event | undefined> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (updatedBy.role !== 'PLATFORM_ADMIN' && existing.organizerId !== updatedBy.userId) {
      throw new Error('Unauthorized: You can only edit your own events.');
    }

    const updatedEvent = await this.eventProxy.update(eventId, updates);
    if (updatedEvent) {
      // Trigger Observer Pattern to notify registered students of changes!
      const changesText = updates.venue ? `Venue changed to ${updates.venue}` : updates.date ? `Date changed to ${updates.date}` : 'Event details updated.';
      await this.eventSubject.notifyObservers(updatedEvent, 'UPDATED', changesText);
    }
    return updatedEvent;
  }

  public async cancelEvent(eventId: number, reason: string, cancelledBy: User): Promise<void> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (cancelledBy.role !== 'PLATFORM_ADMIN' && existing.organizerId !== cancelledBy.userId) {
      throw new Error('Unauthorized: You can only cancel your own events.');
    }

    await this.eventProxy.updateStatus(eventId, 'CANCELLED');
    const updatedEvent = (await this.eventProxy.findById(eventId))!;

    // Notify Observers of Cancellation (Triggers Bridge Pattern notifications!)
    await this.eventSubject.notifyObservers(updatedEvent, 'CANCELLED', reason);
  }

  public async updateEventStatus(eventId: number, status: EventStatus, user: User): Promise<void> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (user.role !== 'PLATFORM_ADMIN' && existing.organizerId !== user.userId) {
      throw new Error('Unauthorized: Only organizer or admin can update event status.');
    }

    await this.eventProxy.updateStatus(eventId, status);
    const updatedEvent = (await this.eventProxy.findById(eventId))!;
    await this.eventSubject.notifyObservers(updatedEvent, 'STATUS_CHANGE', `Event status changed to ${status}`);
  }

  public async broadcastAnnouncement(eventId: number, announcement: string, organizer: User): Promise<void> {
    const existing = await this.eventProxy.findById(eventId);
    if (!existing) {
      throw new Error('Event not found.');
    }

    if (organizer.role !== 'PLATFORM_ADMIN' && existing.organizerId !== organizer.userId) {
      throw new Error('Unauthorized.');
    }

    await this.eventSubject.notifyObservers(existing, 'ANNOUNCEMENT', announcement);
  }
}
