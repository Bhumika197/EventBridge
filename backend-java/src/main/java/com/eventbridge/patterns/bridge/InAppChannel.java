package com.eventbridge.patterns.bridge;

import com.eventbridge.model.NotificationRecord;
import com.eventbridge.repository.NotificationRepository;

public class InAppChannel implements NotificationChannel {
    private final NotificationRepository repo = new NotificationRepository();
    
    @Override
    public String getChannelType() { return "In-App"; }
    
    @Override
    public NotificationRecord send(int userId, Integer eventId, String type, String message) {
        return repo.create(userId, eventId, type, "In-App", "[In-App Notice] " + message);
    }
}
