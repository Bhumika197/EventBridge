import { EventRepository } from "../../repositories/EventRepository.js";
export class EventAccessProxy {
  realRepository;
  constructor(realRepository) {
    this.realRepository = realRepository || new EventRepository();
  }
  async findById(eventId) {
    return this.realRepository.findById(eventId);
  }
  async findByIdForUser(eventId, user) {
    const event = await this.realRepository.findById(eventId);
    if (!event) {
      return { restricted: false };
    }
    if (user && user.role === "PLATFORM_ADMIN") {
      return { event, restricted: false };
    }
    if (user && user.role === "EVENT_ORGANIZER" && user.userId === event.organizerId) {
      return { event, restricted: false };
    }
    if (["DRAFT", "SUBMITTED", "REJECTED"].includes(event.status)) {
      return {
        restricted: true,
        reason: "Access Restricted: This event is currently under review or draft status and not publicly available."
      };
    }
    if (event.eventType === "INTRA_COLLEGE") {
      if (!user || user.collegeId !== event.collegeId) {
        return {
          restricted: true,
          reason: `Access Restricted: INTRA_COLLEGE event "${event.title}" is restricted strictly to students of ${event.organizingCollegeName || "the organizing institution"}.`
        };
      }
    }
    return { event, restricted: false };
  }
  async findAll() {
    return this.realRepository.findAll();
  }
  async findPaginated(filters, user) {
    const sanitizedFilters = { ...filters };
    return this.realRepository.findPaginated(sanitizedFilters, user);
  }
  async findAllEligibleForUser(user) {
    const allEvents = await this.realRepository.findAll();
    if (!user) {
      return allEvents.filter((e) => e.status === "PUBLISHED");
    }
    if (user.role === "PLATFORM_ADMIN") {
      return allEvents;
    }
    if (user.role === "EVENT_ORGANIZER") {
      return allEvents.filter((event) => {
        if (event.organizerId === user.userId) return true;
        if (event.status === "PUBLISHED") {
          return event.eventType === "INTER_COLLEGE" || event.collegeId === user.collegeId;
        }
        return false;
      });
    }
    return allEvents.filter((event) => {
      if (event.status !== "PUBLISHED" && event.status !== "COMPLETED") {
        return false;
      }
      if (event.eventType === "INTER_COLLEGE") {
        return true;
      }
      return event.collegeId === user.collegeId;
    });
  }
  async findByCollege(collegeId) {
    return this.realRepository.findByCollege(collegeId);
  }
  async findByOrganizer(organizerId) {
    return this.realRepository.findByOrganizer(organizerId);
  }
  async findPendingReview() {
    return this.realRepository.findPendingReview();
  }
  async create(eventData) {
    return this.realRepository.create(eventData);
  }
  async update(eventId, fields) {
    return this.realRepository.update(eventId, fields);
  }
  async incrementRegistrations(eventId, delta) {
    return this.realRepository.incrementRegistrations(eventId, delta);
  }
  async updateStatus(eventId, status, reason, reviewedBy) {
    return this.realRepository.updateStatus(eventId, status, reason, reviewedBy);
  }
  async delete(eventId) {
    return this.realRepository.delete(eventId);
  }
}
