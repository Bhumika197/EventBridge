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

  // 3. Seed Organizers (4 Institutional Organizers)
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

  // 4. Seed Primary Student Accounts (2 Users)
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

  // 5. Seed 93 Additional Student Accounts (student1 - student93)
  // Total Users = 1 (Admin) + 4 (Organizers) + 2 (Primary Students) + 93 (Students) = 100 TOTAL USERS
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

  console.log('✅ Exactly 100 Total User Accounts Seeded: 1 Admin, 4 Organizers, 95 Students (bhumika_rbu, aarav_rcoem, student1 - student93)');

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
