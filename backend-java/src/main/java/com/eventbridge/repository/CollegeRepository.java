package com.eventbridge.repository;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.College;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CollegeRepository {
    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    public List<College> findAll() {
        List<College> list = new ArrayList<>();
        String sql = "SELECT * FROM COLLEGE ORDER BY collegeId ASC";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                College c = new College(
                    rs.getInt("collegeId"),
                    rs.getString("name"),
                    rs.getString("code"),
                    rs.getString("location"),
                    rs.getString("emailDomain")
                );
                c.setStatus(rs.getString("status"));
                list.add(c);
            }
        } catch (SQLException e) {
            System.err.println("Error fetching colleges: " + e.getMessage());
        }
        return list;
    }

    public College create(String name, String code, String location, String emailDomain) {
        String sql = "INSERT INTO COLLEGE (name, code, location, emailDomain) VALUES (?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, name);
            pstmt.setString(2, code);
            pstmt.setString(3, location);
            pstmt.setString(4, emailDomain);
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return new College(rs.getInt(1), name, code, location, emailDomain);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error creating college: " + e.getMessage());
        }
        return null;
    }
}
