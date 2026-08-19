import { DatabaseManager } from '../db/DatabaseManager';
import { College } from '../types';

export class CollegeRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async findAll(): Promise<College[]> {
    const db = this.dbManager.getDb();
    return db.all<College[]>('SELECT * FROM COLLEGE ORDER BY name ASC');
  }

  public async findById(collegeId: number): Promise<College | undefined> {
    const db = this.dbManager.getDb();
    return db.get<College>('SELECT * FROM COLLEGE WHERE collegeId = ?', [collegeId]);
  }

  public async findByCode(code: string): Promise<College | undefined> {
    const db = this.dbManager.getDb();
    return db.get<College>('SELECT * FROM COLLEGE WHERE code = ?', [code]);
  }

  public async create(college: Omit<College, 'collegeId'>): Promise<College> {
    const db = this.dbManager.getDb();
    const result = await db.run(
      'INSERT INTO COLLEGE (name, code, location, emailDomain, status) VALUES (?, ?, ?, ?, ?)',
      [college.name, college.code, college.location, college.emailDomain, college.status || 'ACTIVE']
    );
    if (result.lastID) {
      const newCollege = await this.findById(result.lastID);
      if (newCollege) return newCollege;
    }
    const fallback = await this.findByCode(college.code);
    return fallback!;
  }
}
