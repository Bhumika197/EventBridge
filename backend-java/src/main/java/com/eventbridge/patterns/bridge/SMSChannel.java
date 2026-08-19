package com.eventbridge.patterns.bridge;

import com.eventbridge.model.NotificationRecord;
import com.eventbridge.repository.NotificationRepository;

public class SMSChannel implements NotificationChannel {
    private final NotificationRepository repo = new NotificationRepository();

    @Override
    public String getChannelType() { return "SMS"; }

    @Override
    public NotificationRecord send(int userId, Integer eventId, String type, String message) {
        System.out.println("📱 [Java SMS Dispatch] To User #" + userId + " | Msg: " + message);
        return repo.create(userId, eventId, type, "SMS", "[SMS Dispatch] " + message);
    }
}
