import { DatabaseManager } from '../db/DatabaseManager';
import { Event, EventStatus, EventFilterQuery, PaginatedResult, User } from '../types';

export interface IEventRepository {
  findById(eventId: number): Promise<Event | undefined>;
  findAll(): Promise<Event[]>;
  findByCollege(collegeId: number): Promise<Event[]>;
  findByOrganizer(organizerId: number): Promise<Event[]>;
  findPendingReview(): Promise<Event[]>;
  findPaginated(filters: EventFilterQuery, user?: User): Promise<PaginatedResult<Event>>;
  create(event: Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>): Promise<Event>;
  update(eventId: number, event: Partial<Event>): Promise<Event | undefined>;
  incrementRegistrations(eventId: number, delta: number): Promise<void>;
  updateStatus(eventId: number, status: EventStatus, rejectionReason?: string, reviewedBy?: number): Promise<void>;
  delete(eventId: number): Promise<boolean>;
}

export class EventRepository implements IEventRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async findById(eventId: number): Promise<Event | undefined> {
    const db = this.dbManager.getDb();
    const event = await db.get<Event>(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.eventId = ?`,
      [eventId]
    );
    return event;
  }

  public async findByTitle(title: string): Promise<Event | undefined> {
    const db = this.dbManager.getDb();
    return db.get<Event>(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.title = ?`,
      [title]
    );
  }

  public async findAll(): Promise<Event[]> {
    const db = this.dbManager.getDb();
    return db.all<Event[]>(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       ORDER BY e.date ASC, e.startTime ASC`
    );
  }

  public async findPendingReview(): Promise<Event[]> {
    const db = this.dbManager.getDb();
    return db.all<Event[]>(
      `SELECT e.*, c.name as organizingCollegeName
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.status = 'SUBMITTED'
       ORDER BY e.createdAt DESC`
    );
  }

  public async findByCollege(collegeId: number): Promise<Event[]> {
    const db = this.dbManager.getDb();
    return db.all<Event[]>(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
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
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.organizerId = ?
       ORDER BY e.createdAt DESC`
    );
  }

  public async findPaginated(filters: EventFilterQuery, user?: User): Promise<PaginatedResult<Event>> {
    const db = this.dbManager.getDb();
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    // Role and college visibility checks:
    if (!user) {
      whereClauses.push("e.status = 'PUBLISHED' AND e.eventType = 'INTER_COLLEGE'");
    } else if (user.role === 'PLATFORM_ADMIN') {
      // Platform Admin can filter any status
      if (filters.status && filters.status !== 'ALL') {
        whereClauses.push('e.status = ?');
        params.push(filters.status);
      }
    } else if (user.role === 'EVENT_ORGANIZER') {
      if (filters.status && filters.status !== 'ALL') {
        whereClauses.push('e.status = ?');
        params.push(filters.status);
      }
      whereClauses.push('(e.organizerId = ? OR e.status = "PUBLISHED")');
      params.push(user.userId);
    } else {
      // Student: Only PUBLISHED or COMPLETED
      whereClauses.push('(e.status = "PUBLISHED" OR e.status = "COMPLETED")');
      whereClauses.push('(e.eventType = "INTER_COLLEGE" OR e.collegeId = ?)');
      params.push(user.collegeId);
    }

    if (filters.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      whereClauses.push('(e.title LIKE ? OR e.description LIKE ? OR c.name LIKE ? OR e.venue LIKE ?)');
      params.push(q, q, q, q);
    }

    if (filters.category && filters.category !== 'ALL') {
      whereClauses.push('e.category = ?');
      params.push(filters.category);
    }

    if (filters.eventType && filters.eventType !== 'ALL') {
      whereClauses.push('e.eventType = ?');
      params.push(filters.eventType);
    }

    if (filters.collegeId && filters.collegeId !== 'ALL') {
      whereClauses.push('e.collegeId = ?');
      params.push(Number(filters.collegeId));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM EVENT e JOIN COLLEGE c ON e.collegeId = c.collegeId ${whereSql}`,
      params
    );
    const total = countRow?.count || 0;

    const queryParams = [...params, limit, offset];
    const data = await db.all<Event[]>(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       ${whereSql}
       ORDER BY e.date ASC, e.startTime ASC
       LIMIT ? OFFSET ?`,
      queryParams
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  public async create(event: Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>): Promise<Event> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      `INSERT INTO EVENT (
        title, description, category, eventType, collegeId, organizerId, organizerName,
        date, startTime, endTime, venue, registrationStartTime, registrationDeadline, capacity, currentRegistrations,
        registrationFee, eligibilityDescription, status, contactInformation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        event.registrationStartTime || null,
        event.registrationDeadline,
        event.capacity,
        0,
        event.registrationFee || 0,
        event.eligibilityDescription,
        event.status || 'DRAFT',
        event.contactInformation
      ]
    );

    const created = await this.findById(result.lastID!);
    return created!;
  }

  public async update(eventId: number, fields: Partial<Event>): Promise<Event | undefined> {
    const db = this.dbManager.getDb();
    const allowedKeys: (keyof Event)[] = [
      'title', 'description', 'category', 'eventType', 'date', 'startTime', 'endTime',
      'venue', 'registrationStartTime', 'registrationDeadline', 'capacity', 'registrationFee',
      'eligibilityDescription', 'contactInformation'
    ];

    const updates: string[] = [];
    const params: any[] = [];

    for (const key of allowedKeys) {
      if (fields[key] !== undefined) {
        updates.push(`${String(key)} = ?`);
        params.push(fields[key]);
      }
    }

    if (updates.length === 0) {
      return this.findById(eventId);
    }

    params.push(eventId);
    await db.run(`UPDATE EVENT SET ${updates.join(', ')} WHERE eventId = ?`, params);
    return this.findById(eventId);
  }

  public async incrementRegistrations(eventId: number, delta: number): Promise<void> {
    const db = this.dbManager.getDb();
    await db.run(
      'UPDATE EVENT SET currentRegistrations = MAX(0, currentRegistrations + ?) WHERE eventId = ?',
      [delta, eventId]
    );
  }

  public async updateStatus(eventId: number, status: EventStatus, rejectionReason?: string, reviewedBy?: number): Promise<void> {
    const db = this.dbManager.getDb();
    const reviewedAt = (status === 'APPROVED' || status === 'REJECTED') ? new Date().toISOString() : null;

    await db.run(
      `UPDATE EVENT 
       SET status = ?, 
           rejectionReason = ?, 
           reviewedBy = ?, 
           reviewedAt = ? 
       WHERE eventId = ?`,
      [status, rejectionReason || null, reviewedBy || null, reviewedAt, eventId]
    );
  }

  public async delete(eventId: number): Promise<boolean> {
    const db = this.dbManager.getDb();
    const result = await db.run('DELETE FROM EVENT WHERE eventId = ?', [eventId]);
    return (result.changes || 0) > 0;
  }
}
