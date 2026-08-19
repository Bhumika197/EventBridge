import { DatabaseManager } from '../db/DatabaseManager';
import { ContactRequest } from '../types';

export class ContactRequestRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async create(request: Omit<ContactRequest, 'contactId' | 'status' | 'createdAt' | 'reply'>): Promise<ContactRequest> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO CONTACT_REQUEST (studentId, organizerId, eventId, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [request.studentId, request.organizerId, request.eventId, request.subject, request.message]
    );

    const record = await this.findById(result.lastID!);
    return record!;
  }

  public async findById(contactId: number): Promise<ContactRequest | undefined> {
    const db = this.dbManager.getDb();
    return db.get<ContactRequest>(
      `SELECT cr.*, u.name as studentName, u.email as studentEmail, e.title as eventTitle
       FROM CONTACT_REQUEST cr
       JOIN USER u ON cr.studentId = u.userId
       JOIN EVENT e ON cr.eventId = e.eventId
       WHERE cr.contactId = ?`,
      [contactId]
    );
  }

  public async findByOrganizer(organizerId: number): Promise<ContactRequest[]> {
    const db = this.dbManager.getDb();
    return db.all<ContactRequest[]>(
      `SELECT cr.*, u.name as studentName, u.email as studentEmail, e.title as eventTitle
       FROM CONTACT_REQUEST cr
       JOIN USER u ON cr.studentId = u.userId
       JOIN EVENT e ON cr.eventId = e.eventId
       WHERE cr.organizerId = ?
       ORDER BY cr.createdAt DESC`,
      [organizerId]
    );
  }

  public async findByStudent(studentId: number): Promise<ContactRequest[]> {
    const db = this.dbManager.getDb();
    return db.all<ContactRequest[]>(
      `SELECT cr.*, e.title as eventTitle
       FROM CONTACT_REQUEST cr
       JOIN EVENT e ON cr.eventId = e.eventId
       WHERE cr.studentId = ?
       ORDER BY cr.createdAt DESC`,
      [studentId]
    );
  }

  public async reply(contactId: number, replyMessage: string): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run(
      `UPDATE CONTACT_REQUEST SET reply = ?, status = 'REPLIED' WHERE contactId = ?`,
      [replyMessage, contactId]
    );
  }
}
