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

    public List<Event> findByOrganizerId(int organizerId) {
        List<Event> list = new ArrayList<>();
        String sql = "SELECT e.*, c.name as organizingCollegeName FROM EVENT e JOIN COLLEGE c ON e.collegeId = c.collegeId WHERE e.organizerId = ? ORDER BY e.eventId DESC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, organizerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapEvent(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching organizer events: " + e.getMessage());
        }
        return list;
    }

    public List<Event> findPendingReviews() {
        List<Event> list = new ArrayList<>();
        String sql = "SELECT e.*, c.name as organizingCollegeName FROM EVENT e JOIN COLLEGE c ON e.collegeId = c.collegeId WHERE e.status = 'PENDING_REVIEW' ORDER BY e.eventId DESC";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapEvent(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching pending review events: " + e.getMessage());
        }
        return list;
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

    public void decrementRegistrationCount(int eventId) {
        String sql = "UPDATE EVENT SET currentRegistrations = MAX(0, currentRegistrations - 1) WHERE eventId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, eventId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error decrementing registration count: " + e.getMessage());
        }
    }

    public boolean updateStatus(int eventId, String status, String rejectionReason) {
        String sql = "UPDATE EVENT SET status = ?, rejectionReason = ? WHERE eventId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, status);
            pstmt.setString(2, rejectionReason);
            pstmt.setInt(3, eventId);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating event status: " + e.getMessage());
            return false;
        }
    }

    public Event create(Event e) {
        String sql = "INSERT INTO EVENT (title, description, category, eventType, collegeId, organizerId, organizerName, date, startTime, endTime, venue, registrationDeadline, capacity, registrationFee, eligibilityDescription, status, contactInformation, prizePool, minTeamSize, maxTeamSize, speakers, sponsors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, e.getTitle());
            pstmt.setString(2, e.getDescription());
            pstmt.setString(3, e.getCategory());
            pstmt.setString(4, e.getEventType());
            pstmt.setInt(5, e.getCollegeId());
            pstmt.setInt(6, e.getOrganizerId());
            pstmt.setString(7, e.getOrganizerName());
            pstmt.setString(8, e.getDate());
            pstmt.setString(9, e.getStartTime());
            pstmt.setString(10, e.getEndTime());
            pstmt.setString(11, e.getVenue());
            pstmt.setString(12, e.getRegistrationDeadline());
            pstmt.setInt(13, e.getCapacity());
            pstmt.setDouble(14, e.getRegistrationFee());
            pstmt.setString(15, e.getEligibilityDescription() != null ? e.getEligibilityDescription() : "Open to all verified college students");
            pstmt.setString(16, e.getStatus() != null ? e.getStatus() : "PUBLISHED");
            pstmt.setString(17, e.getContactInformation() != null ? e.getContactInformation() : "contact@eventbridge.edu");
            pstmt.setString(18, e.getPrizePool());
            pstmt.setInt(19, e.getMinTeamSize() > 0 ? e.getMinTeamSize() : 1);
            pstmt.setInt(20, e.getMaxTeamSize() > 0 ? e.getMaxTeamSize() : 1);
            pstmt.setString(21, e.getSpeakers());
            pstmt.setString(22, e.getSponsors());
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return findById(rs.getInt(1));
                }
            }
        } catch (SQLException ex) {
            System.err.println("Error creating event: " + ex.getMessage());
        }
        return null;
    }

    public boolean update(Event e) {
        String sql = "UPDATE EVENT SET title = ?, description = ?, category = ?, venue = ?, date = ?, startTime = ?, endTime = ?, registrationDeadline = ?, capacity = ?, registrationFee = ?, prizePool = ?, speakers = ?, sponsors = ? WHERE eventId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, e.getTitle());
            pstmt.setString(2, e.getDescription());
            pstmt.setString(3, e.getCategory());
            pstmt.setString(4, e.getVenue());
            pstmt.setString(5, e.getDate());
            pstmt.setString(6, e.getStartTime());
            pstmt.setString(7, e.getEndTime());
            pstmt.setString(8, e.getRegistrationDeadline());
            pstmt.setInt(9, e.getCapacity());
            pstmt.setDouble(10, e.getRegistrationFee());
            pstmt.setString(11, e.getPrizePool());
            pstmt.setString(12, e.getSpeakers());
            pstmt.setString(13, e.getSponsors());
            pstmt.setInt(14, e.getEventId());
            return pstmt.executeUpdate() > 0;
        } catch (SQLException ex) {
            System.err.println("Error updating event: " + ex.getMessage());
            return false;
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
        try { e.setOrganizingCollegeName(rs.getString("organizingCollegeName")); } catch (Exception ignored) {}
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
        try { e.setPrizePool(rs.getString("prizePool")); } catch (Exception ignored) {}
        try { e.setMinTeamSize(rs.getInt("minTeamSize")); } catch (Exception ignored) {}
        try { e.setMaxTeamSize(rs.getInt("maxTeamSize")); } catch (Exception ignored) {}
        try { e.setSpeakers(rs.getString("speakers")); } catch (Exception ignored) {}
        try { e.setSponsors(rs.getString("sponsors")); } catch (Exception ignored) {}
        try { e.setRejectionReason(rs.getString("rejectionReason")); } catch (Exception ignored) {}
        return e;
    }
}
