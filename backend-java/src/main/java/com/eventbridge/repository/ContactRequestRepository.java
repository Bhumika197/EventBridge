package com.eventbridge.repository;

import com.eventbridge.db.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ContactRequestRepository {
    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    public boolean create(int studentId, int organizerId, int eventId, String subject, String message) {
        String sql = "INSERT INTO CONTACT_REQUEST (studentId, organizerId, eventId, subject, message, status) VALUES (?, ?, ?, ?, ?, 'PENDING')";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, studentId);
            pstmt.setInt(2, organizerId);
            pstmt.setInt(3, eventId);
            pstmt.setString(4, subject);
            pstmt.setString(5, message);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error creating contact request: " + e.getMessage());
            return false;
        }
    }

    public List<Map<String, Object>> findByOrganizer(int organizerId) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT c.*, u.name as studentName, u.email as studentEmail, e.title as eventTitle " +
                     "FROM CONTACT_REQUEST c " +
                     "JOIN USER u ON c.studentId = u.userId " +
                     "JOIN EVENT e ON c.eventId = e.eventId " +
                     "WHERE c.organizerId = ? ORDER BY c.contactId DESC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, organizerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("contactId", rs.getInt("contactId"));
                    map.put("studentId", rs.getInt("studentId"));
                    map.put("studentName", rs.getString("studentName"));
                    map.put("studentEmail", rs.getString("studentEmail"));
                    map.put("eventId", rs.getInt("eventId"));
                    map.put("eventTitle", rs.getString("eventTitle"));
                    map.put("subject", rs.getString("subject"));
                    map.put("message", rs.getString("message"));
                    map.put("status", rs.getString("status"));
                    map.put("createdAt", rs.getString("createdAt"));
                    list.add(map);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching contact requests: " + e.getMessage());
        }
        return list;
    }
}
