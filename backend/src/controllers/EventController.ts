import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { EventService } from '../services/EventService';
import { ContactRequestRepository } from '../repositories/ContactRequestRepository';
import { EventBuilder } from '../patterns/builder/EventBuilder';
import { EventPrototype } from '../patterns/prototype/EventPrototype';
import { EventCoordinator } from '../patterns/mediator/RegistrationMediator';
import { HackathonWorkflow, CulturalFestWorkflow } from '../patterns/template/EventWorkflow';
import { FeeCalculatorContext } from '../patterns/strategy/FeeStrategy';

export class EventController {
  private eventService = new EventService();
  private contactRepo = new ContactRequestRepository();

  public getEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, limit, search, category, eventType, collegeId, status } = req.query;

      const filters: any = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
        eventType: eventType ? (String(eventType) as any) : undefined,
        collegeId: collegeId ? (collegeId === 'ALL' ? 'ALL' : Number(collegeId)) : undefined,
        status: status ? (String(status) as any) : undefined
      };

      const paginated = await this.eventService.getPaginatedEvents(filters, req.user);
      return res.status(200).json({ success: true, ...paginated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch events.' });
    }
  };

  public getEligibleEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await this.eventService.getEligibleEventsForUser(req.user);
      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch eligible events.' });
    }
  };

  public getEventById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: 'Invalid event ID.' });
      }

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
      return res.status(200).json({ success: true, data: result.event });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch event.' });
    }
  };

  public getOrganizerEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const events = await this.eventService.getEventsByOrganizer(req.user.userId);
      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch organizer events.' });
    }
  };

  public getPendingReviews = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'PLATFORM_ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin permissions required.' });
      }
      const events = await this.eventService.getPendingReviewEvents(req.user);
      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch pending reviews.' });
    }
  };

  public createEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || (req.user.role !== 'EVENT_ORGANIZER' && req.user.role !== 'PLATFORM_ADMIN')) {
        return res.status(403).json({ success: false, message: 'Only Event Organizers or Admins can create events.' });
      }

      const {
        title, description, category, eventType, date, startTime, endTime,
        venue, registrationStartTime, registrationDeadline, capacity, registrationFee, eligibilityDescription, status, contactInformation
      } = req.body;

      if (!title || !description || !category || !eventType || !date || !startTime || !endTime || !venue || !registrationDeadline || !capacity) {
        return res.status(400).json({ success: false, message: 'Missing required event fields.' });
      }

      const newEvent = await this.eventService.createEvent({
        title: title.trim(),
        description: description.trim(),
        category,
        eventType,
        collegeId: req.user.collegeId,
        organizerId: req.user.userId,
        organizerName: req.user.name,
        date,
        startTime,
        endTime,
        venue,
        registrationStartTime: registrationStartTime || undefined,
        registrationDeadline,
        capacity: Number(capacity),
        registrationFee: registrationFee ? Number(registrationFee) : 0,
        eligibilityDescription: eligibilityDescription || 'Open to enrolled students meeting criteria.',
        status: status || 'DRAFT',
        contactInformation: contactInformation || `Organizer: ${req.user.name} (${req.user.email})`
      }, req.user);

      return res.status(201).json({ success: true, data: newEvent });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to create event.' });
    }
  };

  public submitForReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const eventId = Number(req.params.id);
      const updated = await this.eventService.submitForReview(eventId, req.user);
      return res.status(200).json({ success: true, message: 'Event submitted for administrative review.', data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to submit event.' });
    }
  };

  public reviewEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'PLATFORM_ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin permissions required to review events.' });
      }
      const eventId = Number(req.params.id);
      const { decision, rejectionReason } = req.body;

      if (!decision || (decision !== 'APPROVE' && decision !== 'REJECT')) {
        return res.status(400).json({ success: false, message: "Decision must be 'APPROVE' or 'REJECT'." });
      }

      const updated = await this.eventService.reviewEvent(eventId, decision, rejectionReason, req.user);
      return res.status(200).json({
        success: true,
        message: decision === 'APPROVE' ? 'Event approved and published!' : 'Event rejected.',
        data: updated
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Review failed.' });
    }
  };

  public updateEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const eventId = Number(req.params.id);
      const updated = await this.eventService.updateEvent(eventId, req.body, req.user);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to update event.' });
    }
  };

  public cancelEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const eventId = Number(req.params.id);
      const { reason } = req.body;
      await this.eventService.cancelEvent(eventId, reason || 'Cancelled by organizer', req.user);
      return res.status(200).json({ success: true, message: 'Event successfully cancelled.' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to cancel event.' });
    }
  };

  public sendAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const eventId = Number(req.params.id);
      const { announcement } = req.body;
      if (!announcement || !announcement.trim()) {
        return res.status(400).json({ success: false, message: 'Announcement message required.' });
      }
      await this.eventService.broadcastAnnouncement(eventId, announcement.trim(), req.user);
      return res.status(200).json({ success: true, message: 'Announcement broadcast to registered students successfully.' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to send announcement.' });
    }
  };

  public contactOrganizer = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
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
        message: message || ''
      });

      return res.status(201).json({ success: true, data: contact });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to submit contact request.' });
    }
  };

  /**
   * PROTOTYPE PATTERN: Duplicate an existing event
   */
  public cloneEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const eventId = Number(req.params.id);
      const { date, venue, title, registrationDeadline } = req.body || {};

      const duplicated = await this.eventService.cloneEvent(eventId, req.user, {
        date,
        venue,
        title,
        registrationDeadline
      });

      return res.status(201).json({
        success: true,
        message: `Event duplicated successfully using Prototype Pattern (Deep Copy).`,
        data: duplicated
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to duplicate event.' });
    }
  };

  /**
   * MEMENTO PATTERN: Undo last edit to an event
   */
  public undoEventEdit = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const eventId = Number(req.params.id);
      const restored = await this.eventService.undoEventEdit(eventId, req.user);

      return res.status(200).json({
        success: true,
        message: 'Reverted to previous version snapshot via Memento Pattern.',
        data: restored
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Undo operation failed.' });
    }
  };

  /**
   * MEMENTO PATTERN: Get event version history snapshots
   */
  public getEventHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const history = await this.eventService.getEventHistory(eventId);
      return res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to fetch history.' });
    }
  };

  /**
   * BUILDER PATTERN: Step-by-step assembly & validation
   */
  public buildAndValidateEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const b = new EventBuilder();
      const body = req.body || {};

      if (body.title) b.setTitle(body.title);
      if (body.date) b.setDate(body.date);
      if (body.collegeId) b.setCollege(Number(body.collegeId));
      if (body.description) b.setDescription(body.description);
      if (body.category) b.setCategory(body.category);
      if (body.venue) b.setVenue(body.venue);
      if (body.startTime && body.endTime) b.setSchedule(body.startTime, body.endTime);
      if (body.registrationDeadline) b.setRegistrationDeadline(body.registrationDeadline);
      if (body.capacity) b.setCapacity(Number(body.capacity));
      if (body.registrationFee !== undefined) b.setRegistrationFee(Number(body.registrationFee));
      if (body.isInterCollege !== undefined) b.setInterCollege(Boolean(body.isInterCollege));
      if (body.prizePool !== undefined) b.setPrizePool(Number(body.prizePool));
      if (body.minTeamSize && body.maxTeamSize) b.setTeamSize(Number(body.minTeamSize), Number(body.maxTeamSize));
      if (Array.isArray(body.speakers)) b.setSpeakers(body.speakers);
      if (Array.isArray(body.sponsors)) b.setSponsors(body.sponsors);
      if (body.eligibilityDescription) b.setEligibilityDescription(body.eligibilityDescription);
      if (req.user) b.setOrganizer(req.user.userId, req.user.name);

      const validation = b.validate();
      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }

      const builtData = b.build();
      return res.status(200).json({
        success: true,
        message: 'Event successfully assembled and validated by EventBuilder.',
        data: builtData
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Builder assembly failed.' });
    }
  };

  /**
   * TEMPLATE METHOD PATTERN: Execute Hackathon or Cultural Fest workflow
   */
  public runTemplateWorkflow = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { workflowType, event } = req.body || {};
      const workflow = workflowType === 'CulturalFestWorkflow'
        ? new CulturalFestWorkflow()
        : new HackathonWorkflow();

      const sampleEvent = event || {
        title: workflowType === 'CulturalFestWorkflow' ? 'Tarang 2026 Cultural Extravaganza' : 'DevSprint 2026 AI Hackathon',
        category: workflowType === 'CulturalFestWorkflow' ? 'Cultural' : 'Technical',
        venue: 'Main University Amphitheatre',
        date: '2026-11-20',
        capacity: 250,
        prizePool: 50000,
        minTeamSize: 2,
        maxTeamSize: 4
      };

      const report = await workflow.run(sampleEvent);
      return res.status(200).json({ success: true, data: report });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Workflow run failed.' });
    }
  };

  /**
   * MEDIATOR PATTERN: Simulate registration flow coordination
   */
  public simulateMediator = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { student, event, feeOverride } = req.body || {};
      const coordinator = new EventCoordinator();

      const studentData = student || {
        name: req.user?.name || 'Aarav Sharma',
        email: req.user?.email || 'aarav@rcoem.in',
        collegeName: 'RCOEM'
      };

      const eventData = event || {
        title: 'National Robotics Conclave',
        capacity: 100,
        currentRegistrations: 98,
        registrationFee: 150,
        organizerId: 2,
        eventId: 48
      };

      const result = await coordinator.coordinateRegistration(studentData, eventData, feeOverride);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Mediator simulation failed.' });
    }
  };

  /**
   * STRATEGY PATTERN: Calculate pricing with selected strategy
   */
  public calculateFee = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { strategy, context } = req.body || {};
      const selectedStrategy = FeeCalculatorContext.resolveStrategy(strategy || 'StudentIdDiscount');
      const calculator = new FeeCalculatorContext(selectedStrategy);

      const feeContext = context || {
        baseFee: 200,
        isEarlyBird: true,
        isInterCollegeStudent: true,
        teamSize: 4,
        hasStudentId: true
      };

      const breakdown = calculator.calculate(feeContext);
      return res.status(200).json({ success: true, data: breakdown });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Fee calculation failed.' });
    }
  };
}

