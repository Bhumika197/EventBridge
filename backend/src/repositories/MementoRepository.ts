import { DatabaseManager } from '../db/DatabaseManager';
import { EventMementoRecord } from '../types';

export class MementoRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async saveMemento(eventId: number, stateJson: string, description: string): Promise<EventMementoRecord> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO EVENT_MEMENTO (eventId, stateJson, description) VALUES (?, ?, ?)`,
      [eventId, stateJson, description]
    );

    const row = await db.get<EventMementoRecord>(
      `SELECT * FROM EVENT_MEMENTO WHERE mementoId = ?`,
      [result.lastID!]
    );
    return row!;
  }

  public async getHistory(eventId: number): Promise<EventMementoRecord[]> {
    const db = this.dbManager.getDb();
    return db.all<EventMementoRecord[]>(
      `SELECT * FROM EVENT_MEMENTO WHERE eventId = ? ORDER BY mementoId DESC`,
      [eventId]
    );
  }

  public async getLatestMemento(eventId: number): Promise<EventMementoRecord | undefined> {
    const db = this.dbManager.getDb();
    return db.get<EventMementoRecord>(
      `SELECT * FROM EVENT_MEMENTO WHERE eventId = ? ORDER BY mementoId DESC LIMIT 1`,
      [eventId]
    );
  }

  public async popLatestMemento(eventId: number): Promise<EventMementoRecord | undefined> {
    const db = this.dbManager.getDb();
    const latest = await this.getLatestMemento(eventId);
    if (latest) {
      await db.run(`DELETE FROM EVENT_MEMENTO WHERE mementoId = ?`, [latest.mementoId]);
    }
    return latest;
  }
}
