import { DatabaseManager } from "../db/DatabaseManager";
export class MementoRepository {
  dbManager;
  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }
  async saveMemento(eventId, stateJson, description) {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO EVENT_MEMENTO (eventId, stateJson, description) VALUES (?, ?, ?)`,
      [eventId, stateJson, description]
    );
    const row = await db.get(
      `SELECT * FROM EVENT_MEMENTO WHERE mementoId = ?`,
      [result.lastID]
    );
    return row;
  }
  async getHistory(eventId) {
    const db = this.dbManager.getDb();
    return db.all(
      `SELECT * FROM EVENT_MEMENTO WHERE eventId = ? ORDER BY mementoId DESC`,
      [eventId]
    );
  }
  async getLatestMemento(eventId) {
    const db = this.dbManager.getDb();
    return db.get(
      `SELECT * FROM EVENT_MEMENTO WHERE eventId = ? ORDER BY mementoId DESC LIMIT 1`,
      [eventId]
    );
  }
  async popLatestMemento(eventId) {
    const db = this.dbManager.getDb();
    const latest = await this.getLatestMemento(eventId);
    if (latest) {
      await db.run(`DELETE FROM EVENT_MEMENTO WHERE mementoId = ?`, [latest.mementoId]);
    }
    return latest;
  }
}
