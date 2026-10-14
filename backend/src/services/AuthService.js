import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";
import { EmailService } from "./EmailService.js";
import { EmailChannel } from "../patterns/bridge/NotificationBridge.js";
import { logger } from "../utils/logger.js";
import { CustomLogDatabase } from "../db/CustomLogDatabase.js";
const JWT_SECRET = process.env.JWT_SECRET || "eventbridge_secret_key_2026";
const resetCodeStore = /* @__PURE__ */ new Map();
export class AuthService {
  userRepo;
  constructor() {
    this.userRepo = new UserRepository();
  }
  async login(identifier, passwordPlain) {
    if (!identifier || !passwordPlain) {
      throw new Error("Username or email and password are required.");
    }
    const cleanIdentifier = identifier.trim();
    const cleanPassword = passwordPlain.trim();
    const user = await this.userRepo.findByIdentifier(cleanIdentifier);
    if (!user) {
      logger.warn(`Login failed: Account not found for identifier '${cleanIdentifier}'`);
      throw new Error("Invalid username/email or password.");
    }
    const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
    if (!isMatch) {
      logger.warn(`Login failed: Incorrect password for user '${user.username}' (#${user.userId})`);
      throw new Error("Invalid username/email or password.");
    }
    if (user.status !== "ACTIVE") {
      throw new Error("Your account is currently inactive. Please contact your platform administrator.");
    }
    logger.info(`User successfully signed in: '${user.username}' (#${user.userId}, Role: ${user.role})`);
    
    // Track in Custom 60-Log Circular Database
    const customDb = CustomLogDatabase.getInstance();
    await customDb.registerUser(user);
    await customDb.appendLog(user.userId, "USER_LOGIN", {
      role: user.role,
      username: user.username,
      loginTime: new Date().toISOString()
    });

    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        role: user.role,
        collegeId: user.collegeId
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    const { passwordHash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
  async registerStudent(data) {
    const cleanUsername = data.username.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.passwordPlain.trim();
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error("Username must be at least 3 characters long.");
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    const existingUsername = await this.userRepo.findByUsername(cleanUsername);
    if (existingUsername) {
      throw new Error(`Username '${cleanUsername}' is already registered. Please choose another username.`);
    }
    const existingEmail = await this.userRepo.findByEmail(cleanEmail);
    if (existingEmail) {
      throw new Error(`Email '${cleanEmail}' is already registered. Please sign in with your password.`);
    }
    try {
      const passwordHash = await bcrypt.hash(cleanPassword, 10);
      const user = await this.userRepo.create({
        name: data.name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        collegeId: Number(data.collegeId),
        department: data.department ? data.department.trim() : void 0,
        year: data.year ? Number(data.year) : void 0,
        phone: data.phone ? data.phone.trim() : void 0,
        role: "STUDENT",
        status: "ACTIVE"
      });
      logger.info(`New student registered: '${user.username}' (#${user.userId}, Email: ${user.email})`);
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err) {
      if (err.message && (err.message.includes("USER.username") || err.message.includes("UNIQUE constraint failed: USER.username"))) {
        throw new Error(`Username '${cleanUsername}' is already taken. Please choose another username.`);
      }
      if (err.message && (err.message.includes("USER.email") || err.message.includes("UNIQUE constraint failed: USER.email"))) {
        throw new Error(`Email '${cleanEmail}' is already registered. Please sign in.`);
      }
      throw err;
    }
  }
  async requestPasswordReset(email) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new Error(`No registered account found with email '${cleanEmail}'.`);
    }
    const resetCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = Date.now() + 15 * 60 * 1e3;
    resetCodeStore.set(cleanEmail, { code: resetCode, expiresAt });
    const emailSent = await EmailService.sendPasswordResetEmail(cleanEmail, resetCode, user.name);
    const emailBridge = new EmailChannel();
    await emailBridge.send(
      user.userId,
      void 0,
      "Password Reset",
      `Password reset code for ${cleanEmail}: ${resetCode}. Valid for 15 minutes.`
    );
    return {
      success: true,
      message: emailSent ? `Password reset code sent to ${cleanEmail}. Please check your inbox.` : `Password reset code generated and sent to ${cleanEmail}. (Logged to notifications & test mode)`,
      resetCodeForTesting: resetCode
    };
  }
  async resetPasswordWithCode(email, resetCode, newPasswordPlain) {
    const cleanEmail = email.trim().toLowerCase();
    const stored = resetCodeStore.get(cleanEmail);
    if (!stored) {
      throw new Error("No password reset request found for this email. Please request a new code.");
    }
    if (Date.now() > stored.expiresAt) {
      resetCodeStore.delete(cleanEmail);
      throw new Error("Reset code has expired. Please request a new password reset code.");
    }
    if (stored.code !== resetCode.trim()) {
      throw new Error("Invalid password reset code. Please check the code sent to your email.");
    }
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new Error("User account not found.");
    }
    const cleanPassword = newPasswordPlain.trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long.");
    }
    const passwordHash = await bcrypt.hash(cleanPassword, 10);
    await this.userRepo.updatePassword(user.userId, passwordHash);
    resetCodeStore.delete(cleanEmail);
    logger.info(`Password successfully reset for user '${user.username}' (#${user.userId})`);
    return {
      success: true,
      message: "Password updated successfully! You can now sign in with your new password."
    };
  }
  async deleteAccount(identifier, passwordPlain) {
    if (!identifier || !passwordPlain) {
      throw new Error("Username/Email and password are required to delete your account.");
    }
    const cleanIdentifier = identifier.trim();
    const cleanPassword = passwordPlain.trim();
    const user = await this.userRepo.findByIdentifier(cleanIdentifier);
    if (!user) {
      throw new Error("Account not found with provided username/email.");
    }
    const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid password. Account deletion rejected.");
    }
    if (user.role === "PLATFORM_ADMIN") {
      throw new Error("Platform administrator accounts cannot be deleted directly.");
    }
    await this.userRepo.delete(user.userId);
    logger.info(`Account deleted permanently: '${user.username}' (#${user.userId})`);
    return {
      success: true,
      message: `Account '${user.username}' and all associated data have been permanently deleted.`
    };
  }
  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}
