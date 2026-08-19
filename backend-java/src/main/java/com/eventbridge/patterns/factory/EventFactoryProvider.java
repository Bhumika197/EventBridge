package com.eventbridge.patterns.factory;

import com.eventbridge.model.Event;

public class EventFactoryProvider {
    public static EventFactory getFactory(String category) {
        if ("Technical".equalsIgnoreCase(category)) return new TechnicalEventFactory();
        if ("Cultural".equalsIgnoreCase(category)) return new CulturalEventFactory();
        if ("Sports".equalsIgnoreCase(category)) return new SportsEventFactory();
        return new TechnicalEventFactory(); // default
    }
}

class TechnicalEventFactory extends EventFactory {
    @Override
    public Event createEvent(String title, String description, String eventType, int collegeId, int organizerId, String organizerName, String date, String startTime, String endTime, String venue, String deadline, int capacity, double fee) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(description);
        e.setCategory("Technical");
        e.setEventType(eventType);
        e.setCollegeId(collegeId);
        e.setOrganizerId(organizerId);
        e.setOrganizerName(organizerName);
        e.setDate(date);
        e.setStartTime(startTime);
        e.setEndTime(endTime);
        e.setVenue(venue);
        e.setRegistrationDeadline(deadline);
        e.setCapacity(capacity);
        e.setRegistrationFee(fee);
        e.setEligibilityDescription("Technical Event: Open to enrolled engineering and technology students.");
        e.setStatus("REGISTRATION_OPEN");
        e.setContactInformation(organizerName + " | Tech Cell");
        return e;
    }
}

class CulturalEventFactory extends EventFactory {
    @Override
    public Event createEvent(String title, String description, String eventType, int collegeId, int organizerId, String organizerName, String date, String startTime, String endTime, String venue, String deadline, int capacity, double fee) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(description);
        e.setCategory("Cultural");
        e.setEventType(eventType);
        e.setCollegeId(collegeId);
        e.setOrganizerId(organizerId);
        e.setOrganizerName(organizerName);
        e.setDate(date);
        e.setStartTime(startTime);
        e.setEndTime(endTime);
        e.setVenue(venue);
        e.setRegistrationDeadline(deadline);
        e.setCapacity(capacity);
        e.setRegistrationFee(fee);
        e.setEligibilityDescription("Cultural Event: Open to all creative arts and music enthusiasts.");
        e.setStatus("REGISTRATION_OPEN");
        e.setContactInformation(organizerName + " | Cultural Club");
        return e;
    }
}

class SportsEventFactory extends EventFactory {
    @Override
    public Event createEvent(String title, String description, String eventType, int collegeId, int organizerId, String organizerName, String date, String startTime, String endTime, String venue, String deadline, int capacity, double fee) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(description);
        e.setCategory("Sports");
        e.setEventType(eventType);
        e.setCollegeId(collegeId);
        e.setOrganizerId(organizerId);
        e.setOrganizerName(organizerName);
        e.setDate(date);
        e.setStartTime(startTime);
        e.setEndTime(endTime);
        e.setVenue(venue);
        e.setRegistrationDeadline(deadline);
        e.setCapacity(capacity);
        e.setRegistrationFee(fee);
        e.setEligibilityDescription("Sports Championship: Physical fitness certificate required.");
        e.setStatus("REGISTRATION_OPEN");
        e.setContactInformation(organizerName + " | Sports Department");
        return e;
    }
}
