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
    const isVercel = Boolean(process.env.VERCEL);
    const dataDir = isVercel ? '/tmp' : path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir) && !isVercel) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // ignore if read-only
      }
    }
    this.dbPath = path.join(dataDir, 'eventbridge.db');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async loadWasmBinary(): Promise<Buffer | Uint8Array | undefined> {
    const potentialPaths = [
      path.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm'),
      path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm'),
      path.join(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'),
      path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
      path.join(process.cwd(), 'backend/node_modules/sql.js/dist/sql-wasm.wasm')
    ];
    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        try {
          return fs.readFileSync(p);
        } catch {
          // ignore
        }
      }
    }
    try {
      const resolved = require.resolve('sql.js/dist/sql-wasm.wasm');
      if (fs.existsSync(resolved)) {
        return fs.readFileSync(resolved);
      }
    } catch {
      // ignore
    }

    try {
      const resp = await fetch('https://sql.js.org/dist/sql-wasm.wasm');
      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    } catch {
      // ignore
    }
    return undefined;
  }

  public async initialize(): Promise<CustomDatabase> {
    if (this.db) {
      return this.getDb();
    }

    const wasmBinary = await this.loadWasmBinary();
    const config: any = {};
    if (wasmBinary) {
      config.wasmBinary = wasmBinary;
    } else {
      config.locateFile = (file: string) => {
        const potentialPaths = [
          path.join(__dirname, '../../node_modules/sql.js/dist', file),
          path.join(__dirname, '../node_modules/sql.js/dist', file),
          path.join(__dirname, 'node_modules/sql.js/dist', file),
          path.join(process.cwd(), 'node_modules/sql.js/dist', file),
          path.join(process.cwd(), 'backend/node_modules/sql.js/dist', file)
        ];
        for (const p of potentialPaths) {
          if (fs.existsSync(p)) {
            return p;
          }
        }
        return file;
      };
    }

    const SQL = await initSqlJs(config);

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
      } catch (e) {
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
    }

    await this.createTables();
    this.saveToDisk();
    return this.getDb();
  }

  private saveTimeout: NodeJS.Timeout | null = null;
  private opQueue: Promise<any> = Promise.resolve();

  private enqueue<T>(op: () => T | Promise<T>): Promise<T> {
    const nextOp = this.opQueue.then(op, op);
    this.opQueue = nextOp.catch(() => {});
    return nextOp;
  }

  private saveToDisk(immediate = false) {
    if (!this.db) return;

    const doSave = () => {
      try {
        if (!this.db) return;
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(this.dbPath, buffer);
      } catch (err) {
        // Serverless memory fallback if disk is read-only
      }
    };

    if (immediate) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      doSave();
    } else if (!this.saveTimeout) {
      this.saveTimeout = setTimeout(() => {
        this.saveTimeout = null;
        doSave();
      }, 50);
    }
  }

  public getDb(): CustomDatabase {
    if (!this.db) {
      throw new Error('DatabaseManager has not been initialized. Call initialize() first.');
    }

    const self = this;
    const rawDb = this.db;

    return {
      exec(sql: string): Promise<void> {
        return self.enqueue(() => {
          rawDb.exec(sql);
          self.saveToDisk();
        });
      },

      all<T = any>(sql: string, params: any[] = []): Promise<T> {
        return self.enqueue(() => {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          const results: any[] = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results as unknown as T;
        });
      },

      get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
        return self.enqueue(() => {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          let row: any = undefined;
          if (stmt.step()) {
            row = stmt.getAsObject();
          }
          stmt.free();
          return row;
        });
      },

      run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
        return self.enqueue(() => {
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
        });
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
