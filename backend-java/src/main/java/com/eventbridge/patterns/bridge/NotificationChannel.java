package com.eventbridge.patterns.bridge;

import com.eventbridge.model.NotificationRecord;

public interface NotificationChannel {
    String getChannelType();
    NotificationRecord send(int userId, Integer eventId, String type, String message);
}
