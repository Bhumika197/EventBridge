import { DatabaseManager } from "../db/DatabaseManager.js";
export class ContactRequestRepository {
  dbManager;
  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }
  async create(request) {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO CONTACT_REQUEST (studentId, organizerId, eventId, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [request.studentId, request.organizerId, request.eventId, request.subject, request.message]
    );
    const record = await this.findById(result.lastID);
    return record;
  }
  async findById(contactId) {
    const db = this.dbManager.getDb();
    return db.get(
      `SELECT cr.*, u.name as studentName, u.email as studentEmail, e.title as eventTitle
       FROM CONTACT_REQUEST cr
       JOIN USER u ON cr.studentId = u.userId
       JOIN EVENT e ON cr.eventId = e.eventId
       WHERE cr.contactId = ?`,
      [contactId]
    );
  }
  async findByOrganizer(organizerId) {
    const db = this.dbManager.getDb();
    return db.all(
      `SELECT cr.*, u.name as studentName, u.email as studentEmail, e.title as eventTitle
       FROM CONTACT_REQUEST cr
       JOIN USER u ON cr.studentId = u.userId
       JOIN EVENT e ON cr.eventId = e.eventId
       WHERE cr.organizerId = ?
       ORDER BY cr.createdAt DESC`,
      [organizerId]
    );
  }
  async findByStudent(studentId) {
    const db = this.dbManager.getDb();
    return db.all(
      `SELECT cr.*, e.title as eventTitle
       FROM CONTACT_REQUEST cr
       JOIN EVENT e ON cr.eventId = e.eventId
       WHERE cr.studentId = ?
       ORDER BY cr.createdAt DESC`,
      [studentId]
    );
  }
  async reply(contactId, replyMessage) {
    const db = this.dbManager.getDb();
    await db.run(
      `UPDATE CONTACT_REQUEST SET reply = ?, status = 'REPLIED' WHERE contactId = ?`,
      [replyMessage, contactId]
    );
  }
}
