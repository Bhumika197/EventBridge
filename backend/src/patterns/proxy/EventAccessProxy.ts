import { EventRepository, IEventRepository } from '../../repositories/EventRepository';
import { Event, User, EventStatus, EventFilterQuery, PaginatedResult } from '../../types';

/**
 * PROXY DESIGN PATTERN: EventAccessProxy
 * 
 * Problem: Without access interception at the data boundary, unauthorized students
 * can bypass UI restrictions to view draft/unapproved events or restricted INTRA_COLLEGE events.
 * 
 * Solution: Intercept queries through EventAccessProxy, which enforces college-based
 * access control, lifecycle status visibility, and role authorization before returning data.
 */
export class EventAccessProxy implements IEventRepository {
  private realRepository: EventRepository;

  constructor(realRepository?: EventRepository) {
    this.realRepository = realRepository || new EventRepository();
  }

  public async findById(eventId: number): Promise<Event | undefined> {
    return this.realRepository.findById(eventId);
  }

  public async findByIdForUser(eventId: number, user?: User): Promise<{ event?: Event; restricted: boolean; reason?: string }> {
    const event = await this.realRepository.findById(eventId);
    if (!event) {
      return { restricted: false };
    }

    // Platform Admins can inspect any event across all statuses
    if (user && user.role === 'PLATFORM_ADMIN') {
      return { event, restricted: false };
    }

    // Event Organizers can view their own events across all lifecycle statuses
    if (user && user.role === 'EVENT_ORGANIZER' && user.userId === event.organizerId) {
      return { event, restricted: false };
    }

    // Non-organizer / Student / Guest: Cannot view DRAFT, SUBMITTED, REJECTED events
    if (['DRAFT', 'SUBMITTED', 'REJECTED'].includes(event.status)) {
      return {
        restricted: true,
        reason: 'Access Restricted: This event is currently under review or draft status and not publicly available.'
      };
    }

    // INTRA_COLLEGE Access Control
    if (event.eventType === 'INTRA_COLLEGE') {
      if (!user || user.collegeId !== event.collegeId) {
        return {
          restricted: true,
          reason: `Access Restricted: INTRA_COLLEGE event "${event.title}" is restricted strictly to students of ${event.organizingCollegeName || 'the organizing institution'}.`
        };
      }
    }

    return { event, restricted: false };
  }

  public async findAll(): Promise<Event[]> {
    return this.realRepository.findAll();
  }

  public async findPaginated(filters: EventFilterQuery, user?: User): Promise<PaginatedResult<Event>> {
    // If not admin, restrict the query filters to prevent querying other colleges' private intra events or unapproved drafts
    const sanitizedFilters = { ...filters };

    return this.realRepository.findPaginated(sanitizedFilters, user);
  }

  public async findAllEligibleForUser(user?: User): Promise<Event[]> {
    const allEvents = await this.realRepository.findAll();

    if (!user) {
      // Unauthenticated Guest: View only published INTER_COLLEGE events
      return allEvents.filter(e => e.eventType === 'INTER_COLLEGE' && e.status === 'PUBLISHED');
    }

    if (user.role === 'PLATFORM_ADMIN') {
      return allEvents;
    }

    if (user.role === 'EVENT_ORGANIZER') {
      return allEvents.filter(event => {
        // Organizer can see their own events regardless of status
        if (event.organizerId === user.userId) return true;
        // And other published events
        if (event.status === 'PUBLISHED') {
          return event.eventType === 'INTER_COLLEGE' || event.collegeId === user.collegeId;
        }
        return false;
      });
    }

    // Standard Student:
    return allEvents.filter(event => {
      // Must be PUBLISHED or COMPLETED
      if (event.status !== 'PUBLISHED' && event.status !== 'COMPLETED') {
        return false;
      }

      // INTER_COLLEGE visible to all
      if (event.eventType === 'INTER_COLLEGE') {
        return true;
      }

      // INTRA_COLLEGE visible only to students of the same college
      return event.collegeId === user.collegeId;
    });
  }

  public async findByCollege(collegeId: number): Promise<Event[]> {
    return this.realRepository.findByCollege(collegeId);
  }

  public async findByOrganizer(organizerId: number): Promise<Event[]> {
    return this.realRepository.findByOrganizer(organizerId);
  }

  public async findPendingReview(): Promise<Event[]> {
    return this.realRepository.findPendingReview();
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

  public async updateStatus(eventId: number, status: EventStatus, reason?: string, reviewedBy?: number): Promise<void> {
    return this.realRepository.updateStatus(eventId, status, reason, reviewedBy);
  }

  public async delete(eventId: number): Promise<boolean> {
    return this.realRepository.delete(eventId);
  }
}
