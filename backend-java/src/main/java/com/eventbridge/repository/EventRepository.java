package com.eventbridge.repository;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.Event;
import com.eventbridge.patterns.proxy.IEventRepository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EventRepository implements IEventRepository {
    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    @Override
    public Event findById(int id) {
        String sql = "SELECT e.*, c.name as organizingCollegeName FROM EVENT e JOIN COLLEGE c ON e.collegeId = c.collegeId WHERE e.eventId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapEvent(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding event by ID: " + e.getMessage());
        }
        return null;
    }

    @Override
    public List<Event> findAll() {
        List<Event> list = new ArrayList<>();
        String sql = "SELECT e.*, c.name as organizingCollegeName FROM EVENT e JOIN COLLEGE c ON e.collegeId = c.collegeId ORDER BY e.eventId DESC";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapEvent(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching all events: " + e.getMessage());
        }
        return list;
    }

    @Override
    public List<Event> findAllEligibleForUser(com.eventbridge.model.User user) {
        return findAll();
    }

    public void incrementRegistrationCount(int eventId) {
        String sql = "UPDATE EVENT SET currentRegistrations = currentRegistrations + 1 WHERE eventId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, eventId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error updating registration count: " + e.getMessage());
        }
    }

    private Event mapEvent(ResultSet rs) throws SQLException {
        Event e = new Event();
        e.setEventId(rs.getInt("eventId"));
        e.setTitle(rs.getString("title"));
        e.setDescription(rs.getString("description"));
        e.setCategory(rs.getString("category"));
        e.setEventType(rs.getString("eventType"));
        e.setCollegeId(rs.getInt("collegeId"));
        e.setOrganizingCollegeName(rs.getString("organizingCollegeName"));
        e.setOrganizerId(rs.getInt("organizerId"));
        e.setOrganizerName(rs.getString("organizerName"));
        e.setDate(rs.getString("date"));
        e.setStartTime(rs.getString("startTime"));
        e.setEndTime(rs.getString("endTime"));
        e.setVenue(rs.getString("venue"));
        e.setRegistrationDeadline(rs.getString("registrationDeadline"));
        e.setCapacity(rs.getInt("capacity"));
        e.setCurrentRegistrations(rs.getInt("currentRegistrations"));
        e.setRegistrationFee(rs.getDouble("registrationFee"));
        e.setEligibilityDescription(rs.getString("eligibilityDescription"));
        e.setStatus(rs.getString("status"));
        e.setContactInformation(rs.getString("contactInformation"));
        return e;
    }
}
