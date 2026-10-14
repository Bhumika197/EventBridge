package com.eventbridge.repository;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.Registration;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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
