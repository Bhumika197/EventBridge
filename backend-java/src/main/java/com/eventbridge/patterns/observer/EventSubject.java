package com.eventbridge.patterns.observer;

import com.eventbridge.model.Event;
import com.eventbridge.patterns.bridge.EmailChannel;
import com.eventbridge.patterns.bridge.InAppChannel;
import com.eventbridge.patterns.bridge.NotificationBridge;
import com.eventbridge.patterns.bridge.RegistrationConfirmationNotification;
import java.util.ArrayList;
import java.util.List;

/**
 * OBSERVER DESIGN PATTERN
 * 
 * Subject broadcasting event state changes to registered observers.
 */
public class EventSubject {
    private final List<IEventObserver> observers = new ArrayList<>();

    public EventSubject() {
        // Register default observers
        observers.add(new RegisteredStudentsObserver());
        observers.add(new OrganizerObserver());
        observers.add(new AdminAuditObserver());
    }

    public void attach(IEventObserver observer) {
        observers.add(observer);
    }

    public void detach(IEventObserver observer) {
        observers.remove(observer);
    }

    public void notifyObservers(Event event, String changeType, String message) {
        for (IEventObserver obs : observers) {
            obs.onEventChanged(event, changeType, message);
        }
    }
}

interface IEventObserver {
    void onEventChanged(Event event, String changeType, String message);
}

class RegisteredStudentsObserver implements IEventObserver {
    @Override
    public void onEventChanged(Event event, String changeType, String message) {
        System.out.println("📢 [RegisteredStudentsObserver] Event #" + event.getEventId() + " (" + event.getTitle() + ") changed: " + changeType + ". Broadcast message: " + message);
    }
}

class OrganizerObserver implements IEventObserver {
    @Override
    public void onEventChanged(Event event, String changeType, String message) {
        System.out.println("📋 [OrganizerObserver] Event organizer notified of state change for " + event.getTitle());
    }
}

class AdminAuditObserver implements IEventObserver {
    @Override
    public void onEventChanged(Event event, String changeType, String message) {
        System.out.println("🛡️ [AdminAuditObserver] Audit Log entry recorded for Event #" + event.getEventId() + " - Action: " + changeType);
    }
}
