import { DatabaseManager } from '../db/DatabaseManager';
import { Registration, RegistrationStatus } from '../types';

export class RegistrationRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async findById(registrationId: number): Promise<Registration | undefined> {
    const db = this.dbManager.getDb();
    return db.get<Registration>(
      `SELECT r.*, e.title as eventTitle, e.category as eventCategory, e.eventType, e.date as eventDate, e.venue,
              c.name as organizingCollegeName, u.name as studentName, u.email as studentEmail, u.department as studentDepartment,
              sc.name as studentCollegeName
       FROM REGISTRATION r
       JOIN EVENT e ON r.eventId = e.eventId
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       JOIN USER u ON r.studentId = u.userId
       JOIN COLLEGE sc ON u.collegeId = sc.collegeId
       WHERE r.registrationId = ?`,
      [registrationId]
    );
  }

  public async findByStudentAndEvent(studentId: number, eventId: number): Promise<Registration | undefined> {
    const db = this.dbManager.getDb();
    return db.get<Registration>(
      `SELECT * FROM REGISTRATION WHERE studentId = ? AND eventId = ?`,
      [studentId, eventId]
    );
  }

  public async findByStudent(studentId: number): Promise<Registration[]> {
    const db = this.dbManager.getDb();
    return db.all<Registration[]>(
      `SELECT r.*, e.title as eventTitle, e.category as eventCategory, e.eventType, e.date as eventDate, e.venue,
              c.name as organizingCollegeName
       FROM REGISTRATION r
       JOIN EVENT e ON r.eventId = e.eventId
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE r.studentId = ?
       ORDER BY r.registeredAt DESC`,
      [studentId]
    );
  }

  public async findByEvent(eventId: number): Promise<Registration[]> {
    const db = this.dbManager.getDb();
    return db.all<Registration[]>(
      `SELECT r.*, u.name as studentName, u.email as studentEmail, u.department as studentDepartment, u.year as studentYear,
              sc.name as studentCollegeName
       FROM REGISTRATION r
       JOIN USER u ON r.studentId = u.userId
       JOIN COLLEGE sc ON u.collegeId = sc.collegeId
       WHERE r.eventId = ?
       ORDER BY CASE WHEN r.status = 'CONFIRMED' THEN 1 WHEN r.status = 'WAITLISTED' THEN 2 ELSE 3 END,
                r.queuePosition ASC, r.registeredAt ASC`,
      [eventId]
    );
  }

  public async findAll(): Promise<Registration[]> {
    const db = this.dbManager.getDb();
    return db.all<Registration[]>(
      `SELECT r.*, e.title as eventTitle, u.name as studentName, u.email as studentEmail,
              c.name as organizingCollegeName, sc.name as studentCollegeName
       FROM REGISTRATION r
       JOIN EVENT e ON r.eventId = e.eventId
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       JOIN USER u ON r.studentId = u.userId
       JOIN COLLEGE sc ON u.collegeId = sc.collegeId
       ORDER BY r.registeredAt DESC`
    );
  }

  public async createConfirmed(eventId: number, studentId: number): Promise<Registration> {
    const db = this.dbManager.getDb();
    const existing = await this.findByStudentAndEvent(studentId, eventId);

    if (existing) {
      await db.run(
        `UPDATE REGISTRATION 
         SET status = 'CONFIRMED', queuePosition = NULL, registeredAt = CURRENT_TIMESTAMP 
         WHERE registrationId = ?`,
        [existing.registrationId]
      );
      const reg = await this.findById(existing.registrationId);
      return reg!;
    }

    const result = await db.run(
      `INSERT INTO REGISTRATION (eventId, studentId, status, queuePosition) VALUES (?, ?, 'CONFIRMED', NULL)`,
      [eventId, studentId]
    );
    const reg = await this.findById(result.lastID!);
    return reg!;
  }

  public async createWaitlisted(eventId: number, studentId: number): Promise<Registration> {
    const db = this.dbManager.getDb();
    const existing = await this.findByStudentAndEvent(studentId, eventId);

    const maxQueueRow = await db.get<{ maxPos: number }>(
      `SELECT COALESCE(MAX(queuePosition), 0) as maxPos 
       FROM REGISTRATION 
       WHERE eventId = ? AND status = 'WAITLISTED'`,
      [eventId]
    );
    const nextQueuePos = (maxQueueRow?.maxPos || 0) + 1;

    if (existing) {
      await db.run(
        `UPDATE REGISTRATION 
         SET status = 'WAITLISTED', queuePosition = ?, registeredAt = CURRENT_TIMESTAMP 
         WHERE registrationId = ?`,
        [nextQueuePos, existing.registrationId]
      );
      const reg = await this.findById(existing.registrationId);
      return reg!;
    }

    const result = await db.run(
      `INSERT INTO REGISTRATION (eventId, studentId, status, queuePosition) VALUES (?, ?, 'WAITLISTED', ?)`,
      [eventId, studentId, nextQueuePos]
    );
    const reg = await this.findById(result.lastID!);
    return reg!;
  }

  public async getNextWaitlisted(eventId: number): Promise<Registration | undefined> {
    const db = this.dbManager.getDb();
    return db.get<Registration>(
      `SELECT r.*, u.name as studentName, u.email as studentEmail, e.title as eventTitle
       FROM REGISTRATION r
       JOIN USER u ON r.studentId = u.userId
       JOIN EVENT e ON r.eventId = e.eventId
       WHERE r.eventId = ? AND r.status = 'WAITLISTED'
       ORDER BY r.queuePosition ASC, r.registeredAt ASC
       LIMIT 1`,
      [eventId]
    );
  }

  public async promoteWaitlisted(registrationId: number, eventId: number): Promise<Registration | undefined> {
    const db = this.dbManager.getDb();
    await db.run(
      `UPDATE REGISTRATION 
       SET status = 'CONFIRMED', queuePosition = NULL 
       WHERE registrationId = ?`,
      [registrationId]
    );

    // Reorder remaining waitlist queue positions
    const remaining = await db.all<{ registrationId: number }[]>(
      `SELECT registrationId FROM REGISTRATION 
       WHERE eventId = ? AND status = 'WAITLISTED' 
       ORDER BY queuePosition ASC, registeredAt ASC`,
      [eventId]
    );

    for (let i = 0; i < remaining.length; i++) {
      await db.run(
        `UPDATE REGISTRATION SET queuePosition = ? WHERE registrationId = ?`,
        [i + 1, remaining[i].registrationId]
      );
    }

    return this.findById(registrationId);
  }

  public async countConfirmed(eventId: number): Promise<number> {
    const db = this.dbManager.getDb();
    const row = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM REGISTRATION WHERE eventId = ? AND status = 'CONFIRMED'`,
      [eventId]
    );
    return row?.count || 0;
  }

  public async countWaitlisted(eventId: number): Promise<number> {
    const db = this.dbManager.getDb();
    const row = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM REGISTRATION WHERE eventId = ? AND status = 'WAITLISTED'`,
      [eventId]
    );
    return row?.count || 0;
  }

  public async cancel(registrationId: number): Promise<Registration | undefined> {
    const db = this.dbManager.getDb();
    const reg = await this.findById(registrationId);
    if (!reg) return undefined;

    const oldStatus = reg.status;
    const eventId = reg.eventId;
    const oldPos = reg.queuePosition;

    await db.run(
      `UPDATE REGISTRATION SET status = 'CANCELLED', queuePosition = NULL WHERE registrationId = ?`,
      [registrationId]
    );

    if (oldStatus === 'WAITLISTED' && oldPos) {
      // Shift waitlist positions forward
      await db.run(
        `UPDATE REGISTRATION 
         SET queuePosition = queuePosition - 1 
         WHERE eventId = ? AND status = 'WAITLISTED' AND queuePosition > ?`,
        [eventId, oldPos]
      );
    }

    return reg;
  }
}
