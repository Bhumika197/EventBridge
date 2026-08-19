import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../types';
import { EmailService } from './EmailService';
import { NotificationBridge, EmailChannel } from '../patterns/bridge/NotificationBridge';

const JWT_SECRET = process.env.JWT_SECRET || 'eventbridge_secret_key_2026';

// Store reset codes in memory: email -> { code, expiresAt }
const resetCodeStore = new Map<string, { code: string; expiresAt: number }>();

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  public async login(username: string, passwordPlain: string): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid username or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Your account is currently inactive. Contact platform admin.');
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        role: user.role,
        collegeId: user.collegeId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  public async registerStudent(data: {
    name: string;
    username: string;
    email: string;
    passwordPlain: string;
    collegeId: number;
    department?: string;
    year?: number;
    phone?: string;
  }): Promise<Omit<User, 'passwordHash'>> {
    const existingUsername = await this.userRepo.findByUsername(data.username.trim());
    if (existingUsername) {
      throw new Error(`Username '${data.username}' is already taken. Please choose a different username.`);
    }

    const existingEmail = await this.userRepo.findByEmail(data.email.trim());
    if (existingEmail) {
      throw new Error(`Email '${data.email}' is already registered. Please sign in or use another email.`);
    }

    try {
      const passwordHash = await bcrypt.hash(data.passwordPlain, 10);

      const user = await this.userRepo.create({
        name: data.name.trim(),
        username: data.username.trim(),
        email: data.email.trim(),
        passwordHash,
        collegeId: data.collegeId,
        department: data.department ? data.department.trim() : undefined,
        year: data.year,
        phone: data.phone,
        role: 'STUDENT',
        status: 'ACTIVE'
      });

      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err: any) {
      if (err.message && err.message.includes('USER.username')) {
        throw new Error(`Username '${data.username}' is already taken. Please choose a different username.`);
      }
      if (err.message && err.message.includes('USER.email')) {
        throw new Error(`Email '${data.email}' is already registered. Please use another email.`);
      }
      throw err;
    }
  }

  public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetCodeForTesting?: string }> {
    const cleanEmail = email.trim();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new Error(`No registered account found with email '${cleanEmail}'.`);
    }

    // Generate 6-digit random code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry

    resetCodeStore.set(cleanEmail, { code: resetCode, expiresAt });

    // Send email via EmailService
    const emailSent = await EmailService.sendPasswordResetEmail(cleanEmail, resetCode, user.name);

    // Record in database via Bridge Pattern EmailChannel
    const emailBridge = new EmailChannel();
    await emailBridge.send(
      user.userId,
      undefined,
      'Password Reset',
      `Password reset code for ${cleanEmail}: ${resetCode}. Valid for 15 minutes.`
    );

    return {
      success: true,
      message: emailSent
        ? `Password reset code sent to ${cleanEmail}. Please check your inbox.`
        : `Password reset code generated and sent to ${cleanEmail}. (Logged to notifications & test mode)`,
      resetCodeForTesting: resetCode
    };
  }

  public async resetPasswordWithCode(email: string, resetCode: string, newPasswordPlain: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim();
    const stored = resetCodeStore.get(cleanEmail);

    if (!stored) {
      throw new Error('No password reset request found for this email. Please request a new code.');
    }

    if (Date.now() > stored.expiresAt) {
      resetCodeStore.delete(cleanEmail);
      throw new Error('Reset code has expired. Please request a new password reset code.');
    }

    if (stored.code !== resetCode.trim()) {
      throw new Error('Invalid password reset code. Please check the code sent to your email.');
    }

    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new Error('User account not found.');
    }

    const passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    await this.userRepo.updatePassword(user.userId, passwordHash);

    // Consume code
    resetCodeStore.delete(cleanEmail);

    return {
      success: true,
      message: 'Password updated successfully! You can now sign in with your new password.'
    };
  }

  public verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }
}
