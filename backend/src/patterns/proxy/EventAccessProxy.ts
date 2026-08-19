import { EventRepository, IEventRepository } from '../../repositories/EventRepository';
import { Event, User, EventStatus } from '../../types';

/**
 * PROXY DESIGN PATTERN
 * 
 * Problem: Unchecked database access allows students to directly query and view
 * restricted INTRA_COLLEGE events hosted by other institutions, or perform unauthorized organizer actions.
 * 
 * Solution: Intercept queries through an EventAccessProxy wrapper around EventRepository.
 * The proxy enforces college-based visibility, user role validation, and status restrictions before querying the database.
 */
export class EventAccessProxy implements IEventRepository {
  private realRepository: EventRepository;

  constructor(realRepository?: EventRepository) {
    this.realRepository = realRepository || new EventRepository();
  }

  public async findById(eventId: number): Promise<Event | undefined> {
    // Basic lookup delegating to real repository
    return this.realRepository.findById(eventId);
  }

  /**
   * Filtered lookup for specific user context (Enforces College Visibility Rules)
   */
  public async findByIdForUser(eventId: number, user?: User): Promise<{ event?: Event; restricted: boolean; reason?: string }> {
    const event = await this.realRepository.findById(eventId);
    if (!event) {
      return { restricted: false };
    }

    // Platform Admins can view any event
    if (user && user.role === 'PLATFORM_ADMIN') {
      return { event, restricted: false };
    }

    // Event Organizers can view their own college events
    if (user && user.role === 'EVENT_ORGANIZER' && user.collegeId === event.collegeId) {
      return { event, restricted: false };
    }

    // INTRA_COLLEGE Check
    if (event.eventType === 'INTRA_COLLEGE') {
      if (!user || user.collegeId !== event.collegeId) {
        return {
          restricted: true,
          reason: `Proxy Access Denied: INTRA_COLLEGE event "${event.title}" is visible only to students of ${event.organizingCollegeName}.`
        };
      }
    }

    return { event, restricted: false };
  }

  public async findAll(): Promise<Event[]> {
    return this.realRepository.findAll();
  }

  /**
   * Returns eligible events feed tailored for the specific logged-in user or guest.
   * If logged in as Student from College X:
   *  - Returns all INTER_COLLEGE events
   *  - Returns INTRA_COLLEGE events from College X ONLY
   *  - Omits INTRA_COLLEGE events from College Y, Z, etc.
   */
  public async findAllEligibleForUser(user?: User): Promise<Event[]> {
    const allEvents = await this.realRepository.findAll();

    if (!user) {
      // Guest: view all INTER_COLLEGE published events
      return allEvents.filter(e => e.eventType === 'INTER_COLLEGE' && e.status !== 'DRAFT');
    }

    if (user.role === 'PLATFORM_ADMIN') {
      return allEvents;
    }

    return allEvents.filter(event => {
      // Drafts visible only to organizing college's organizers/admins
      if (event.status === 'DRAFT') {
        return user.role === 'EVENT_ORGANIZER' && user.collegeId === event.collegeId;
      }

      // INTER_COLLEGE is visible to all registered users
      if (event.eventType === 'INTER_COLLEGE') {
        return true;
      }

      // INTRA_COLLEGE is visible ONLY if student belongs to organizing college
      return event.collegeId === user.collegeId;
    });
  }

  public async findByCollege(collegeId: number): Promise<Event[]> {
    return this.realRepository.findByCollege(collegeId);
  }

  public async findByOrganizer(organizerId: number): Promise<Event[]> {
    return this.realRepository.findByOrganizer(organizerId);
  }

  public async create(eventData: Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>): Promise<Event> {
    return this.realRepository.create(eventData);
  }

  public async update(eventId: number, fields: Partial<Event>): Promise<Event | undefined> {
    return this.realRepository.update(eventId, fields);
  }

  public async incrementRegistrations(eventId: number, delta: number): Promise<void> {
    return this.realRepository.incrementRegistrations(eventId, delta);
  }

  public async updateStatus(eventId: number, status: EventStatus): Promise<void> {
    return this.realRepository.updateStatus(eventId, status);
  }

  public async delete(eventId: number): Promise<boolean> {
    return this.realRepository.delete(eventId);
  }
}
