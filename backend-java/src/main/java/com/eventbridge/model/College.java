package com.eventbridge.model;

public class College {
    private int collegeId;
    private String name;
    private String code;
    private String location;
    private String emailDomain;
    private String status;
    private String createdAt;

    public College() {}

    public College(int collegeId, String name, String code, String location, String emailDomain) {
        this.collegeId = collegeId;
        this.name = name;
        this.code = code;
        this.location = location;
        this.emailDomain = emailDomain;
        this.status = "ACTIVE";
    }

    public int getCollegeId() { return collegeId; }
    public void setCollegeId(int collegeId) { this.collegeId = collegeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmailDomain() { return emailDomain; }
    public void setEmailDomain(String emailDomain) { this.emailDomain = emailDomain; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
