package com.eventbridge.seed;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.College;
import com.eventbridge.repository.CollegeRepository;
import com.eventbridge.repository.UserRepository;

import java.sql.Connection;
import java.sql.Statement;

public class JavaSeedData {
    public static void seed() {
        System.out.println("🌱 Starting Java EventBridge Database Seeding...");
        DatabaseManager dbManager = DatabaseManager.getInstance();

        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement()) {

            // Clear existing
            stmt.execute("DELETE FROM CONTACT_REQUEST");
            stmt.execute("DELETE FROM NOTIFICATION");
            stmt.execute("DELETE FROM REGISTRATION");
            stmt.execute("DELETE FROM EVENT");
            stmt.execute("DELETE FROM USER");
            stmt.execute("DELETE FROM COLLEGE");

            CollegeRepository collegeRepo = new CollegeRepository();
            UserRepository userRepo = new UserRepository();

            // 1. Seed Colleges
            College cRBU = collegeRepo.create("Ramdeobaba University", "RBU", "Katol Road, Nagpur", "rbunagpur.in");
            College cRCOEM = collegeRepo.create("Shri Ramdeobaba College of Engineering and Management (RCOEM)", "RCOEM", "Ramdeo Tekdi, Gittikhadan, Nagpur", "rcoem.in");
            College cNVU = collegeRepo.create("North Valley University", "NVU", "North Valley Campus", "nvu.edu");
            College cGIT = collegeRepo.create("Greenfield Institute of Technology", "GIT", "Greenfield Tech Park", "git.edu");
            College cCAC = collegeRepo.create("City Arts College", "CAC", "Downtown Metro", "cac.edu");
            College cNBC = collegeRepo.create("National Business College", "NBC", "Financial Center", "nbc.edu");

            String defaultPwd = "password123";
            String adminPwd = "admin123";

            // 2. Seed Users
            userRepo.create("Platform Administrator", "admin", "admin@eventbridge.edu", adminPwd, cRBU.getCollegeId(), "PLATFORM_ADMIN");
            userRepo.create("Dr. Rajesh Sharma (RBU Cell)", "org_rbu", "r.sharma@rbunagpur.in", defaultPwd, cRBU.getCollegeId(), "EVENT_ORGANIZER");
            userRepo.create("Prof. Amit Verma (RCOEM Club)", "org_rcoem", "a.verma@rcoem.in", defaultPwd, cRCOEM.getCollegeId(), "EVENT_ORGANIZER");

            userRepo.create("Bhumika Reddy", "bhumika_rbu", "bhumika@rbunagpur.in", defaultPwd, cRBU.getCollegeId(), "STUDENT");
            userRepo.create("Aarav Deshmukh", "aarav_rcoem", "aarav@rcoem.in", defaultPwd, cRCOEM.getCollegeId(), "STUDENT");

            // Seed student1 through student15 for 20 concurrent users
            for (int i = 1; i <= 15; i++) {
                boolean isRbu = (i % 2 == 1);
                int cid = isRbu ? cRBU.getCollegeId() : cRCOEM.getCollegeId();
                String domain = isRbu ? "rbunagpur.in" : "rcoem.in";
                userRepo.create("Student Participant " + i, "student" + i, "student" + i + "@" + domain, defaultPwd, cid, "STUDENT");
            }

            System.out.println("✅ Java Database Seeding Complete for 20 Concurrent Users!");
        } catch (Exception e) {
            System.err.println("Error seeding Java Database: " + e.getMessage());
        }
    }
}
