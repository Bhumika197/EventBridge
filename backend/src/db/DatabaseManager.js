import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseManager {
  static instance = null;
  db = null;
  dbPath;
  saveTimeout = null;
  opQueue = Promise.resolve();
  constructor() {
    const isVercel = Boolean(process.env.VERCEL);
    const dataDir = isVercel ? "/tmp" : path.join(__dirname, "../../data");
    if (!fs.existsSync(dataDir) && !isVercel) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
      }
    }
    this.dbPath = path.join(dataDir, "eventbridge.db");
  }
  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
  async loadWasmBinary() {
    const potentialPaths = [
      path.join(__dirname, "../../node_modules/sql.js/dist/sql-wasm.wasm"),
      path.join(__dirname, "../node_modules/sql.js/dist/sql-wasm.wasm"),
      path.join(__dirname, "node_modules/sql.js/dist/sql-wasm.wasm"),
      path.join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm"),
      path.join(process.cwd(), "backend/node_modules/sql.js/dist/sql-wasm.wasm")
    ];
    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        try {
          return fs.readFileSync(p);
        } catch {
        }
      }
    }
    try {
      const resolved = require.resolve("sql.js/dist/sql-wasm.wasm");
      if (fs.existsSync(resolved)) {
        return fs.readFileSync(resolved);
      }
    } catch {
    }
    try {
      const resp = await fetch("https://sql.js.org/dist/sql-wasm.wasm");
      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    } catch {
    }
    return void 0;
  }
  async initialize() {
    if (this.db) {
      return this.getDb();
    }
    const wasmBinary = await this.loadWasmBinary();
    const config = {};
    if (wasmBinary) {
      config.wasmBinary = wasmBinary;
    } else {
      config.locateFile = (file) => {
        const potentialPaths = [
          path.join(__dirname, "../../node_modules/sql.js/dist", file),
          path.join(__dirname, "../node_modules/sql.js/dist", file),
          path.join(__dirname, "node_modules/sql.js/dist", file),
          path.join(process.cwd(), "node_modules/sql.js/dist", file),
          path.join(process.cwd(), "backend/node_modules/sql.js/dist", file)
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
    this.saveToDisk(true);
    return this.getDb();
  }
  enqueue(op) {
    const nextOp = this.opQueue.then(op, op);
    this.opQueue = nextOp.catch(() => {
    });
    return nextOp;
  }
  saveToDisk(immediate = false) {
    if (!this.db) return;
    const doSave = () => {
      try {
        if (!this.db) return;
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(this.dbPath, buffer);
      } catch (err) {
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
  getDb() {
    if (!this.db) {
      throw new Error("DatabaseManager has not been initialized. Call initialize() first.");
    }
    const self = this;
    const rawDb = this.db;
    const customDb = {
      exec(sql) {
        return self.enqueue(() => {
          rawDb.exec(sql);
          self.saveToDisk();
        });
      },
      all(sql, params = []) {
        return self.enqueue(() => {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        });
      },
      get(sql, params = []) {
        return self.enqueue(() => {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          let row = void 0;
          if (stmt.step()) {
            row = stmt.getAsObject();
          }
          stmt.free();
          return row;
        });
      },
      run(sql, params = []) {
        return self.enqueue(() => {
          rawDb.run(sql, params);
          let lastID;
          try {
            const res = rawDb.exec("SELECT last_insert_rowid() as id");
            if (res.length > 0 && res[0].values.length > 0 && res[0].values[0][0]) {
              lastID = Number(res[0].values[0][0]);
            }
          } catch (e) {
          }
          self.saveToDisk(true);
          return { lastID, changes: 1 };
        });
      },
      async transaction(fn) {
        return self.enqueue(async () => {
          try {
            rawDb.exec("BEGIN TRANSACTION;");
            const result = await fn(customDb);
            rawDb.exec("COMMIT;");
            self.saveToDisk(true);
            return result;
          } catch (err) {
            try {
              rawDb.exec("ROLLBACK;");
            } catch (rollbackErr) {
            }
            throw err;
          }
        });
      }
    };
    return customDb;
  }
  async createTables() {
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
        registrationStartTime TEXT,
        registrationDeadline TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        currentRegistrations INTEGER NOT NULL DEFAULT 0,
        registrationFee REAL NOT NULL DEFAULT 0.0,
        eligibilityDescription TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'COMPLETED', 'CANCELLED')),
        rejectionReason TEXT,
        reviewedBy INTEGER,
        reviewedAt DATETIME,
        prizePool REAL DEFAULT 0,
        minTeamSize INTEGER DEFAULT 1,
        maxTeamSize INTEGER DEFAULT 1,
        speakers TEXT DEFAULT '[]',
        sponsors TEXT DEFAULT '[]',
        contactInformation TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS EVENT_MEMENTO (
        mementoId INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        stateJson TEXT NOT NULL,
        description TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS REGISTRATION (
        registrationId INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(status IN ('CONFIRMED', 'WAITLISTED', 'CANCELLED', 'REJECTED')),
        queuePosition INTEGER DEFAULT NULL,
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
    `);
    const migrations = [
      "ALTER TABLE REGISTRATION ADD COLUMN queuePosition INTEGER DEFAULT NULL",
      "ALTER TABLE EVENT ADD COLUMN registrationStartTime TEXT",
      "ALTER TABLE EVENT ADD COLUMN rejectionReason TEXT",
      "ALTER TABLE EVENT ADD COLUMN reviewedBy INTEGER",
      "ALTER TABLE EVENT ADD COLUMN reviewedAt DATETIME",
      "ALTER TABLE EVENT ADD COLUMN prizePool REAL DEFAULT 0",
      "ALTER TABLE EVENT ADD COLUMN minTeamSize INTEGER DEFAULT 1",
      "ALTER TABLE EVENT ADD COLUMN maxTeamSize INTEGER DEFAULT 1",
      'ALTER TABLE EVENT ADD COLUMN speakers TEXT DEFAULT "[]"',
      'ALTER TABLE EVENT ADD COLUMN sponsors TEXT DEFAULT "[]"'
    ];
    for (const mig of migrations) {
      try {
        this.db.exec(mig);
      } catch (e) {
      }
    }
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_event_college ON EVENT(collegeId);
      CREATE INDEX IF NOT EXISTS idx_event_status ON EVENT(status);
      CREATE INDEX IF NOT EXISTS idx_event_date ON EVENT(date);
      CREATE INDEX IF NOT EXISTS idx_reg_event_student ON REGISTRATION(eventId, studentId);
      CREATE INDEX IF NOT EXISTS idx_reg_waitlist ON REGISTRATION(eventId, status, queuePosition);
      CREATE INDEX IF NOT EXISTS idx_notif_user ON NOTIFICATION(userId, readStatus);
    `);
  }
}
