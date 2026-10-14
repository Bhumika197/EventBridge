import { DatabaseManager } from "../db/DatabaseManager.js";
export class NotificationRepository {
  dbManager;
  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }
  async create(userId, eventId, type, channel, message) {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO NOTIFICATION (userId, eventId, type, channel, message, readStatus)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userId, eventId || null, type, channel, message]
    );
    const record = await db.get(
      `SELECT n.*, e.title as eventTitle
       FROM NOTIFICATION n
       LEFT JOIN EVENT e ON n.eventId = e.eventId
       WHERE n.notificationId = ?`,
      [result.lastID]
    );
    return record;
  }
  async findByUser(userId) {
    const db = this.dbManager.getDb();
    return db.all(
      `SELECT n.*, e.title as eventTitle
       FROM NOTIFICATION n
       LEFT JOIN EVENT e ON n.eventId = e.eventId
       WHERE n.userId = ?
       ORDER BY n.createdAt DESC`,
      [userId]
    );
  }
  async markAsRead(notificationId) {
    const db = this.dbManager.getDb();
    await db.run(`UPDATE NOTIFICATION SET readStatus = 1 WHERE notificationId = ?`, [notificationId]);
  }
  async markAllAsRead(userId) {
    const db = this.dbManager.getDb();
    await db.run(`UPDATE NOTIFICATION SET readStatus = 1 WHERE userId = ?`, [userId]);
  }
}
