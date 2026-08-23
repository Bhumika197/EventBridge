import bcrypt from 'bcryptjs';
import { DatabaseManager } from '../db/DatabaseManager';
import { CollegeRepository } from '../repositories/CollegeRepository';
import { UserRepository } from '../repositories/UserRepository';
import { EventService } from '../services/EventService';
import { RegistrationService } from '../services/RegistrationService';
import { logger } from '../utils/logger';

export async function seedDatabase() {
  logger.info('Starting EventBridge Database Seeding...');
  
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
  const regService = new RegistrationService();

  // 1. Seed Colleges
  const cRBU = await collegeRepo.create({ name: 'Ramdeobaba University', code: 'RBU', location: 'Katol Road, Nagpur', emailDomain: 'rbunagpur.in', status: 'ACTIVE' });
  const cRCOEM = await collegeRepo.create({ name: 'Shri Ramdeobaba College of Engineering and Management (RCOEM)', code: 'RCOEM', location: 'Ramdeo Tekdi, Gittikhadan, Nagpur', emailDomain: 'rcoem.in', status: 'ACTIVE' });
  const cNVU = await collegeRepo.create({ name: 'North Valley University', code: 'NVU', location: 'North Valley Campus', emailDomain: 'nvu.edu', status: 'ACTIVE' });
  const cGIT = await collegeRepo.create({ name: 'Greenfield Institute of Technology', code: 'GIT', location: 'Greenfield Tech Park', emailDomain: 'git.edu', status: 'ACTIVE' });
  const cCAC = await collegeRepo.create({ name: 'City Arts College', code: 'CAC', location: 'Downtown Metro', emailDomain: 'cac.edu', status: 'ACTIVE' });
  const cNBC = await collegeRepo.create({ name: 'National Business College', code: 'NBC', location: 'Financial Center', emailDomain: 'nbc.edu', status: 'ACTIVE' });

  const defaultPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 2. Seed Platform Admin
  const adminUser = await userRepo.create({
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

  const orgNVU = await userRepo.create({
    name: 'Dr. Sarah Jenkins (NVU Computing)',
    username: 'org_nvu',
    email: 's.jenkins@nvu.edu',
    passwordHash: defaultPassword,
    collegeId: cNVU.collegeId,
    phone: '+1-555-0103',
    role: 'EVENT_ORGANIZER',
    status: 'ACTIVE'
  });

  const orgGIT = await userRepo.create({
    name: 'Prof. Michael Chang (GIT Robotics)',
    username: 'org_git',
    email: 'm.chang@git.edu',
    passwordHash: defaultPassword,
    collegeId: cGIT.collegeId,
    phone: '+1-555-0104',
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

  // 5. Seed Additional Student Accounts
  const collegesList = [
    { id: cRBU.collegeId, domain: 'rbunagpur.in', name: 'RBU' },
    { id: cRCOEM.collegeId, domain: 'rcoem.in', name: 'RCOEM' },
    { id: cNVU.collegeId, domain: 'nvu.edu', name: 'NVU' },
    { id: cGIT.collegeId, domain: 'git.edu', name: 'GIT' },
    { id: cCAC.collegeId, domain: 'cac.edu', name: 'CAC' },
    { id: cNBC.collegeId, domain: 'nbc.edu', name: 'NBC' }
  ];

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Management', 'Design'];

  for (let i = 1; i <= 93; i++) {
    const col = collegesList[(i - 1) % collegesList.length];
    const dept = departments[(i - 1) % departments.length];
    const yr = ((i - 1) % 4) + 1;

    await userRepo.create({
      name: `Student ${i} (${col.name})`,
      username: `student${i}`,
      email: `student${i}@${col.domain}`,
      passwordHash: defaultPassword,
      collegeId: col.id,
      department: dept,
      year: yr,
      phone: `+91-98760-${String(i).padStart(4, '0')}`,
      role: 'STUDENT',
      status: 'ACTIVE'
    });
  }

  // 6. Seed Sample Events in different lifecycle states
  // Event 1: Published Inter-College Hackathon
  const e1 = await eventService.createEvent({
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
    status: 'PUBLISHED',
    contactInformation: 'hackathon@rbunagpur.in'
  });

  // Event 2: Published Intra-College Cultural Fest
  const e2 = await eventService.createEvent({
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
    status: 'PUBLISHED',
    contactInformation: 'pratibha@rcoem.in'
  });

  // Event 3: Published Sports Tournament with small capacity for waitlist demonstration (Capacity: 2)
  const e3 = await eventService.createEvent({
    title: 'Table Tennis Intra-College Open Championship',
    description: 'Competitive singles table tennis tournament. Limited capacity with active waitlist queue.',
    category: 'Sports',
    eventType: 'INTRA_COLLEGE',
    collegeId: cRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: '2026-09-20',
    startTime: '02:00 PM',
    endTime: '06:00 PM',
    venue: 'RBU Sports Hall',
    registrationDeadline: '2026-09-18',
    capacity: 2,
    registrationFee: 0.0,
    status: 'PUBLISHED',
    contactInformation: 'sports@rbunagpur.in'
  });

  // Event 4: Submitted Event Pending Admin Review
  await eventService.createEvent({
    title: 'Quantum Computing & Cryptography Seminar',
    description: 'Inter-college symposium covering quantum key distribution, post-quantum cryptography, and hybrid quantum algorithms.',
    category: 'Seminar',
    eventType: 'INTER_COLLEGE',
    collegeId: cGIT.collegeId,
    organizerId: orgGIT.userId,
    organizerName: orgGIT.name,
    date: '2026-10-18',
    startTime: '11:00 AM',
    endTime: '03:00 PM',
    venue: 'GIT Tech Center, Room 402',
    registrationDeadline: '2026-10-14',
    capacity: 80,
    registrationFee: 0.0,
    status: 'SUBMITTED',
    contactInformation: 'quantum@git.edu'
  });

  // Event 5: Draft Event
  await eventService.createEvent({
    title: 'Robotics Autonomous Navigation Workshop',
    description: 'Hands-on ROS2 and LiDAR SLAM navigation workshop for undergraduate engineering students.',
    category: 'Workshop',
    eventType: 'INTER_COLLEGE',
    collegeId: cGIT.collegeId,
    organizerId: orgGIT.userId,
    organizerName: orgGIT.name,
    date: '2026-11-01',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    venue: 'GIT Robotics Lab',
    registrationDeadline: '2026-10-28',
    capacity: 35,
    registrationFee: 200.0,
    status: 'DRAFT',
    contactInformation: 'robotics@git.edu'
  });

  // Register students for Event 1
  await regService.registerStudentForEvent(studentBhumika.userId, e1.eventId);
  await regService.registerStudentForEvent(studentAarav.userId, e1.eventId);

  // Fill Event 3 to capacity (capacity = 2) so the next registrant triggers the waitlist!
  await regService.registerStudentForEvent(studentBhumika.userId, e3.eventId); // Confirmed #1

  const student1Row = await userRepo.findByUsername('student1');
  if (student1Row) {
    await regService.registerStudentForEvent(student1Row.userId, e3.eventId); // Confirmed #2 (Capacity reached)
  }

  logger.info('Database seeding completed successfully.');
}
