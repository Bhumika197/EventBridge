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
       JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE u.userId = ?`,
      [userId]
    );
  }

  public async findByUsername(username: string): Promise<User | undefined> {
    const db = this.dbManager.getDb();
    return db.get<User>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE u.username = ?`,
      [username]
    );
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const db = this.dbManager.getDb();
    return db.get<User>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE u.email = ?`,
      [email]
    );
  }

  public async findAll(): Promise<User[]> {
    const db = this.dbManager.getDb();
    return db.all<User[]>(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       JOIN COLLEGE c ON u.collegeId = c.collegeId 
       ORDER BY u.userId DESC`
    );
  }

  public async create(user: Omit<User, 'userId'>): Promise<User> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO USER (name, username, email, passwordHash, collegeId, department, year, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.name,
        user.username,
        user.email,
        user.passwordHash,
        user.collegeId,
        user.department || null,
        user.year || null,
        user.phone || null,
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
