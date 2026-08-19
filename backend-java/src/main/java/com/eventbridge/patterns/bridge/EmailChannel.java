package com.eventbridge.patterns.bridge;

import com.eventbridge.model.NotificationRecord;
import com.eventbridge.repository.NotificationRepository;

public class EmailChannel implements NotificationChannel {
    private final NotificationRepository repo = new NotificationRepository();

    @Override
    public String getChannelType() { return "Email"; }

    @Override
    public NotificationRecord send(int userId, Integer eventId, String type, String message) {
        System.out.println("✉️ [Java Email Dispatch] To User #" + userId + " | " + type + " | Msg: " + message);
        return repo.create(userId, eventId, type, "Email", "[Simulated Email] " + message);
    }
}
