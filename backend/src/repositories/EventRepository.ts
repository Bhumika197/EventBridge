import { DatabaseManager } from '../db/DatabaseManager';
import { Event, EventStatus } from '../types';

export interface IEventRepository {
  findById(eventId: number): Promise<Event | undefined>;
  findAll(): Promise<Event[]>;
  findByCollege(collegeId: number): Promise<Event[]>;
  findByOrganizer(organizerId: number): Promise<Event[]>;
  create(event: Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>): Promise<Event>;
  update(eventId: number, event: Partial<Event>): Promise<Event | undefined>;
  incrementRegistrations(eventId: number, delta: number): Promise<void>;
  updateStatus(eventId: number, status: EventStatus): Promise<void>;
  delete(eventId: number): Promise<boolean>;
}

export class EventRepository implements IEventRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async findById(eventId: number): Promise<Event | undefined> {
    const db = this.dbManager.getDb();
    return db.get<Event>(
      `SELECT e.*, c.name as organizingCollegeName
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.eventId = ?`,
      [eventId]
    );
  }

  public async findByTitle(title: string): Promise<Event | undefined> {
    const db = this.dbManager.getDb();
    return db.get<Event>(
      `SELECT e.*, c.name as organizingCollegeName
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.title = ?`,
      [title]
    );
  }

  public async findAll(): Promise<Event[]> {
    const db = this.dbManager.getDb();
    return db.all<Event[]>(
      `SELECT e.*, c.name as organizingCollegeName
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       ORDER BY e.date ASC, e.startTime ASC`
    );
  }

  public async findByCollege(collegeId: number): Promise<Event[]> {
    const db = this.dbManager.getDb();
    return db.all<Event[]>(
      `SELECT e.*, c.name as organizingCollegeName
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.collegeId = ?
       ORDER BY e.date ASC, e.startTime ASC`,
      [collegeId]
    );
  }

  public async findByOrganizer(organizerId: number): Promise<Event[]> {
    const db = this.dbManager.getDb();
    return db.all<Event[]>(
      `SELECT e.*, c.name as organizingCollegeName
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.organizerId = ?
       ORDER BY e.date ASC, e.startTime ASC`,
      [organizerId]
    );
  }

  public async create(event: Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>): Promise<Event> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO EVENT (
        title, description, category, eventType, collegeId, organizerId, organizerName,
        date, startTime, endTime, venue, registrationDeadline, capacity, currentRegistrations,
        registrationFee, eligibilityDescription, status, contactInformation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.title,
        event.description,
        event.category,
        event.eventType,
        event.collegeId,
        event.organizerId,
        event.organizerName,
        event.date,
        event.startTime,
        event.endTime,
        event.venue,
        event.registrationDeadline,
        event.capacity,
        0,
        event.registrationFee || 0,
        event.eligibilityDescription,
        event.status || 'PUBLISHED',
        event.contactInformation
      ]
    );

    if (result.lastID) {
      const newEvent = await this.findById(result.lastID);
      if (newEvent) return newEvent;
    }
    const fallback = await this.findByTitle(event.title);
    return fallback!;
  }

  public async update(eventId: number, fields: Partial<Event>): Promise<Event | undefined> {
    const db = this.dbManager.getDb();
    const allowedKeys: (keyof Event)[] = [
      'title', 'description', 'category', 'eventType', 'date', 'startTime', 'endTime',
      'venue', 'registrationDeadline', 'capacity', 'registrationFee',
      'eligibilityDescription', 'status', 'contactInformation'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const key of allowedKeys) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) {
      return this.findById(eventId);
    }

    values.push(eventId);
    await db.run(`UPDATE EVENT SET ${updates.join(', ')} WHERE eventId = ?`, values);
    return this.findById(eventId);
  }

  public async incrementRegistrations(eventId: number, delta: number): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run(
      `UPDATE EVENT SET currentRegistrations = currentRegistrations + ? WHERE eventId = ?`,
      [delta, eventId]
    );

    const event = await this.findById(eventId);
    if (event && event.currentRegistrations >= event.capacity && event.status === 'REGISTRATION_OPEN') {
      await this.updateStatus(eventId, 'FULL');
    } else if (event && event.currentRegistrations < event.capacity && event.status === 'FULL') {
      await this.updateStatus(eventId, 'REGISTRATION_OPEN');
    }
  }

  public async updateStatus(eventId: number, status: EventStatus): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run('UPDATE EVENT SET status = ? WHERE eventId = ?', [status, eventId]);
  }

  public async delete(eventId: number): Promise<boolean> {
    const db = this.dbManager.getDb();
    const result = await db.run('DELETE FROM EVENT WHERE eventId = ?', [eventId]);
    return (result.changes || 0) > 0;
  }
}
