import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

export interface CustomDatabase {
  exec(sql: string): Promise<void>;
  all<T = any>(sql: string, params?: any[]): Promise<T>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  run(sql: string, params?: any[]): Promise<{ lastID?: number; changes?: number }>;
}

export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private db: SqlJsDatabase | null = null;
  private dbPath: string;

  private constructor() {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'eventbridge.db');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<CustomDatabase> {
    if (this.db) {
      return this.getDb();
    }

    const SQL = await initSqlJs();
    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }

    await this.createTables();
    this.saveToDisk();
    return this.getDb();
  }

  private saveToDisk() {
    if (this.db) {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    }
  }

  public getDb(): CustomDatabase {
    if (!this.db) {
      throw new Error('DatabaseManager has not been initialized. Call initialize() first.');
    }

    const self = this;
    const rawDb = this.db;

    return {
      async exec(sql: string): Promise<void> {
        rawDb.exec(sql);
        self.saveToDisk();
      },

      async all<T = any>(sql: string, params: any[] = []): Promise<T> {
        const stmt = rawDb.prepare(sql);
        stmt.bind(params);
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results as unknown as T;
      },

      async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
        const stmt = rawDb.prepare(sql);
        stmt.bind(params);
        let row: any = undefined;
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
        stmt.free();
        return row;
      },

      async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
        rawDb.run(sql, params);
        let lastID: number | undefined;
        try {
          const res = rawDb.exec('SELECT last_insert_rowid() as id');
          if (res.length > 0 && res[0].values.length > 0 && res[0].values[0][0]) {
            lastID = Number(res[0].values[0][0]);
          }
        } catch (e) {
          // ignore
        }
        self.saveToDisk();
        return { lastID, changes: 1 };
      }
    };
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS COLLEGE (
        collegeId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL,
        emailDomain TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS USER (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        collegeId INTEGER NOT NULL,
        department TEXT,
        year INTEGER,
        phone TEXT,
        role TEXT NOT NULL CHECK(role IN ('STUDENT', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'COLLEGE_ADMIN')),
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS EVENT (
        eventId INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        eventType TEXT NOT NULL CHECK(eventType IN ('INTRA_COLLEGE', 'INTER_COLLEGE')),
        collegeId INTEGER NOT NULL,
        organizerId INTEGER NOT NULL,
        organizerName TEXT NOT NULL,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        venue TEXT NOT NULL,
        registrationDeadline TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        currentRegistrations INTEGER NOT NULL DEFAULT 0,
        registrationFee REAL NOT NULL DEFAULT 0.0,
        eligibilityDescription TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'FULL', 'ONGOING', 'COMPLETED', 'CANCELLED')),
        contactInformation TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS REGISTRATION (
        registrationId INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED')),
        UNIQUE(eventId, studentId)
      );

      CREATE TABLE IF NOT EXISTS NOTIFICATION (
        notificationId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        eventId INTEGER,
        type TEXT NOT NULL,
        channel TEXT NOT NULL,
        message TEXT NOT NULL,
        readStatus INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS CONTACT_REQUEST (
        contactId INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        organizerId INTEGER NOT NULL,
        eventId INTEGER NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        reply TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS EVENT_CATEGORY (
        categoryId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      );
    `);
  }
}
