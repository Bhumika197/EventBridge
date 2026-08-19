import { RegistrationValidationChain } from '../patterns/chain/RegistrationValidationChain';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';
import { UserRepository } from '../repositories/UserRepository';
import { RegistrationConfirmationNotification, InAppChannel, EmailChannel } from '../patterns/bridge/NotificationBridge';
import { Registration, RegistrationValidationResult, User } from '../types';

export class RegistrationService {
  private validationChain: RegistrationValidationChain;
  private regRepo: RegistrationRepository;
  private eventRepo: EventRepository;
  private userRepo: UserRepository;

  constructor() {
    this.validationChain = new RegistrationValidationChain();
    this.regRepo = new RegistrationRepository();
    this.eventRepo = new EventRepository();
    this.userRepo = new UserRepository();
  }

  public async registerStudentForEvent(studentId: number, eventId: number): Promise<{ success: boolean; registration?: Registration; validationResult: RegistrationValidationResult }> {
    const student = await this.userRepo.findById(studentId);
    const event = await this.eventRepo.findById(eventId);

    if (!event) {
      return {
        success: false,
        validationResult: {
          allowed: false,
          reason: 'Target event does not exist.'
        }
      };
    }

    const existingReg = await this.regRepo.findByStudentAndEvent(studentId, eventId);
    const isAlreadyRegistered = !!(existingReg && existingReg.status !== 'CANCELLED');

    // Run the explicit Chain of Responsibility Validation
    const validationResult = await this.validationChain.validate({
      student,
      event,
      isAlreadyRegistered
    });

    if (!validationResult.allowed) {
      return { success: false, validationResult };
    }

    // All validation handlers passed! Proceed with registration
    const registration = await this.regRepo.create(eventId, studentId);
    await this.eventRepo.incrementRegistrations(eventId, 1);

    // Trigger Notification using Bridge Pattern (In-App + Simulated Email)
    const inAppBridge = new RegistrationConfirmationNotification(new InAppChannel());
    const emailBridge = new RegistrationConfirmationNotification(new EmailChannel());

    await inAppBridge.dispatch(studentId, eventId, event.title);
    await emailBridge.dispatch(studentId, eventId, event.title);

    return {
      success: true,
      registration,
      validationResult: { allowed: true }
    };
  }

  public async cancelRegistration(registrationId: number, studentId: number): Promise<void> {
    const reg = await this.regRepo.findById(registrationId);
    if (!reg) {
      throw new Error('Registration record not found.');
    }

    if (reg.studentId !== studentId) {
      throw new Error('Unauthorized: You can only cancel your own registration.');
    }

    if (reg.status === 'CANCELLED') {
      throw new Error('Registration is already cancelled.');
    }

    await this.regRepo.cancel(registrationId);
    await this.eventRepo.incrementRegistrations(reg.eventId, -1);
  }

  public async getStudentRegistrations(studentId: number): Promise<Registration[]> {
    return this.regRepo.findByStudent(studentId);
  }

  public async getEventRegistrations(eventId: number): Promise<Registration[]> {
    return this.regRepo.findByEvent(eventId);
  }
}
