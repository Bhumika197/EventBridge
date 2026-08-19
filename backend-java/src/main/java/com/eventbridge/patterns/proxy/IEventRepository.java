package com.eventbridge.patterns.proxy;

import com.eventbridge.model.Event;
import com.eventbridge.model.User;
import java.util.List;

/**
 * PROXY DESIGN PATTERN - Subject Interface
 */
public interface IEventRepository {
    Event findById(int id);
    List<Event> findAll();
    List<Event> findAllEligibleForUser(User user);
}
