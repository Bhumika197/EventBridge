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
       ORDER BY r.registeredAt ASC`,
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

  public async create(eventId: number, studentId: number): Promise<Registration> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO REGISTRATION (eventId, studentId, status) VALUES (?, ?, 'CONFIRMED')`,
      [eventId, studentId]
    );
    const reg = await this.findById(result.lastID!);
    return reg!;
  }

  public async updateStatus(registrationId: number, status: RegistrationStatus): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run('UPDATE REGISTRATION SET status = ? WHERE registrationId = ?', [status, registrationId]);
  }

  public async cancel(registrationId: number): Promise<void> {
    await this.updateStatus(registrationId, 'CANCELLED');
  }
}
