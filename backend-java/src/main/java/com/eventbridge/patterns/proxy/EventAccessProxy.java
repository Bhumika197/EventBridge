package com.eventbridge.patterns.proxy;

import com.eventbridge.model.Event;
import com.eventbridge.model.User;
import com.eventbridge.repository.EventRepository;
import java.util.ArrayList;
import java.util.List;

/**
 * PROXY DESIGN PATTERN - Concrete Proxy
 * 
 * Enforces college-specific visibility and role permissions before delegating to Real Subject.
 */
public class EventAccessProxy implements IEventRepository {
    private final EventRepository realRepository;

    public EventAccessProxy() {
        this.realRepository = new EventRepository();
    }

    @Override
    public Event findById(int id) {
        return realRepository.findById(id);
    }

    @Override
    public List<Event> findAll() {
        return realRepository.findAll();
    }

    @Override
    public List<Event> findAllEligibleForUser(User user) {
        List<Event> allEvents = realRepository.findAll();
        if (user == null) {
            // Guest users see all INTER_COLLEGE events
            List<Event> publicEvents = new ArrayList<>();
            for (Event e : allEvents) {
                if ("INTER_COLLEGE".equalsIgnoreCase(e.getEventType())) {
                    publicEvents.add(e);
                }
            }
            return publicEvents;
        }

        if ("PLATFORM_ADMIN".equalsIgnoreCase(user.getRole())) {
            return allEvents; // Admins view all
        }

        // Students & Organizers see INTER_COLLEGE + INTRA_COLLEGE of their own institution
        List<Event> eligible = new ArrayList<>();
        for (Event e : allEvents) {
            if ("INTER_COLLEGE".equalsIgnoreCase(e.getEventType()) || e.getCollegeId() == user.getCollegeId()) {
                eligible.add(e);
            }
        }
        return eligible;
    }
}
