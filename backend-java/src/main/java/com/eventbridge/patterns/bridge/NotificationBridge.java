package com.eventbridge.patterns.bridge;

import com.eventbridge.model.NotificationRecord;

/**
 * BRIDGE DESIGN PATTERN
 * 
 * Decouples Notification Abstractions from Delivery Channels.
 */
public abstract class NotificationBridge {
    protected NotificationChannel channel;

    public NotificationBridge(NotificationChannel channel) {
        this.channel = (channel != null) ? channel : new InAppChannel();
    }

    public void setChannel(NotificationChannel channel) {
        this.channel = channel;
    }

    public abstract NotificationRecord dispatch(int userId, Integer eventId, String title, String extraInfo);
}
