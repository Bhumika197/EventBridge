import { ValidationHandler } from "./ValidationHandler.js";
export class AuthCheckHandler extends ValidationHandler {
  async validate(context) {
    if (!context.student) {
      return {
        allowed: false,
        reason: "Authentication required. Please sign in as a student to register.",
        handlerName: "AuthCheckHandler"
      };
    }
    if (context.student.role !== "STUDENT") {
      return {
        allowed: false,
        reason: "Only registered students can participate in event registrations.",
        handlerName: "AuthCheckHandler"
      };
    }
    return { allowed: true };
  }
}
export class EventStatusHandler extends ValidationHandler {
  async validate(context) {
    const status = context.event.status;
    if (status === "DRAFT" || status === "SUBMITTED" || status === "APPROVED") {
      return {
        allowed: false,
        reason: "This event is not yet published for open registrations.",
        handlerName: "EventStatusHandler"
      };
    }
    if (status === "REJECTED") {
      return {
        allowed: false,
        reason: "This event was not approved for publication.",
        handlerName: "EventStatusHandler"
      };
    }
    if (status === "CANCELLED") {
      return {
        allowed: false,
        reason: "This event has been cancelled by the organizing team.",
        handlerName: "EventStatusHandler"
      };
    }
    if (status === "COMPLETED") {
      return {
        allowed: false,
        reason: "This event has already concluded.",
        handlerName: "EventStatusHandler"
      };
    }
    return { allowed: true };
  }
}
export class VisibilityCheckHandler extends ValidationHandler {
  async validate(context) {
    const { student, event } = context;
    if (event.eventType === "INTRA_COLLEGE") {
      if (!student || student.collegeId !== event.collegeId) {
        return {
          allowed: false,
          reason: `Access Restricted: INTRA_COLLEGE event is open strictly to students of ${event.organizingCollegeName || "the organizing institution"}.`,
          handlerName: "VisibilityCheckHandler"
        };
      }
    }
    return { allowed: true };
  }
}
export class CollegeEligibilityHandler extends ValidationHandler {
  async validate(context) {
    const { student, event } = context;
    if (event.eventType === "INTRA_COLLEGE" && student?.collegeId !== event.collegeId) {
      return {
        allowed: false,
        reason: `College Ineligibility: You are registered under College #${student?.collegeId}, but this event requires membership in College #${event.collegeId}.`,
        handlerName: "CollegeEligibilityHandler"
      };
    }
    return { allowed: true };
  }
}
export class DeadlineCheckHandler extends ValidationHandler {
  async validate(context) {
    const now = Date.now();
    if (context.event.registrationStartTime) {
      const startTime = new Date(context.event.registrationStartTime).getTime();
      if (!isNaN(startTime) && now < startTime) {
        return {
          allowed: false,
          reason: `Registration Not Started: Registration opens on ${context.event.registrationStartTime}.`,
          handlerName: "DeadlineCheckHandler"
        };
      }
    }
    const deadline = new Date(context.event.registrationDeadline).getTime();
    if (!isNaN(deadline) && now > deadline) {
      return {
        allowed: false,
        reason: `Registration Deadline Expired: The deadline (${context.event.registrationDeadline}) has passed.`,
        handlerName: "DeadlineCheckHandler"
      };
    }
    return { allowed: true };
  }
}
export class DuplicateRegistrationHandler extends ValidationHandler {
  async validate(context) {
    if (context.isAlreadyRegistered) {
      return {
        allowed: false,
        reason: "Duplicate Registration: You are already registered or on the waitlist for this event.",
        handlerName: "DuplicateRegistrationHandler"
      };
    }
    return { allowed: true };
  }
}
