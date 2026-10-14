package com.eventbridge.repository;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.NotificationRecord;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class NotificationRepository {
    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    public NotificationRecord create(int userId, Integer eventId, String type, String channel, String message) {
        String sql = "INSERT INTO NOTIFICATION (userId, eventId, type, channel, message, readStatus) VALUES (?, ?, ?, ?, ?, 0)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setInt(1, userId);
            if (eventId != null) pstmt.setInt(2, eventId);
            else pstmt.setNull(2, Types.INTEGER);
            pstmt.setString(3, type);
            pstmt.setString(4, channel);
            pstmt.setString(5, message);
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    NotificationRecord n = new NotificationRecord();
                    n.setNotificationId(rs.getInt(1));
                    n.setUserId(userId);
                    n.setEventId(eventId);
                    n.setType(type);
                    n.setChannel(channel);
                    n.setMessage(message);
                    n.setReadStatus(0);
                    return n;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error creating notification: " + e.getMessage());
        }
        return null;
    }

    public List<NotificationRecord> findByUserId(int userId) {
        List<NotificationRecord> list = new ArrayList<>();
        String sql = "SELECT * FROM NOTIFICATION WHERE userId = ? ORDER BY notificationId DESC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    NotificationRecord n = new NotificationRecord();
                    n.setNotificationId(rs.getInt("notificationId"));
                    n.setUserId(rs.getInt("userId"));
                    n.setType(rs.getString("type"));
                    n.setChannel(rs.getString("channel"));
                    n.setMessage(rs.getString("message"));
                    n.setReadStatus(rs.getInt("readStatus"));
                    list.add(n);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching notifications: " + e.getMessage());
        }
        return list;
    }
}
