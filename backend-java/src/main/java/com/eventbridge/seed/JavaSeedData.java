package com.eventbridge.seed;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.College;
import com.eventbridge.model.User;
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

            System.out.println("✅ 6 Institutional Colleges seeded in Java (RBU @rbunagpur.in, RCOEM @rcoem.in, NVU, GIT, CAC, NBC)");

            // Dummy bcrypt-styled password representation for plain match / password123
            String defaultPwd = "password123";
            String adminPwd = "admin123";

            // 2. Seed Users
            userRepo.create("Platform Administrator", "admin", "admin@eventbridge.edu", adminPwd, cRBU.getCollegeId(), "PLATFORM_ADMIN");
            userRepo.create("Dr. Rajesh Sharma (RBU Cell)", "org_rbu", "r.sharma@rbunagpur.in", defaultPwd, cRBU.getCollegeId(), "EVENT_ORGANIZER");
            userRepo.create("Prof. Amit Verma (RCOEM Club)", "org_rcoem", "a.verma@rcoem.in", defaultPwd, cRCOEM.getCollegeId(), "EVENT_ORGANIZER");

            userRepo.create("Bhumika Reddy", "bhumika_rbu", "bhumika@rbunagpur.in", defaultPwd, cRBU.getCollegeId(), "STUDENT");
            userRepo.create("Aarav Deshmukh", "aarav_rcoem", "aarav@rcoem.in", defaultPwd, cRCOEM.getCollegeId(), "STUDENT");

            System.out.println("✅ Java Database Seeding Complete!");
        } catch (Exception e) {
            System.err.println("Error seeding Java Database: " + e.getMessage());
        }
    }
}
