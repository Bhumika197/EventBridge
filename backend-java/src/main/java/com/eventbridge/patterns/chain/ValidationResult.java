package com.eventbridge.patterns.chain;

public class ValidationResult {
    private final boolean allowed;
    private final String reason;
    private final String handlerName;

    public ValidationResult(boolean allowed, String reason, String handlerName) {
        this.allowed = allowed;
        this.reason = reason;
        this.handlerName = handlerName;
    }

    public static ValidationResult ok() {
        return new ValidationResult(true, null, null);
    }

    public static ValidationResult reject(String reason, String handlerName) {
        return new ValidationResult(false, reason, handlerName);
    }

    public boolean isAllowed() { return allowed; }
    public String getReason() { return reason; }
    public String getHandlerName() { return handlerName; }
}
