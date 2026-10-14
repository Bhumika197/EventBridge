package com.eventbridge.repository;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.Registration;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class RegistrationRepository {
    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    public Registration findByStudentAndEvent(int studentId, int eventId) {
        String sql = "SELECT * FROM REGISTRATION WHERE studentId = ? AND eventId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, studentId);
            pstmt.setInt(2, eventId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Registration r = new Registration();
                    r.setRegistrationId(rs.getInt("registrationId"));
                    r.setEventId(rs.getInt("eventId"));
                    r.setStudentId(rs.getInt("studentId"));
                    r.setStatus(rs.getString("status"));
                    return r;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding registration: " + e.getMessage());
        }
        return null;
    }

    public List<Registration> findByStudent(int studentId) {
        List<Registration> list = new ArrayList<>();
        String sql = "SELECT r.*, e.title as eventTitle, e.category as eventCategory, e.eventType, e.date as eventDate, e.venue, c.name as organizingCollegeName " +
                     "FROM REGISTRATION r " +
                     "JOIN EVENT e ON r.eventId = e.eventId " +
                     "JOIN COLLEGE c ON e.collegeId = c.collegeId " +
                     "WHERE r.studentId = ? ORDER BY r.registrationId DESC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, studentId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Registration r = new Registration();
                    r.setRegistrationId(rs.getInt("registrationId"));
                    r.setEventId(rs.getInt("eventId"));
                    r.setStudentId(rs.getInt("studentId"));
                    r.setRegisteredAt(rs.getString("registeredAt"));
                    r.setStatus(rs.getString("status"));
                    r.setEventTitle(rs.getString("eventTitle"));
                    r.setEventCategory(rs.getString("eventCategory"));
                    r.setEventType(rs.getString("eventType"));
                    r.setEventDate(rs.getString("eventDate"));
                    r.setVenue(rs.getString("venue"));
                    r.setOrganizingCollegeName(rs.getString("organizingCollegeName"));
                    list.add(r);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding registrations for student: " + e.getMessage());
        }
        return list;
    }

    public List<Map<String, Object>> findByEvent(int eventId) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT r.registrationId, r.registeredAt, r.status, u.userId, u.name as studentName, u.email as studentEmail, c.name as studentCollege " +
                     "FROM REGISTRATION r " +
                     "JOIN USER u ON r.studentId = u.userId " +
                     "JOIN COLLEGE c ON u.collegeId = c.collegeId " +
                     "WHERE r.eventId = ? ORDER BY r.registrationId ASC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, eventId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("registrationId", rs.getInt("registrationId"));
                    map.put("registeredAt", rs.getString("registeredAt"));
                    map.put("status", rs.getString("status"));
                    map.put("studentId", rs.getInt("userId"));
                    map.put("studentName", rs.getString("studentName"));
                    map.put("studentEmail", rs.getString("studentEmail"));
                    map.put("studentCollege", rs.getString("studentCollege"));
                    list.add(map);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding registrations for event: " + e.getMessage());
        }
        return list;
    }

    public boolean delete(int registrationId) {
        String sql = "DELETE FROM REGISTRATION WHERE registrationId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, registrationId);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting registration: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteByStudentAndEvent(int studentId, int eventId) {
        String sql = "DELETE FROM REGISTRATION WHERE studentId = ? AND eventId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, studentId);
            pstmt.setInt(2, eventId);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting registration: " + e.getMessage());
            return false;
        }
    }

    public Registration findById(int registrationId) {
        String sql = "SELECT * FROM REGISTRATION WHERE registrationId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, registrationId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Registration r = new Registration();
                    r.setRegistrationId(rs.getInt("registrationId"));
                    r.setEventId(rs.getInt("eventId"));
                    r.setStudentId(rs.getInt("studentId"));
                    r.setStatus(rs.getString("status"));
                    return r;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding registration by ID: " + e.getMessage());
        }
        return null;
    }

    public Registration create(int studentId, int eventId) {
        String sql = "INSERT INTO REGISTRATION (studentId, eventId, status) VALUES (?, ?, 'CONFIRMED')";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setInt(1, studentId);
            pstmt.setInt(2, eventId);
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    Registration r = new Registration();
                    r.setRegistrationId(rs.getInt(1));
                    r.setStudentId(studentId);
                    r.setEventId(eventId);
                    r.setStatus("CONFIRMED");
                    return r;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error creating registration: " + e.getMessage());
        }
        return null;
    }
}
