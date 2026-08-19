import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { EventService } from '../services/EventService';
import { ContactRequestRepository } from '../repositories/ContactRequestRepository';

export class EventController {
  private eventService = new EventService();
  private contactRepo = new ContactRequestRepository();

  public getEligibleEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await this.eventService.getEligibleEventsForUser(req.user);
      return res.json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getEventById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const result = await this.eventService.getEventByIdForUser(eventId, req.user);
      if (result.restricted) {
        return res.status(403).json({
          success: false,
          restricted: true,
          message: result.reason
        });
      }
      if (!result.event) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }
      return res.json({ success: true, data: result.event });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getOrganizerEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const events = await this.eventService.getEventsByOrganizer(req.user.userId);
      return res.json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public createEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || (req.user.role !== 'EVENT_ORGANIZER' && req.user.role !== 'PLATFORM_ADMIN')) {
        return res.status(403).json({ success: false, message: 'Only Event Organizers or Admins can create events.' });
      }

      const {
        title, description, category, eventType, date, startTime, endTime,
        venue, registrationDeadline, capacity, registrationFee, eligibilityDescription, status, contactInformation
      } = req.body;

      if (!title || !description || !category || !eventType || !date || !startTime || !endTime || !venue || !registrationDeadline || !capacity) {
        return res.status(400).json({ success: false, message: 'Missing required event fields.' });
      }

      const newEvent = await this.eventService.createEvent({
        title,
        description,
        category,
        eventType,
        collegeId: req.user.collegeId,
        organizerId: req.user.userId,
        organizerName: req.user.name,
        date,
        startTime,
        endTime,
        venue,
        registrationDeadline,
        capacity: Number(capacity),
        registrationFee: registrationFee ? Number(registrationFee) : 0,
        eligibilityDescription: eligibilityDescription || 'Open to eligible students.',
        status: status || 'PUBLISHED',
        contactInformation: contactInformation || `Organizer: ${req.user.name} (${req.user.email})`
      });

      return res.status(201).json({ success: true, data: newEvent });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public updateEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const updated = await this.eventService.updateEvent(eventId, req.body, req.user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public cancelEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const { reason } = req.body;
      await this.eventService.cancelEvent(eventId, reason || 'Cancelled by organizer', req.user);
      return res.json({ success: true, message: 'Event successfully cancelled.' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public sendAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const { announcement } = req.body;
      if (!announcement) {
        return res.status(400).json({ success: false, message: 'Announcement message required.' });
      }
      await this.eventService.broadcastAnnouncement(eventId, announcement, req.user);
      return res.json({ success: true, message: 'Announcement broadcast to registered students successfully.' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public contactOrganizer = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const { subject, message } = req.body;
      const eventResult = await this.eventService.getEventByIdForUser(eventId, req.user);
      if (!eventResult.event) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }

      const contact = await this.contactRepo.create({
        studentId: req.user.userId,
        organizerId: eventResult.event.organizerId,
        eventId,
        subject: subject || `Inquiry about ${eventResult.event.title}`,
        message
      });

      return res.status(201).json({ success: true, data: contact });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
}
