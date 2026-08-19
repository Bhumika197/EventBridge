import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';
import { CollegeRepository } from '../repositories/CollegeRepository';
import { EventRepository } from '../repositories/EventRepository';
import { RegistrationRepository } from '../repositories/RegistrationRepository';

export class AdminController {
  private userRepo = new UserRepository();
  private collegeRepo = new CollegeRepository();
  private eventRepo = new EventRepository();
  private regRepo = new RegistrationRepository();

  public getPlatformStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const colleges = await this.collegeRepo.findAll();
      const users = await this.userRepo.findAll();
      const events = await this.eventRepo.findAll();
      const registrations = await this.regRepo.findAll();

      const students = users.filter(u => u.role === 'STUDENT');
      const organizers = users.filter(u => u.role === 'EVENT_ORGANIZER');
      const activeEvents = events.filter(e => e.status !== 'CANCELLED' && e.status !== 'COMPLETED');

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
          confirmedRegistrations: registrations.filter(r => r.status === 'CONFIRMED').length
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await this.userRepo.findAll();
      const safeUsers = users.map(({ passwordHash, ...u }) => u);
      return res.json({ success: true, data: safeUsers });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public createCollege = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, code, location, emailDomain } = req.body;
      if (!name || !code || !location || !emailDomain) {
        return res.status(400).json({ success: false, message: 'Missing college details.' });
      }
      const college = await this.collegeRepo.create({ name, code, location, emailDomain, status: 'ACTIVE' });
      return res.status(201).json({ success: true, data: college });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
}
