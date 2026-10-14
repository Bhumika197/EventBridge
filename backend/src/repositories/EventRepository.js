import { DatabaseManager } from "../db/DatabaseManager.js";
export class EventRepository {
  dbManager;
  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }
  parseEventRow(event) {
    if (!event) return void 0;
    if (typeof event.speakers === "string") {
      try {
        event.speakers = JSON.parse(event.speakers);
      } catch {
        event.speakers = [];
      }
    }
    if (typeof event.sponsors === "string") {
      try {
        event.sponsors = JSON.parse(event.sponsors);
      } catch {
        event.sponsors = [];
      }
    }
    return event;
  }
  async findById(eventId) {
    const db = this.dbManager.getDb();
    const event = await db.get(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.eventId = ?`,
      [eventId]
    );
    return this.parseEventRow(event);
  }
  async findByTitle(title) {
    const db = this.dbManager.getDb();
    const event = await db.get(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.title = ?`,
      [title]
    );
    return this.parseEventRow(event);
  }
  async findAll() {
    const db = this.dbManager.getDb();
    const events = await db.all(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       ORDER BY e.date ASC, e.startTime ASC`
    );
    return events.map((e) => this.parseEventRow(e));
  }
  async findPendingReview() {
    const db = this.dbManager.getDb();
    const rows = await db.all(
      `SELECT e.*, c.name as organizingCollegeName
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.status = 'SUBMITTED'
       ORDER BY e.createdAt DESC`
    );
    return rows.map((r) => this.parseEventRow(r));
  }
  async findByCollege(collegeId) {
    const db = this.dbManager.getDb();
    const rows = await db.all(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.collegeId = ?
       ORDER BY e.date ASC, e.startTime ASC`,
      [collegeId]
    );
    return rows.map((r) => this.parseEventRow(r));
  }
  async findByOrganizer(organizerId) {
    const db = this.dbManager.getDb();
    const rows = await db.all(
      `SELECT e.*, c.name as organizingCollegeName,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventId = e.eventId AND r.status = 'WAITLISTED') as waitlistCount
       FROM EVENT e
       JOIN COLLEGE c ON e.collegeId = c.collegeId
       WHERE e.organizerId = ?
       ORDER BY e.createdAt DESC`,
      [organizerId]
    );
    return rows.map((r) => this.parseEventRow(r));
  }
  async findPaginated(filters, user) {
    const db = this.dbManager.getDb();
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;
    const whereClauses = [];
    const params = [];
    if (!user) {
      whereClauses.push("e.status = 'PUBLISHED' AND e.eventType = 'INTER_COLLEGE'");
    } else if (user.role === "PLATFORM_ADMIN") {
      if (filters.status && filters.status !== "ALL") {
        whereClauses.push("e.status = ?");
        params.push(filters.status);
      }
    } else if (user.role === "EVENT_ORGANIZER") {
      if (filters.status && filters.status !== "ALL") {
        whereClauses.push("e.status = ?");
        params.push(filters.status);
      }
      whereClauses.push('(e.organizerId = ? OR e.status = "PUBLISHED")');
      params.push(user.userId);
    } else {
      whereClauses.push('(e.status = "PUBLISHED" OR e.status = "COMPLETED")');
      whereClauses.push('(e.eventType = "INTER_COLLEGE" OR e.collegeId = ?)');
      params.push(user.collegeId);
    }
    if (filters.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      whereClauses.push("(e.title LIKE ? OR e.description LIKE ? OR c.name LIKE ? OR e.venue LIKE ?)");
      params.push(q, q, q, q);
    }
    if (filters.category && filters.category !== "ALL") {
      whereClauses.push("e.category = ?");
      params.push(filters.category);
    }
    if (filters.eventType && filters.eventType !== "ALL") {
      whereClauses.push("e.eventType = ?");
      params.push(filters.eventType);
    }
    if (filters.collegeId && filters.collegeId !== "ALL") {
      whereClauses.push("e.collegeId = ?");
      params.push(Number(filters.collegeId));
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const countRow = await db.get(
      `SELECT COUNT(*) as count FROM EVENT e JOIN COLLEGE c ON e.collegeId = c.collegeId ${whereSql}`,
      params
    );
    const total = countRow?.count || 0;
    const queryParams = [...params, limit, offset];
    const data = await db.all(
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
      data: data.map((r) => this.parseEventRow(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }
  async create(event) {
    const db = this.dbManager.getDb();
    const speakersStr = Array.isArray(event.speakers) ? JSON.stringify(event.speakers) : event.speakers || "[]";
    const sponsorsStr = Array.isArray(event.sponsors) ? JSON.stringify(event.sponsors) : event.sponsors || "[]";
    const result = await db.run(
      `INSERT INTO EVENT (
        title, description, category, eventType, collegeId, organizerId, organizerName,
        date, startTime, endTime, venue, registrationStartTime, registrationDeadline, capacity, currentRegistrations,
        registrationFee, eligibilityDescription, status, contactInformation,
        prizePool, minTeamSize, maxTeamSize, speakers, sponsors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        event.status || "DRAFT",
        event.contactInformation,
        event.prizePool || 0,
        event.minTeamSize || 1,
        event.maxTeamSize || 1,
        speakersStr,
        sponsorsStr
      ]
    );
    const created = await this.findById(result.lastID);
    return created;
  }
  async update(eventId, fields) {
    const db = this.dbManager.getDb();
    const allowedKeys = [
      "title",
      "description",
      "category",
      "eventType",
      "date",
      "startTime",
      "endTime",
      "venue",
      "registrationStartTime",
      "registrationDeadline",
      "capacity",
      "registrationFee",
      "eligibilityDescription",
      "contactInformation",
      "prizePool",
      "minTeamSize",
      "maxTeamSize",
      "speakers",
      "sponsors"
    ];
    const updates = [];
    const params = [];
    for (const key of allowedKeys) {
      if (fields[key] !== void 0) {
        updates.push(`${String(key)} = ?`);
        let val = fields[key];
        if ((key === "speakers" || key === "sponsors") && Array.isArray(val)) {
          val = JSON.stringify(val);
        }
        params.push(val);
      }
    }
    if (updates.length === 0) {
      return this.findById(eventId);
    }
    params.push(eventId);
    await db.run(`UPDATE EVENT SET ${updates.join(", ")} WHERE eventId = ?`, params);
    return this.findById(eventId);
  }
  async incrementRegistrations(eventId, delta) {
    const db = this.dbManager.getDb();
    await db.run(
      "UPDATE EVENT SET currentRegistrations = MAX(0, currentRegistrations + ?) WHERE eventId = ?",
      [delta, eventId]
    );
  }
  async updateStatus(eventId, status, rejectionReason, reviewedBy) {
    const db = this.dbManager.getDb();
    const reviewedAt = status === "APPROVED" || status === "REJECTED" ? (/* @__PURE__ */ new Date()).toISOString() : null;
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
  async delete(eventId) {
    const db = this.dbManager.getDb();
    const result = await db.run("DELETE FROM EVENT WHERE eventId = ?", [eventId]);
    return (result.changes || 0) > 0;
  }
}
