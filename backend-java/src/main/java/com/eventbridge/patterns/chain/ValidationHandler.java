package com.eventbridge.patterns.chain;

/**
 * CHAIN OF RESPONSIBILITY DESIGN PATTERN
 * 
 * Abstract base handler for registration rule validation.
 */
public abstract class ValidationHandler {
    protected ValidationHandler next;

    public ValidationHandler setNext(ValidationHandler next) {
        this.next = next;
        return next;
    }

    public abstract ValidationResult handle(ValidationContext context);

    protected ValidationResult checkNext(ValidationContext context) {
        if (next != null) {
            return next.handle(context);
        }
        return ValidationResult.ok();
    }
}
