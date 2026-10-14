import { DatabaseManager } from "../db/DatabaseManager.js";
export class UserRepository {
  dbManager;
  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }
  async findById(userId) {
    const db = this.dbManager.getDb();
    return db.get(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE u.userId = ?`,
      [userId]
    );
  }
  async findByIdentifier(identifier) {
    const db = this.dbManager.getDb();
    const clean = identifier.trim();
    return db.get(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE LOWER(TRIM(u.username)) = LOWER(?) OR LOWER(TRIM(u.email)) = LOWER(?)`,
      [clean, clean]
    );
  }
  async findByUsername(username) {
    const db = this.dbManager.getDb();
    const clean = username.trim();
    return db.get(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE LOWER(TRIM(u.username)) = LOWER(?)`,
      [clean]
    );
  }
  async findByEmail(email) {
    const db = this.dbManager.getDb();
    const clean = email.trim();
    return db.get(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       WHERE LOWER(TRIM(u.email)) = LOWER(?)`,
      [clean]
    );
  }
  async findAll() {
    const db = this.dbManager.getDb();
    return db.all(
      `SELECT u.*, c.name as collegeName 
       FROM USER u 
       LEFT JOIN COLLEGE c ON u.collegeId = c.collegeId 
       ORDER BY u.userId ASC`
    );
  }
  async create(user) {
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
        user.status || "ACTIVE"
      ]
    );
    if (result.lastID) {
      const newUser = await this.findById(result.lastID);
      if (newUser) return newUser;
    }
    const fallback = await this.findByUsername(user.username);
    return fallback;
  }
  async updatePassword(userId, passwordHash) {
    const db = this.dbManager.getDb();
    await db.run(`UPDATE USER SET passwordHash = ? WHERE userId = ?`, [passwordHash, userId]);
  }
  async delete(userId) {
    const db = this.dbManager.getDb();
    await db.transaction(async (tx) => {
      await tx.run(`DELETE FROM REGISTRATION WHERE studentId = ?`, [userId]);
      await tx.run(`DELETE FROM NOTIFICATION WHERE recipientUserId = ?`, [userId]);
      await tx.run(`DELETE FROM CONTACT_REQUEST WHERE studentId = ?`, [userId]);
      await tx.run(`DELETE FROM USER WHERE userId = ?`, [userId]);
    });
  }
}
