package com.eventbridge.repository;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserRepository {
    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    public User findByUsername(String username) {
        String sql = "SELECT u.*, c.name as collegeName FROM USER u JOIN COLLEGE c ON u.collegeId = c.collegeId WHERE u.username = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding user by username: " + e.getMessage());
        }
        return null;
    }

    public User findByEmail(String email) {
        String sql = "SELECT u.*, c.name as collegeName FROM USER u JOIN COLLEGE c ON u.collegeId = c.collegeId WHERE u.email = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, email);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding user by email: " + e.getMessage());
        }
        return null;
    }

    public User create(String name, String username, String email, String passwordHash, int collegeId, String role) {
        String sql = "INSERT INTO USER (name, username, email, passwordHash, collegeId, role) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, name);
            pstmt.setString(2, username);
            pstmt.setString(3, email);
            pstmt.setString(4, passwordHash);
            pstmt.setInt(5, collegeId);
            pstmt.setString(6, role);
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return findByUsername(username);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error creating user: " + e.getMessage());
        }
        return null;
    }

    public void updatePassword(int userId, String passwordHash) {
        String sql = "UPDATE USER SET passwordHash = ? WHERE userId = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, passwordHash);
            pstmt.setInt(2, userId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error updating user password: " + e.getMessage());
        }
    }

    private User mapUser(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getInt("userId"));
        u.setName(rs.getString("name"));
        u.setUsername(rs.getString("username"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("passwordHash"));
        u.setCollegeId(rs.getInt("collegeId"));
        u.setCollegeName(rs.getString("collegeName"));
        u.setRole(rs.getString("role"));
        u.setStatus(rs.getString("status"));
        return u;
    }
}
