import { ValidationHandler, ValidationContext } from './ValidationHandler';
import { RegistrationValidationResult } from '../../types';

// 1. Authentication Check Handler
export class AuthCheckHandler extends ValidationHandler {
  protected async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    if (!context.student) {
      return {
        allowed: false,
        reason: 'Authentication required. Please log in as a student to register.',
        handlerName: 'AuthCheckHandler'
      };
    }
    if (context.student.role !== 'STUDENT') {
      return {
        allowed: false,
        reason: 'Only registered students can participate in event registrations.',
        handlerName: 'AuthCheckHandler'
      };
    }
    return { allowed: true };
  }
}

// 2. Event Status Check Handler
export class EventStatusHandler extends ValidationHandler {
  protected async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    const status = context.event.status;
    if (status === 'DRAFT') {
      return {
        allowed: false,
        reason: 'This event is currently in draft mode and not accepting registrations.',
        handlerName: 'EventStatusHandler'
      };
    }
    if (status === 'CANCELLED') {
      return {
        allowed: false,
        reason: 'This event has been cancelled by the organizer.',
        handlerName: 'EventStatusHandler'
      };
    }
    if (status === 'COMPLETED') {
      return {
        allowed: false,
        reason: 'This event has already been completed.',
        handlerName: 'EventStatusHandler'
      };
    }
    if (status === 'REGISTRATION_CLOSED') {
      return {
        allowed: false,
        reason: 'Registration for this event is currently closed.',
        handlerName: 'EventStatusHandler'
      };
    }
    return { allowed: true };
  }
}

// 3. Event Visibility Check Handler
export class VisibilityCheckHandler extends ValidationHandler {
  protected async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    const { student, event } = context;
    if (event.eventType === 'INTRA_COLLEGE') {
      if (student && student.collegeId !== event.collegeId) {
        return {
          allowed: false,
          reason: `Access Restricted: This is an INTRA_COLLEGE event restricted strictly to ${event.organizingCollegeName || 'the organizing college'}.`,
          handlerName: 'VisibilityCheckHandler'
        };
      }
    }
    return { allowed: true };
  }
}

// 4. College Eligibility Check Handler
export class CollegeEligibilityHandler extends ValidationHandler {
  protected async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    const { student, event } = context;
    if (event.eventType === 'INTRA_COLLEGE' && student?.collegeId !== event.collegeId) {
      return {
        allowed: false,
        reason: `College Ineligibility: You belong to College ID #${student?.collegeId}, but this event requires membership in College ID #${event.collegeId}.`,
        handlerName: 'CollegeEligibilityHandler'
      };
    }
    return { allowed: true };
  }
}

// 5. Registration Deadline Check Handler
export class DeadlineCheckHandler extends ValidationHandler {
  protected async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    const deadline = new Date(context.event.registrationDeadline).getTime();
    const now = new Date().getTime();
    if (!isNaN(deadline) && now > deadline) {
      return {
        allowed: false,
        reason: `Registration Deadline Expired: The deadline (${context.event.registrationDeadline}) has passed.`,
        handlerName: 'DeadlineCheckHandler'
      };
    }
    return { allowed: true };
  }
}

// 6. Capacity Check Handler
export class CapacityCheckHandler extends ValidationHandler {
  protected async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    const { event } = context;
    if (event.currentRegistrations >= event.capacity) {
      return {
        allowed: false,
        reason: `Event Full: Maximum capacity of ${event.capacity} participants has been reached.`,
        handlerName: 'CapacityCheckHandler'
      };
    }
    return { allowed: true };
  }
}

// 7. Duplicate Registration Check Handler
export class DuplicateRegistrationHandler extends ValidationHandler {
  protected async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    if (context.isAlreadyRegistered) {
      return {
        allowed: false,
        reason: 'Already Registered: You are already registered for this event.',
        handlerName: 'DuplicateRegistrationHandler'
      };
    }
    return { allowed: true };
  }
}
