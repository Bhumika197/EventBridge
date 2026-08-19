import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AuthService } from '../services/AuthService';
import { CollegeRepository } from '../repositories/CollegeRepository';
import { UserRepository } from '../repositories/UserRepository';

export class AuthController {
  private authService = new AuthService();
  private collegeRepo = new CollegeRepository();
  private userRepo = new UserRepository();

  public login = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
      }

      const result = await this.authService.login(username, password);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Login failed.' });
    }
  };

  public registerStudent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, username, email, password, collegeId, department, year, phone } = req.body;
      if (!name || !username || !email || !password || !collegeId) {
        return res.status(400).json({ success: false, message: 'Missing required student registration fields.' });
      }

      const user = await this.authService.registerStudent({
        name,
        username,
        email,
        passwordPlain: password,
        collegeId: Number(collegeId),
        department,
        year: year ? Number(year) : undefined,
        phone
      });

      return res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Registration failed.' });
    }
  };

  public forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const result = await this.authService.requestPasswordReset(email);
      return res.json({ success: true, message: result.message, resetCodeForTesting: result.resetCodeForTesting });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Password reset request failed.' });
    }
  };

  public resetPassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, reset code, and new password are required.' });
      }

      const result = await this.authService.resetPasswordWithCode(email, resetCode, newPassword);
      return res.json({ success: true, message: result.message });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Password reset failed.' });
    }
  };

  public getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.json({ success: true, data: null });
    }
    return res.json({ success: true, data: req.user });
  };

  public getColleges = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const colleges = await this.collegeRepo.findAll();
      return res.json({ success: true, data: colleges });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}
