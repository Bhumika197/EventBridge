package com.eventbridge.model;

import java.time.LocalDateTime;

public class User {
    private int userId;
    private String name;
    private String username;
    private String email;
    private String passwordHash;
    private int collegeId;
    private String collegeName;
    private String department;
    private Integer year;
    private String phone;
    private String role; // STUDENT, EVENT_ORGANIZER, PLATFORM_ADMIN, COLLEGE_ADMIN
    private String status; // ACTIVE, INACTIVE
    private String createdAt;

    public User() {}

    public User(int userId, String name, String username, String email, String passwordHash, int collegeId, String role) {
        this.userId = userId;
        this.name = name;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.collegeId = collegeId;
        this.role = role;
        this.status = "ACTIVE";
    }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public int getCollegeId() { return collegeId; }
    public void setCollegeId(int collegeId) { this.collegeId = collegeId; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
