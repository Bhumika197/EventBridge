package com.eventbridge.model;

public class Event {
    private int eventId;
    private String title;
    private String description;
    private String category;
    private String eventType; // INTRA_COLLEGE, INTER_COLLEGE
    private int collegeId;
    private String organizingCollegeName;
    private int organizerId;
    private String organizerName;
    private String date;
    private String startTime;
    private String endTime;
    private String venue;
    private String registrationDeadline;
    private int capacity;
    private int currentRegistrations;
    private double registrationFee;
    private String eligibilityDescription;
    private String status; // REGISTRATION_OPEN, CANCELLED, etc.
    private String contactInformation;
    private String createdAt;

    public Event() {}

    public int getEventId() { return eventId; }
    public void setEventId(int eventId) { this.eventId = eventId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public int getCollegeId() { return collegeId; }
    public void setCollegeId(int collegeId) { this.collegeId = collegeId; }

    public String getOrganizingCollegeName() { return organizingCollegeName; }
    public void setOrganizingCollegeName(String organizingCollegeName) { this.organizingCollegeName = organizingCollegeName; }

    public int getOrganizerId() { return organizerId; }
    public void setOrganizerId(int organizerId) { this.organizerId = organizerId; }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(String registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getCurrentRegistrations() { return currentRegistrations; }
    public void setCurrentRegistrations(int currentRegistrations) { this.currentRegistrations = currentRegistrations; }

    public double getRegistrationFee() { return registrationFee; }
    public void setRegistrationFee(double registrationFee) { this.registrationFee = registrationFee; }

    public String getEligibilityDescription() { return eligibilityDescription; }
    public void setEligibilityDescription(String eligibilityDescription) { this.eligibilityDescription = eligibilityDescription; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getContactInformation() { return contactInformation; }
    public void setContactInformation(String contactInformation) { this.contactInformation = contactInformation; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
