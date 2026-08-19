package com.eventbridge.patterns.chain;

import com.eventbridge.model.Event;
import com.eventbridge.model.User;

public class ValidationContext {
    private User user;
    private Event event;
    private boolean isDuplicate;

    public ValidationContext(User user, Event event, boolean isDuplicate) {
        this.user = user;
        this.event = event;
        this.isDuplicate = isDuplicate;
    }

    public User getUser() { return user; }
    public Event getEvent() { return event; }
    public boolean isDuplicate() { return isDuplicate; }
}
