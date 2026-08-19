package com.eventbridge.model;

public class Registration {
    private int registrationId;
    private int eventId;
    private int studentId;
    private String registeredAt;
    private String status; // PENDING, CONFIRMED, CANCELLED, REJECTED
    
    private String eventTitle;
    private String eventCategory;
    private String eventType;
    private String eventDate;
    private String venue;
    private String organizingCollegeName;

    public Registration() {}

    public int getRegistrationId() { return registrationId; }
    public void setRegistrationId(int registrationId) { this.registrationId = registrationId; }

    public int getEventId() { return eventId; }
    public void setEventId(int eventId) { this.eventId = eventId; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getEventCategory() { return eventCategory; }
    public void setEventCategory(String eventCategory) { this.eventCategory = eventCategory; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getOrganizingCollegeName() { return organizingCollegeName; }
    public void setOrganizingCollegeName(String organizingCollegeName) { this.organizingCollegeName = organizingCollegeName; }
}
