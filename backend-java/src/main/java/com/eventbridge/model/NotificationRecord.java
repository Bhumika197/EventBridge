package com.eventbridge.model;

public class NotificationRecord {
    private int notificationId;
    private int userId;
    private Integer eventId;
    private String type;
    private String channel;
    private String message;
    private int readStatus;
    private String createdAt;

    public NotificationRecord() {}

    public int getNotificationId() { return notificationId; }
    public void setNotificationId(int notificationId) { this.notificationId = notificationId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public Integer getEventId() { return eventId; }
    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getReadStatus() { return readStatus; }
    public void setReadStatus(int readStatus) { this.readStatus = readStatus; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
