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
    name: 'Prof. Amit Verma (RCOEM Computer Club)',
    username: 'org_rcoem',
    email: 'a.verma@rcoem.in',
    passwordHash: defaultPassword,
    collegeId: cRCOEM.collegeId,
    phone: '+91-98765-0102',
    role: 'EVENT_ORGANIZER',
    status: 'ACTIVE'
  });

  const orgNVU = await userRepo.create({
    name: 'Dr. Alex Vance (NVU Tech)',
    username: 'org_nvu',
    email: 'alex.vance@nvu.edu',
    passwordHash: defaultPassword,
    collegeId: cNVU.collegeId,
    phone: '+1-555-0101',
    role: 'EVENT_ORGANIZER',
    status: 'ACTIVE'
  });

  const orgGIT = await userRepo.create({
    name: 'Prof. Maya Lin (GIT Hackathons)',
    username: 'org_git',
    email: 'maya.lin@git.edu',
    passwordHash: defaultPassword,
    collegeId: cGIT.collegeId,
    phone: '+1-555-0102',
    role: 'EVENT_ORGANIZER',
    status: 'ACTIVE'
  });

  console.log('✅ Organizers created');

  // 4. Seed Students
  const sRBU = await userRepo.create({
    name: 'Bhumika Reddy',
    username: 'bhumika_rbu',
    email: 'bhumika@rbunagpur.in',
    passwordHash: defaultPassword,
    collegeId: cRBU.collegeId,
    department: 'Computer Science & Engineering',
    year: 3,
    role: 'STUDENT',
    status: 'ACTIVE'
  });

  const sRCOEM = await userRepo.create({
    name: 'Aarav Deshmukh',
    username: 'aarav_rcoem',
    email: 'aarav@rcoem.in',
    passwordHash: defaultPassword,
    collegeId: cRCOEM.collegeId,
    department: 'Information Technology',
    year: 2,
    role: 'STUDENT',
    status: 'ACTIVE'
  });

  const sNVU = await userRepo.create({
    name: 'Alice Johnson',
    username: 'student_nvu',
    email: 'alice@nvu.edu',
    passwordHash: defaultPassword,
    collegeId: cNVU.collegeId,
    department: 'Computer Science',
    year: 3,
    role: 'STUDENT',
    status: 'ACTIVE'
  });

  console.log('✅ Students created');

  // 5. Seed Events
  const eventsData = [
    // --- Ramdeobaba University (RBU) Events ---
    {
      title: 'RBU National Hackathon 2026',
      description: '36-hour inter-college AI & IoT hackathon at Ramdeobaba University Nagpur (@rbunagpur.in). Build innovative hardware and software prototypes.',
      category: 'Technical',
      eventType: 'INTER_COLLEGE' as const,
      collegeId: cRBU.collegeId,
      organizerId: orgRBU.userId,
      organizerName: orgRBU.name,
      date: '2026-09-20',
      startTime: '09:00',
      endTime: '21:00',
      venue: 'RBU Main Auditorium & IT Block, Nagpur',
      registrationDeadline: '2026-09-15T23:59',
      capacity: 200,
      registrationFee: 0,
      eligibilityDescription: 'Open to engineering and technology students across all recognized universities.',
      status: 'REGISTRATION_OPEN' as const,
      contactInformation: 'r.sharma@rbunagpur.in | RBU Cell'
    },
    {
      title: 'RBU Intra CSE Coding League',
      description: 'Internal competitive programming battle for Ramdeobaba University Computer Science students.',
      category: 'Technical',
      eventType: 'INTRA_COLLEGE' as const,
      collegeId: cRBU.collegeId,
      organizerId: orgRBU.userId,
      organizerName: orgRBU.name,
      date: '2026-09-05',
      startTime: '14:00',
      endTime: '17:00',
      venue: 'RBU Computer Center Lab 3',
      registrationDeadline: '2026-09-03T23:59',
      capacity: 60,
      registrationFee: 0,
      eligibilityDescription: 'STRICTLY restricted to Ramdeobaba University students.',
      status: 'REGISTRATION_OPEN' as const,
      contactInformation: 'bhumika@rbunagpur.in'
    },

    // --- RCOEM Events ---
    {
      title: 'RCOEM Pratishruti Inter-College Cultural Fest',
      description: 'Annual flagship inter-college cultural fest at RCOEM Nagpur (@rcoem.in) featuring music, dance, and drama.',
      category: 'Cultural',
      eventType: 'INTER_COLLEGE' as const,
      collegeId: cRCOEM.collegeId,
      organizerId: orgRCOEM.userId,
      organizerName: orgRCOEM.name,
      date: '2026-10-10',
      startTime: '10:00',
      endTime: '22:00',
      venue: 'RCOEM Campus Grounds, Gittikhadan, Nagpur',
      registrationDeadline: '2026-10-05T23:59',
      capacity: 300,
      registrationFee: 5,
      eligibilityDescription: 'Open to students across colleges with valid institutional ID card.',
      status: 'REGISTRATION_OPEN' as const,
      contactInformation: 'a.verma@rcoem.in'
    },
    {
      title: 'RCOEM Intra Sports Championship',
      description: 'Intra-college cricket, football, and badminton league for RCOEM students.',
      category: 'Sports',
      eventType: 'INTRA_COLLEGE' as const,
      collegeId: cRCOEM.collegeId,
      organizerId: orgRCOEM.userId,
      organizerName: orgRCOEM.name,
      date: '2026-09-25',
      startTime: '08:00',
      endTime: '18:00',
      venue: 'RCOEM Sports Complex',
      registrationDeadline: '2026-09-20T23:59',
      capacity: 100,
      registrationFee: 0,
      eligibilityDescription: 'Restricted strictly to RCOEM Nagpur enrolled students.',
      status: 'REGISTRATION_OPEN' as const,
      contactInformation: 'sports@rcoem.in'
    },

    // --- Other Events ---
    {
      title: 'NVU Annual CodeSprint 2026',
      description: '24-hour inter-college competitive programming hackathon.',
      category: 'Technical',
      eventType: 'INTER_COLLEGE' as const,
      collegeId: cNVU.collegeId,
      organizerId: orgNVU.userId,
      organizerName: orgNVU.name,
      date: '2026-09-15',
      startTime: '09:00',
      endTime: '21:00',
      venue: 'NVU Turing Auditorium',
      registrationDeadline: '2026-09-10T23:59',
      capacity: 150,
      registrationFee: 0,
      eligibilityDescription: 'Open to all enrolled undergraduate students.',
      status: 'REGISTRATION_OPEN' as const,
      contactInformation: 'codesprint@nvu.edu'
    },
    {
      title: 'RoboWars 2026 - Inter-College Combat',
      description: 'Build your combat robot and test its durability in the steel cage arena.',
      category: 'Technical',
      eventType: 'INTER_COLLEGE' as const,
      collegeId: cGIT.collegeId,
      organizerId: orgGIT.userId,
      organizerName: orgGIT.name,
      date: '2026-10-12',
      startTime: '10:00',
      endTime: '18:00',
      venue: 'GIT Robotics Arena',
      registrationDeadline: '2026-10-01T23:59',
      capacity: 50,
      registrationFee: 20,
      eligibilityDescription: 'Engineering students across technical institutes.',
      status: 'REGISTRATION_OPEN' as const,
      contactInformation: 'robowars@git.edu'
    }
  ];

  for (const ed of eventsData) {
    await eventService.createEvent(ed);
  }

  console.log('✅ Events created via Factory Method & Abstract Factory');
  console.log('🎉 Database Seeding Complete!');
}
