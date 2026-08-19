import bcrypt from 'bcryptjs';
import { DatabaseManager } from '../db/DatabaseManager';
import { CollegeRepository } from '../repositories/CollegeRepository';
import { UserRepository } from '../repositories/UserRepository';
import { EventService } from '../services/EventService';

export async function seedDatabase() {
  console.log('🌱 Starting EventBridge Database Seeding...');
  
  const dbManager = DatabaseManager.getInstance();
  await dbManager.initialize();
  const db = dbManager.getDb();

  // Clear existing data in reverse order of foreign keys
  await db.exec(`
    DELETE FROM CONTACT_REQUEST;
    DELETE FROM NOTIFICATION;
    DELETE FROM REGISTRATION;
    DELETE FROM EVENT;
    DELETE FROM USER;
    DELETE FROM COLLEGE;
  `);

  const collegeRepo = new CollegeRepository();
  const userRepo = new UserRepository();
  const eventService = new EventService();

  // 1. Seed Colleges with @rbunagpur.in and @rcoem.in
  const cRBU = await collegeRepo.create({ name: 'Ramdeobaba University', code: 'RBU', location: 'Katol Road, Nagpur', emailDomain: 'rbunagpur.in', status: 'ACTIVE' });
  const cRCOEM = await collegeRepo.create({ name: 'Shri Ramdeobaba College of Engineering and Management (RCOEM)', code: 'RCOEM', location: 'Ramdeo Tekdi, Gittikhadan, Nagpur', emailDomain: 'rcoem.in', status: 'ACTIVE' });
  const cNVU = await collegeRepo.create({ name: 'North Valley University', code: 'NVU', location: 'North Valley Campus', emailDomain: 'nvu.edu', status: 'ACTIVE' });
  const cGIT = await collegeRepo.create({ name: 'Greenfield Institute of Technology', code: 'GIT', location: 'Greenfield Tech Park', emailDomain: 'git.edu', status: 'ACTIVE' });
  const cCAC = await collegeRepo.create({ name: 'City Arts College', code: 'CAC', location: 'Downtown Metro', emailDomain: 'cac.edu', status: 'ACTIVE' });
  const cNBC = await collegeRepo.create({ name: 'National Business College', code: 'NBC', location: 'Financial Center', emailDomain: 'nbc.edu', status: 'ACTIVE' });

  console.log('✅ 6 Institutional Colleges created: Ramdeobaba University (@rbunagpur.in), RCOEM (@rcoem.in), NVU, GIT, CAC, NBC');

  const defaultPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 2. Seed Platform Admin
  await userRepo.create({
    name: 'Platform Administrator',
    username: 'admin',
    email: 'admin@eventbridge.edu',
    passwordHash: adminPassword,
    collegeId: cRBU.collegeId,
    role: 'PLATFORM_ADMIN',
    status: 'ACTIVE'
  });

  // 3. Seed Organizers
  const orgRBU = await userRepo.create({
    name: 'Dr. Rajesh Sharma (RBU Tech Cell)',
    username: 'org_rbu',
    email: 'r.sharma@rbunagpur.in',
    passwordHash: defaultPassword,
    collegeId: cRBU.collegeId,
    phone: '+91-98765-0101',
    role: 'EVENT_ORGANIZER',
    status: 'ACTIVE'
  });

  const orgRCOEM = await userRepo.create({
    name: 'Prof. Amit Verma (RCOEM Club)',
    username: 'org_rcoem',
    email: 'a.verma@rcoem.in',
    passwordHash: defaultPassword,
    collegeId: cRCOEM.collegeId,
    phone: '+91-98765-0202',
    role: 'EVENT_ORGANIZER',
    status: 'ACTIVE'
  });

  // 4. Seed Primary Student Accounts
  const studentBhumika = await userRepo.create({
    name: 'Bhumika Reddy',
    username: 'bhumika_rbu',
    email: 'bhumika@rbunagpur.in',
    passwordHash: defaultPassword,
    collegeId: cRBU.collegeId,
    department: 'Computer Science',
    year: 3,
    phone: '+91-98765-1111',
    role: 'STUDENT',
    status: 'ACTIVE'
  });

  const studentAarav = await userRepo.create({
    name: 'Aarav Deshmukh',
    username: 'aarav_rcoem',
    email: 'aarav@rcoem.in',
    passwordHash: defaultPassword,
    collegeId: cRCOEM.collegeId,
    department: 'Information Technology',
    year: 2,
    phone: '+91-98765-2222',
    role: 'STUDENT',
    status: 'ACTIVE'
  });

  // 5. Seed 15 Additional Concurrent Student Accounts (student1 - student15)
  for (let i = 1; i <= 15; i++) {
    const isRbu = i % 2 === 1;
    const cid = isRbu ? cRBU.collegeId : cRCOEM.collegeId;
    const domain = isRbu ? 'rbunagpur.in' : 'rcoem.in';
    const colName = isRbu ? 'RBU' : 'RCOEM';
    await userRepo.create({
      name: `Student Participant ${i} (${colName})`,
      username: `student${i}`,
      email: `student${i}@${domain}`,
      passwordHash: defaultPassword,
      collegeId: cid,
      department: i % 2 === 0 ? 'Computer Science' : 'Electronics',
      year: (i % 4) + 1,
      role: 'STUDENT',
      status: 'ACTIVE'
    });
  }

  console.log('✅ 17 Student Accounts (bhumika_rbu, aarav_rcoem, student1 - student15) seeded successfully!');

  // 6. Seed Sample Events via Factory Method
  await eventService.createEvent({
    title: 'HackRBU 2026: National AI Hackathon',
    description: '48-hour inter-college AI & Web3 hackathon hosted by Ramdeobaba University. Open to all colleges across India.',
    category: 'Technical',
    eventType: 'INTER_COLLEGE',
    collegeId: cRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: '2026-09-15',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: 'Main Auditorium, RBU Campus, Nagpur',
    registrationDeadline: '2026-09-10',
    capacity: 250,
    registrationFee: 0.0,
    contactInformation: 'hackathon@rbunagpur.in'
  });

  await eventService.createEvent({
    title: 'Pratibha 2026: RCOEM Annual Cultural Fest',
    description: 'Grand intra-college cultural festival featuring battle of bands, dance drama, and fashion show for RCOEM students.',
    category: 'Cultural',
    eventType: 'INTRA_COLLEGE',
    collegeId: cRCOEM.collegeId,
    organizerId: orgRCOEM.userId,
    organizerName: orgRCOEM.name,
    date: '2026-10-05',
    startTime: '10:00 AM',
    endTime: '09:00 PM',
    venue: 'Open Air Theatre, RCOEM, Nagpur',
    registrationDeadline: '2026-10-01',
    capacity: 500,
    registrationFee: 150.0,
    contactInformation: 'pratibha@rcoem.in'
  });

  await eventService.createEvent({
    title: 'Inter-University Cricket Championship 2026',
    description: 'Inter-college T20 tournament between engineering and university teams of Central India.',
    category: 'Sports',
    eventType: 'INTER_COLLEGE',
    collegeId: cRCOEM.collegeId,
    organizerId: orgRCOEM.userId,
    organizerName: orgRCOEM.name,
    date: '2026-11-12',
    startTime: '08:00 AM',
    endTime: '06:00 PM',
    venue: 'RCOEM Sports Complex, Nagpur',
    registrationDeadline: '2026-11-05',
    capacity: 16,
    registrationFee: 500.0,
    contactInformation: 'sports@rcoem.in'
  });

  console.log('✅ Events created via Factory Method Pattern');
}
