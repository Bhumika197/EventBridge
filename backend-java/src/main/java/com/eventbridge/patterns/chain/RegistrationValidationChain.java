package com.eventbridge.patterns.chain;

import com.eventbridge.model.Event;
import com.eventbridge.model.User;

public class RegistrationValidationChain {
    private final ValidationHandler head;

    public RegistrationValidationChain() {
        ValidationHandler authCheck = new AuthCheckHandler();
        ValidationHandler statusCheck = new EventStatusHandler();
        ValidationHandler visibilityCheck = new VisibilityCheckHandler();
        ValidationHandler collegeCheck = new CollegeEligibilityHandler();
        ValidationHandler deadlineCheck = new DeadlineCheckHandler();
        ValidationHandler capacityCheck = new CapacityCheckHandler();
        ValidationHandler dupCheck = new DuplicateRegistrationHandler();

        authCheck.setNext(statusCheck)
                 .setNext(visibilityCheck)
                 .setNext(collegeCheck)
                 .setNext(deadlineCheck)
                 .setNext(capacityCheck)
                 .setNext(dupCheck);

        this.head = authCheck;
    }

    public ValidationResult validate(User user, Event event, boolean isDuplicate) {
        ValidationContext ctx = new ValidationContext(user, event, isDuplicate);
        return head.handle(ctx);
    }
}

class AuthCheckHandler extends ValidationHandler {
    @Override
    public ValidationResult handle(ValidationContext context) {
        if (context.getUser() == null) {
            return ValidationResult.reject("Authentication required. Please log in.", "AuthCheckHandler");
        }
        return checkNext(context);
    }
}

class EventStatusHandler extends ValidationHandler {
    @Override
    public ValidationResult handle(ValidationContext context) {
        Event e = context.getEvent();
        if (e == null || "CANCELLED".equalsIgnoreCase(e.getStatus())) {
            return ValidationResult.reject("Event has been cancelled by the organizer.", "EventStatusHandler");
        }
        if ("REGISTRATION_CLOSED".equalsIgnoreCase(e.getStatus())) {
            return ValidationResult.reject("Registration is officially closed for this event.", "EventStatusHandler");
        }
        return checkNext(context);
    }
}

class VisibilityCheckHandler extends ValidationHandler {
    @Override
    public ValidationResult handle(ValidationContext context) {
        User u = context.getUser();
        Event e = context.getEvent();
        if ("INTRA_COLLEGE".equalsIgnoreCase(e.getEventType()) && u.getCollegeId() != e.getCollegeId()) {
            return ValidationResult.reject("This event is an INTRA-COLLEGE event restricted to students of " + e.getOrganizingCollegeName(), "VisibilityCheckHandler");
        }
        return checkNext(context);
    }
}

class CollegeEligibilityHandler extends ValidationHandler {
    @Override
    public ValidationResult handle(ValidationContext context) {
        User u = context.getUser();
        Event e = context.getEvent();
        if (!"STUDENT".equalsIgnoreCase(u.getRole())) {
            return ValidationResult.reject("Only registered student accounts may sign up for events.", "CollegeEligibilityHandler");
        }
        return checkNext(context);
    }
}

class DeadlineCheckHandler extends ValidationHandler {
    @Override
    public ValidationResult handle(ValidationContext context) {
        // Deadline check logic
        return checkNext(context);
    }
}

class CapacityCheckHandler extends ValidationHandler {
    @Override
    public ValidationResult handle(ValidationContext context) {
        Event e = context.getEvent();
        if (e.getCurrentRegistrations() >= e.getCapacity()) {
            return ValidationResult.reject("Event has reached maximum seat capacity (" + e.getCapacity() + ").", "CapacityCheckHandler");
        }
        return checkNext(context);
    }
}

class DuplicateRegistrationHandler extends ValidationHandler {
    @Override
    public ValidationResult handle(ValidationContext context) {
        if (context.isDuplicate()) {
            return ValidationResult.reject("You are already registered for this event.", "DuplicateRegistrationHandler");
        }
        return checkNext(context);
    }
}
