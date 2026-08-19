import { DatabaseManager } from '../db/DatabaseManager';
import { NotificationRecord, NotificationType, NotificationChannelType } from '../types';

export class NotificationRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async create(
    userId: number,
    eventId: number | undefined,
    type: NotificationType,
    channel: NotificationChannelType,
    message: string
  ): Promise<NotificationRecord> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO NOTIFICATION (userId, eventId, type, channel, message, readStatus)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userId, eventId || null, type, channel, message]
    );

    const record = await db.get<NotificationRecord>(
      `SELECT n.*, e.title as eventTitle
       FROM NOTIFICATION n
       LEFT JOIN EVENT e ON n.eventId = e.eventId
       WHERE n.notificationId = ?`,
      [result.lastID!]
    );
    return record!;
  }

  public async findByUser(userId: number): Promise<NotificationRecord[]> {
    const db = this.dbManager.getDb();
    return db.all<NotificationRecord[]>(
      `SELECT n.*, e.title as eventTitle
       FROM NOTIFICATION n
       LEFT JOIN EVENT e ON n.eventId = e.eventId
       WHERE n.userId = ?
       ORDER BY n.createdAt DESC`,
      [userId]
    );
  }

  public async markAsRead(notificationId: number): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run(`UPDATE NOTIFICATION SET readStatus = 1 WHERE notificationId = ?`, [notificationId]);
  }

  public async markAllAsRead(userId: number): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run(`UPDATE NOTIFICATION SET readStatus = 1 WHERE userId = ?`, [userId]);
  }
}
