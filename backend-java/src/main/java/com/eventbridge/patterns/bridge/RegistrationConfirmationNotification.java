package com.eventbridge.patterns.bridge;

import com.eventbridge.model.NotificationRecord;

public class RegistrationConfirmationNotification extends NotificationBridge {
    public RegistrationConfirmationNotification(NotificationChannel channel) {
        super(channel);
    }

    @Override
    public NotificationRecord dispatch(int userId, Integer eventId, String eventTitle, String extraInfo) {
        String type = "Registration Confirmation";
        String message = "Your registration for \"" + eventTitle + "\" has been successfully confirmed. See you there!";
        return channel.send(userId, eventId, type, message);
    }
}
