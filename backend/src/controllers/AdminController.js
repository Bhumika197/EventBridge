import { UserRepository } from "../repositories/UserRepository.js";
import { CollegeRepository } from "../repositories/CollegeRepository.js";
import { EventRepository } from "../repositories/EventRepository.js";
import { RegistrationRepository } from "../repositories/RegistrationRepository.js";
export class AdminController {
  userRepo = new UserRepository();
  collegeRepo = new CollegeRepository();
  eventRepo = new EventRepository();
  regRepo = new RegistrationRepository();
  getPlatformStats = async (req, res) => {
    try {
      const colleges = await this.collegeRepo.findAll();
      const users = await this.userRepo.findAll();
      const events = await this.eventRepo.findAll();
      const registrations = await this.regRepo.findAll();
      const students = users.filter((u) => u.role === "STUDENT");
      const organizers = users.filter((u) => u.role === "EVENT_ORGANIZER");
      const activeEvents = events.filter((e) => e.status !== "CANCELLED" && e.status !== "COMPLETED");
      return res.json({
        success: true,
        data: {
          totalColleges: colleges.length,
          totalUsers: users.length,
          totalStudents: students.length,
          totalOrganizers: organizers.length,
          totalEvents: events.length,
          activeEvents: activeEvents.length,
          totalRegistrations: registrations.length,
          confirmedRegistrations: registrations.filter((r) => r.status === "CONFIRMED").length
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
  getAllUsers = async (req, res) => {
    try {
      const users = await this.userRepo.findAll();
      const safeUsers = users.map(({ passwordHash, ...u }) => u);
      return res.json({ success: true, data: safeUsers });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
  createCollege = async (req, res) => {
    try {
      const { name, code, location, emailDomain } = req.body;
      if (!name || !code || !location || !emailDomain) {
        return res.status(400).json({ success: false, message: "Missing college details." });
      }
      const college = await this.collegeRepo.create({ name, code, location, emailDomain, status: "ACTIVE" });
      return res.status(201).json({ success: true, data: college });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
  getUserLogs = async (req, res) => {
    try {
      const { CustomLogDatabase } = await import("../db/CustomLogDatabase.js");
      const db = CustomLogDatabase.getInstance();
      const logs = db.getUserLogs(req.params.userId);
      return res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
  getDecodedArchiveLogs = async (req, res) => {
    try {
      const { CustomLogDatabase } = await import("../db/CustomLogDatabase.js");
      const db = CustomLogDatabase.getInstance();
      const logs = await db.decodeArchive(req.query.userId);
      return res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
  getDatabaseStats = async (req, res) => {
    try {
      const { CustomLogDatabase } = await import("../db/CustomLogDatabase.js");
      const db = CustomLogDatabase.getInstance();
      const stats = db.getDatabaseStats();
      return res.json({ success: true, data: stats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}
