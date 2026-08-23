import { DatabaseManager } from '../db/DatabaseManager';
import { User } from '../types';

export class UserRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async findById(userId: number): Promise<User | undefined> {
    const db = this.dbManager.getDb();
    return db.get<User>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE u.userId = ?`,
      [userId]
    );
  }

  public async findByIdentifier(identifier: string): Promise<User | undefined> {
    const db = this.dbManager.getDb();
    const clean = identifier.trim();
    return db.get<User>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE LOWER(TRIM(u.username)) = LOWER(?) OR LOWER(TRIM(u.email)) = LOWER(?)`,
      [clean, clean]
    );
  }

  public async findByUsername(username: string): Promise<User | undefined> {
    const db = this.dbManager.getDb();
    const clean = username.trim();
    return db.get<User>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE LOWER(TRIM(u.username)) = LOWER(?)`,
      [clean]
    );
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const db = this.dbManager.getDb();
    const clean = email.trim();
    return db.get<User>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE LOWER(TRIM(u.email)) = LOWER(?)`,
      [clean]
    );
  }

  public async findAll(): Promise<User[]> {
    const db = this.dbManager.getDb();
    return db.all<User[]>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       ORDER BY u.userId ASC`
    );
  }

  public async create(user: Omit<User, 'userId'>): Promise<User> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO USER (name, username, email, passwordHash, collegeId, department, year, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.name.trim(),
        user.username.trim(),
        user.email.trim().toLowerCase(),
        user.passwordHash,
        user.collegeId,
        user.department ? user.department.trim() : null,
        user.year || null,
        user.phone ? user.phone.trim() : null,
        user.role,
        user.status || 'ACTIVE'
      ]
    );
    if (result.lastID) {
      const newUser = await this.findById(result.lastID);
      if (newUser) return newUser;
    }
    const fallback = await this.findByUsername(user.username);
    return fallback!;
  }

  public async updatePassword(userId: number, passwordHash: string): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run(`UPDATE USER SET passwordHash = ? WHERE userId = ?`, [passwordHash, userId]);
  }
}
