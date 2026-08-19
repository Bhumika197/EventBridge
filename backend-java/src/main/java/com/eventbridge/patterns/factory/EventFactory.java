package com.eventbridge.patterns.factory;

import com.eventbridge.model.Event;

/**
 * FACTORY METHOD DESIGN PATTERN
 * 
 * Defines abstract creation interface for category-specific events.
 */
public abstract class EventFactory {
    public abstract Event createEvent(
        String title, String description, String eventType, int collegeId,
        int organizerId, String organizerName, String date, String startTime,
        String endTime, String venue, String deadline, int capacity, double fee
    );
}
