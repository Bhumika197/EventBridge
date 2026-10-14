import { DatabaseManager } from "../db/DatabaseManager.js";
export class CollegeRepository {
  dbManager;
  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }
  async findAll() {
    const db = this.dbManager.getDb();
    return db.all("SELECT * FROM COLLEGE ORDER BY name ASC");
  }
  async findById(collegeId) {
    const db = this.dbManager.getDb();
    return db.get("SELECT * FROM COLLEGE WHERE collegeId = ?", [collegeId]);
  }
  async findByCode(code) {
    const db = this.dbManager.getDb();
    return db.get("SELECT * FROM COLLEGE WHERE code = ?", [code]);
  }
  async create(college) {
    const db = this.dbManager.getDb();
    const result = await db.run(
      "INSERT INTO COLLEGE (name, code, location, emailDomain, status) VALUES (?, ?, ?, ?, ?)",
      [college.name, college.code, college.location, college.emailDomain, college.status || "ACTIVE"]
    );
    if (result.lastID) {
      const newCollege = await this.findById(result.lastID);
      if (newCollege) return newCollege;
    }
    const fallback = await this.findByCode(college.code);
    return fallback;
  }
}
