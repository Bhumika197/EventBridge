import { AuthService } from "../services/AuthService.js";
import { CollegeRepository } from "../repositories/CollegeRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
export class AuthController {
  authService = new AuthService();
  collegeRepo = new CollegeRepository();
  userRepo = new UserRepository();
  login = async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
      }
      const result = await this.authService.login(username, password);
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message || "Login failed." });
    }
  };
  registerStudent = async (req, res) => {
    try {
      const { name, username, email, password, collegeId, department, year, phone } = req.body;
      if (!name || !username || !email || !password || !collegeId) {
        return res.status(400).json({ success: false, message: "Missing required student registration fields." });
      }
      const user = await this.authService.registerStudent({
        name,
        username,
        email,
        passwordPlain: password,
        collegeId: Number(collegeId),
        department,
        year: year ? Number(year) : void 0,
        phone
      });
      return res.status(201).json({ success: true, data: user });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message || "Registration failed." });
    }
  };
  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email address is required." });
      }
      const result = await this.authService.requestPasswordReset(email);
      return res.json({ success: true, message: result.message, resetCodeForTesting: result.resetCodeForTesting });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message || "Password reset request failed." });
    }
  };
  resetPassword = async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ success: false, message: "Email, reset code, and new password are required." });
      }
      const result = await this.authService.resetPasswordWithCode(email, resetCode, newPassword);
      return res.json({ success: true, message: result.message });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message || "Password reset failed." });
    }
  };
  getCurrentUser = async (req, res) => {
    if (!req.user) {
      return res.json({ success: true, data: null });
    }
    return res.json({ success: true, data: req.user });
  };
  getColleges = async (req, res) => {
    try {
      const colleges = await this.collegeRepo.findAll();
      return res.json({ success: true, data: colleges });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
  deleteAccount = async (req, res) => {
    try {
      const { username, password } = req.body;
      const identifier = username || (req.user ? req.user.username : void 0);
      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Username/Email and password are required to delete your account." });
      }
      const result = await this.authService.deleteAccount(identifier, password);
      return res.json({ success: true, message: result.message });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message || "Account deletion failed." });
    }
  };
}
