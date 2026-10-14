import { RegistrationValidationChain } from "../patterns/chain/RegistrationValidationChain";
import { RegistrationRepository } from "../repositories/RegistrationRepository";
import { EventRepository } from "../repositories/EventRepository";
import { UserRepository } from "../repositories/UserRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { WaitlistService } from "./WaitlistService";
import { logger } from "../utils/logger";
export class RegistrationService {
  validationChain;
  regRepo;
  eventRepo;
  userRepo;
  notifRepo;
  waitlistService;
  constructor() {
    this.validationChain = new RegistrationValidationChain();
    this.regRepo = new RegistrationRepository();
    this.eventRepo = new EventRepository();
    this.userRepo = new UserRepository();
    this.notifRepo = new NotificationRepository();
    this.waitlistService = new WaitlistService();
  }
  async registerStudentForEvent(studentId, eventId) {
    const student = await this.userRepo.findById(studentId);
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      return {
        success: false,
        validationResult: {
          allowed: false,
          reason: "Target event does not exist."
        }
      };
    }
    const existingReg = await this.regRepo.findByStudentAndEvent(studentId, eventId);
    const isAlreadyRegistered = !!(existingReg && existingReg.status !== "CANCELLED");
    const validationResult = await this.validationChain.validate({
      student,
      event,
      isAlreadyRegistered
    });
    if (!validationResult.allowed) {
      return { success: false, validationResult };
    }
    const confirmedCount = await this.regRepo.countConfirmed(eventId);
    if (confirmedCount < event.capacity) {
      const registration = await this.regRepo.createConfirmed(eventId, studentId);
      await this.eventRepo.incrementRegistrations(eventId, 1);
      logger.info(`Confirmed registration: Student #${studentId} for Event #${eventId} ("${event.title}")`);
      await this.notifRepo.create(
        studentId,
        eventId,
        "Registration Confirmation",
        "In-App",
        `Your registration for "${event.title}" has been confirmed! See you at ${event.venue}.`
      );
      return {
        success: true,
        status: "CONFIRMED",
        registration,
        validationResult: { allowed: true }
      };
    } else {
      const waitlistReg = await this.waitlistService.addToWaitlist(studentId, eventId);
      await this.notifRepo.create(
        studentId,
        eventId,
        "Waitlist Confirmation",
        "In-App",
        `Event "${event.title}" is full. You are on the waitlist at queue position #${waitlistReg.queuePosition}. We will notify you if a spot opens!`
      );
      return {
        success: true,
        status: "WAITLISTED",
        registration: waitlistReg,
        queuePosition: waitlistReg.queuePosition,
        validationResult: { allowed: true, canJoinWaitlist: true }
      };
    }
  }
  async cancelRegistration(registrationId, studentId) {
    const reg = await this.regRepo.findById(registrationId);
    if (!reg) {
      throw new Error("Registration record not found.");
    }
    if (reg.studentId !== studentId) {
      throw new Error("Unauthorized: You can only cancel your own registration.");
    }
    if (reg.status === "CANCELLED") {
      throw new Error("Registration is already cancelled.");
    }
    const previousStatus = reg.status;
    const eventId = reg.eventId;
    await this.regRepo.cancel(registrationId);
    let promoted = null;
    if (previousStatus === "CONFIRMED") {
      await this.eventRepo.incrementRegistrations(eventId, -1);
      logger.info(`Registration #${registrationId} CANCELLED by Student #${studentId} for Event #${eventId}`);
      promoted = await this.waitlistService.promoteNextInQueue(eventId);
    } else {
      logger.info(`Waitlist reservation #${registrationId} CANCELLED by Student #${studentId} for Event #${eventId}`);
    }
    return { success: true, promotedStudent: promoted };
  }
  async getStudentRegistrations(studentId) {
    return this.regRepo.findByStudent(studentId);
  }
  async getEventRegistrations(eventId) {
    return this.regRepo.findByEvent(eventId);
  }
}
