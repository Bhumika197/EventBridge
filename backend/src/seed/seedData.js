import bcrypt from "bcryptjs";
import { DatabaseManager } from "../db/DatabaseManager.js";
import { CollegeRepository } from "../repositories/CollegeRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { EventService } from "../services/EventService.js";
import { RegistrationService } from "../services/RegistrationService.js";
import { logger } from "../utils/logger.js";
export async function seedDatabase() {
  logger.info("Starting EventBridge Database Seeding...");
  const dbManager = DatabaseManager.getInstance();
  await dbManager.initialize();
  const db = dbManager.getDb();
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
  const cRBU = await collegeRepo.create({ name: "Ramdeobaba University", code: "RBU", location: "Katol Road, Nagpur", emailDomain: "rbunagpur.in", status: "ACTIVE" });
  const cRCOEM = await collegeRepo.create({ name: "Shri Ramdeobaba College of Engineering and Management (RCOEM)", code: "RCOEM", location: "Ramdeo Tekdi, Gittikhadan, Nagpur", emailDomain: "rcoem.in", status: "ACTIVE" });
  const cNVU = await collegeRepo.create({ name: "North Valley University", code: "NVU", location: "North Valley Campus", emailDomain: "nvu.edu", status: "ACTIVE" });
  const cGIT = await collegeRepo.create({ name: "Greenfield Institute of Technology", code: "GIT", location: "Greenfield Tech Park", emailDomain: "git.edu", status: "ACTIVE" });
  const cCAC = await collegeRepo.create({ name: "City Arts College", code: "CAC", location: "Downtown Metro", emailDomain: "cac.edu", status: "ACTIVE" });
  const cNBC = await collegeRepo.create({ name: "National Business College", code: "NBC", location: "Financial Center", emailDomain: "nbc.edu", status: "ACTIVE" });
  const demoPassword = await bcrypt.hash("12345678", 10);
  const defaultPassword = demoPassword;
  const adminPassword = demoPassword;
  const adminUser = await userRepo.create({
    name: "Platform Administrator",
    username: "admin",
    email: "admin@eventbridge.edu",
    passwordHash: adminPassword,
    collegeId: cRBU.collegeId,
    role: "PLATFORM_ADMIN",
    status: "ACTIVE"
  });
  await userRepo.create({
    name: "Bhumika Admin",
    username: "bhumika@admin.com",
    email: "bhumika@admin.com",
    passwordHash: demoPassword,
    collegeId: cRBU.collegeId,
    phone: "+91-98765-0001",
    role: "PLATFORM_ADMIN",
    status: "ACTIVE"
  });
  await userRepo.create({
    name: "Mrunali Organizer",
    username: "mrunali.rbunagpur.in",
    email: "mrunali@rbunagpur.in",
    passwordHash: demoPassword,
    collegeId: cRBU.collegeId,
    department: "Technical Events Cell",
    phone: "+91-98765-0002",
    role: "EVENT_ORGANIZER",
    status: "ACTIVE"
  });
  await userRepo.create({
    name: "Dev Student",
    username: "dev@student.com",
    email: "dev@student.com",
    passwordHash: demoPassword,
    collegeId: cRBU.collegeId,
    department: "Computer Science",
    year: 3,
    phone: "+91-98765-0003",
    role: "STUDENT",
    status: "ACTIVE"
  });
  await userRepo.create({
    name: "Dev Student",
    username: "dev",
    email: "dev.alias@student.com",
    passwordHash: demoPassword,
    collegeId: cRBU.collegeId,
    department: "Computer Science",
    year: 3,
    phone: "+91-98765-0003",
    role: "STUDENT",
    status: "ACTIVE"
  });
  const orgRBU = await userRepo.create({
    name: "Dr. Rajesh Sharma (RBU Tech Cell)",
    username: "org_rbu",
    email: "r.sharma@rbunagpur.in",
    passwordHash: defaultPassword,
    collegeId: cRBU.collegeId,
    phone: "+91-98765-0101",
    role: "EVENT_ORGANIZER",
    status: "ACTIVE"
  });
  const orgRCOEM = await userRepo.create({
    name: "Prof. Amit Verma (RCOEM Club)",
    username: "org_rcoem",
    email: "a.verma@rcoem.in",
    passwordHash: defaultPassword,
    collegeId: cRCOEM.collegeId,
    phone: "+91-98765-0202",
    role: "EVENT_ORGANIZER",
    status: "ACTIVE"
  });
  const orgNVU = await userRepo.create({
    name: "Dr. Sarah Jenkins (NVU Computing)",
    username: "org_nvu",
    email: "s.jenkins@nvu.edu",
    passwordHash: defaultPassword,
    collegeId: cNVU.collegeId,
    phone: "+1-555-0103",
    role: "EVENT_ORGANIZER",
    status: "ACTIVE"
  });
  const orgGIT = await userRepo.create({
    name: "Prof. Michael Chang (GIT Robotics)",
    username: "org_git",
    email: "m.chang@git.edu",
    passwordHash: defaultPassword,
    collegeId: cGIT.collegeId,
    phone: "+1-555-0104",
    role: "EVENT_ORGANIZER",
    status: "ACTIVE"
  });
  const orgCAC = await userRepo.create({
    name: "Prof. Elena Rostova (CAC Cultural Head)",
    username: "org_cac",
    email: "e.rostova@cac.edu",
    passwordHash: defaultPassword,
    collegeId: cCAC.collegeId,
    phone: "+1-555-0105",
    role: "EVENT_ORGANIZER",
    status: "ACTIVE"
  });
  const orgNBC = await userRepo.create({
    name: "Dr. Devendra Joshi (NBC E-Cell)",
    username: "org_nbc",
    email: "d.joshi@nbc.edu",
    passwordHash: defaultPassword,
    collegeId: cNBC.collegeId,
    phone: "+1-555-0106",
    role: "EVENT_ORGANIZER",
    status: "ACTIVE"
  });
  const studentBhumika = await userRepo.create({
    name: "Bhumika Reddy",
    username: "bhumika_rbu",
    email: "bhumika@rbunagpur.in",
    passwordHash: defaultPassword,
    collegeId: cRBU.collegeId,
    department: "Computer Science",
    year: 3,
    phone: "+91-98765-1111",
    role: "STUDENT",
    status: "ACTIVE"
  });
  const studentAarav = await userRepo.create({
    name: "Aarav Deshmukh",
    username: "aarav_rcoem",
    email: "aarav@rcoem.in",
    passwordHash: defaultPassword,
    collegeId: cRCOEM.collegeId,
    department: "Information Technology",
    year: 2,
    phone: "+91-98765-2222",
    role: "STUDENT",
    status: "ACTIVE"
  });
  const studentAlex = await userRepo.create({
    name: "Alex Sharma",
    username: "alexs",
    email: "alexs@rbunagpur.in",
    passwordHash: defaultPassword,
    collegeId: cRBU.collegeId,
    department: "Computer Science",
    year: 2,
    phone: "+91-98765-3333",
    role: "STUDENT",
    status: "ACTIVE"
  });
  const collegesList = [
    { id: cRBU.collegeId, domain: "rbunagpur.in", name: "RBU" },
    { id: cRCOEM.collegeId, domain: "rcoem.in", name: "RCOEM" },
    { id: cNVU.collegeId, domain: "nvu.edu", name: "NVU" },
    { id: cGIT.collegeId, domain: "git.edu", name: "GIT" },
    { id: cCAC.collegeId, domain: "cac.edu", name: "CAC" },
    { id: cNBC.collegeId, domain: "nbc.edu", name: "NBC" }
  ];
  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Management", "Design"];
  for (let i = 1; i <= 93; i++) {
    const col = collegesList[(i - 1) % collegesList.length];
    const dept = departments[(i - 1) % departments.length];
    const yr = (i - 1) % 4 + 1;
    await userRepo.create({
      name: `Student ${i} (${col.name})`,
      username: `student${i}`,
      email: `student${i}@${col.domain}`,
      passwordHash: defaultPassword,
      collegeId: col.id,
      department: dept,
      year: yr,
      phone: `+91-98760-${String(i).padStart(4, "0")}`,
      role: "STUDENT",
      status: "ACTIVE"
    });
  }
  const e1 = await eventService.createEvent({
    title: "HackRBU 2026: National Collegiate Hackathon",
    description: "48-hour inter-college software and product engineering hackathon hosted by Ramdeobaba University. Open to colleges nationwide with mentorship, industry judges, and cash prizes.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: cRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: "2026-11-20",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Main Auditorium, RBU Campus, Nagpur",
    registrationDeadline: "2026-11-15",
    capacity: 250,
    registrationFee: 0,
    prizePool: 75e3,
    minTeamSize: 2,
    maxTeamSize: 4,
    speakers: ["Dr. Alan Turing (Keynote Speaker)", "Ada Lovelace (System Architect)"],
    sponsors: ["Google Cloud", "GitHub Campus"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "hackathon@rbunagpur.in"
  });
  const e2 = await eventService.createEvent({
    title: "Pratibha 2026: RCOEM Annual Cultural Fest",
    description: "Grand intra-college cultural festival featuring battle of bands, dance drama, theatrical arts, and fashion show for RCOEM students.",
    category: "Cultural",
    eventType: "INTRA_COLLEGE",
    collegeId: cRCOEM.collegeId,
    organizerId: orgRCOEM.userId,
    organizerName: orgRCOEM.name,
    date: "2026-11-25",
    startTime: "10:00 AM",
    endTime: "09:00 PM",
    venue: "Open Air Theatre, RCOEM, Nagpur",
    registrationDeadline: "2026-11-20",
    capacity: 500,
    registrationFee: 150,
    prizePool: 5e4,
    speakers: ["Shreya Ghoshal (Alumni Guest)"],
    sponsors: ["Spotify", "Red Bull"],
    status: "PUBLISHED",
    contactInformation: "pratibha@rcoem.in"
  });
  const e3 = await eventService.createEvent({
    title: "Table Tennis Intra-College Open Championship",
    description: "Competitive singles table tennis tournament. Limited capacity with active waitlist queue demonstration.",
    category: "Sports",
    eventType: "INTRA_COLLEGE",
    collegeId: cRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: "2026-10-22",
    startTime: "02:00 PM",
    endTime: "06:00 PM",
    venue: "RBU Sports Hall",
    registrationDeadline: "2026-10-20",
    capacity: 2,
    registrationFee: 0,
    prizePool: 1e4,
    status: "PUBLISHED",
    contactInformation: "sports@rbunagpur.in"
  });
  const e4 = await eventService.createEvent({
    title: "Cloud & DevOps National Summit 2026",
    description: "Deep-dive symposium on microservices, Kubernetes container orchestration, GitOps automation, and hybrid-cloud resiliency.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: cRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: "2026-11-15",
    startTime: "10:00 AM",
    endTime: "04:30 PM",
    venue: "APJ Abdul Kalam Auditorium, RBU Campus",
    registrationDeadline: "2026-11-12",
    capacity: 150,
    registrationFee: 0,
    prizePool: 5e4,
    minTeamSize: 1,
    maxTeamSize: 3,
    speakers: ["Arjun Kapoor (Staff Cloud Architect, AWS)", "Priya Nair (Kubernetes Maintainer)"],
    sponsors: ["AWS Educate", "Red Hat Developer"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "cloud@rbunagpur.in"
  });
  const e5 = await eventService.createEvent({
    title: "Battle of the Bands: Inter-University Rock Night",
    description: "High-voltage collegiate musical showdown! Bands from universities across central India compete for the Golden Guitar Trophy.",
    category: "Cultural",
    eventType: "INTER_COLLEGE",
    collegeId: cCAC.collegeId,
    organizerId: orgCAC.userId,
    organizerName: orgCAC.name,
    date: "2026-11-28",
    startTime: "05:00 PM",
    endTime: "10:30 PM",
    venue: "Downtown Metro Open Arena, CAC Campus",
    registrationDeadline: "2026-11-24",
    capacity: 300,
    registrationFee: 150,
    prizePool: 6e4,
    minTeamSize: 3,
    maxTeamSize: 8,
    speakers: ["Sunil Chawla (Music Producer)", "Rhea Dsouza (Vocalist)"],
    sponsors: ["Marshall Amplification", "Spotify Campus"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "rockfest@cac.edu"
  });
  const e6 = await eventService.createEvent({
    title: "Inter-College Cricket Super League 2026",
    description: "T20 knockout tournament for university squads. Professional turf pitch, live ball-by-ball streaming, and player of the match awards.",
    category: "Sports",
    eventType: "INTER_COLLEGE",
    collegeId: cRCOEM.collegeId,
    organizerId: orgRCOEM.userId,
    organizerName: orgRCOEM.name,
    date: "2026-12-05",
    startTime: "08:30 AM",
    endTime: "05:30 PM",
    venue: "RCOEM Sports Complex & Oval Ground, Nagpur",
    registrationDeadline: "2026-11-28",
    capacity: 16,
    registrationFee: 500,
    prizePool: 1e5,
    minTeamSize: 11,
    maxTeamSize: 15,
    sponsors: ["Decathlon", "SG Cricket Gear"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "cricket@rcoem.in"
  });
  const e7 = await eventService.createEvent({
    title: "VenturePitch: National B-Plan & Startup Expo",
    description: "Collegiate startup incubation pitch desk. Founders present pitch decks to certified venture capital investors and angel syndicates.",
    category: "Management",
    eventType: "INTER_COLLEGE",
    collegeId: cNBC.collegeId,
    organizerId: orgNBC.userId,
    organizerName: orgNBC.name,
    date: "2026-12-12",
    startTime: "09:30 AM",
    endTime: "04:00 PM",
    venue: "NBC Executive Convention Center",
    registrationDeadline: "2026-12-05",
    capacity: 120,
    registrationFee: 0,
    prizePool: 15e4,
    minTeamSize: 2,
    maxTeamSize: 4,
    speakers: ["Kunal Shah (Angel Investor)", "Deepali Sen (VC Partner)"],
    sponsors: ["Sequoia Campus", "Razorpay Incubation"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "venture@nbc.edu"
  });
  const e8 = await eventService.createEvent({
    title: "Distributed Systems & Cloud Architecture Workshop",
    description: "Hands-on intensive full-day workshop covering high-concurrency Node.js architecture, message brokers, and containerized deployment.",
    category: "Workshop",
    eventType: "INTER_COLLEGE",
    collegeId: cNVU.collegeId,
    organizerId: orgNVU.userId,
    organizerName: orgNVU.name,
    date: "2026-11-10",
    startTime: "10:00 AM",
    endTime: "05:00 PM",
    venue: "NVU Turing Computing Complex, Lab A",
    registrationDeadline: "2026-11-06",
    capacity: 60,
    registrationFee: 200,
    speakers: ["Dr. Sarah Jenkins (Cloud Architect)", "Vikram Malhotra (Lead Infrastructure Engineer)"],
    sponsors: ["Red Hat Developer", "DigitalOcean Campus"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "cloud-workshop@nvu.edu"
  });
  const e9 = await eventService.createEvent({
    title: "CodeSprint: 12-Hour Speed Algorithm Challenge",
    description: "High-speed competitive programming sprint testing graph theory, dynamic programming, and data structure mastery under strict time limits.",
    category: "Technical",
    eventType: "INTRA_COLLEGE",
    collegeId: cRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: "2026-10-30",
    startTime: "08:00 AM",
    endTime: "08:00 PM",
    venue: "RBU Advanced Computer Labs 3 & 4",
    registrationDeadline: "2026-10-27",
    capacity: 80,
    registrationFee: 0,
    prizePool: 3e4,
    minTeamSize: 1,
    maxTeamSize: 2,
    sponsors: ["JetBrains", "LeetCode Campus"],
    status: "PUBLISHED",
    contactInformation: "codesprint@rbunagpur.in"
  });
  const e10 = await eventService.createEvent({
    title: "National Model United Nations (MUN 2026)",
    description: "Diplomatic simulation of UN committees tackling international crises, geopolitical treaties, human rights, and environmental resolutions.",
    category: "Literary",
    eventType: "INTER_COLLEGE",
    collegeId: cCAC.collegeId,
    organizerId: orgCAC.userId,
    organizerName: orgCAC.name,
    date: "2026-12-18",
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    venue: "Central Assembly Hall, City Arts College",
    registrationDeadline: "2026-12-10",
    capacity: 180,
    registrationFee: 250,
    prizePool: 45e3,
    minTeamSize: 1,
    maxTeamSize: 1,
    speakers: ["Ambassador R. Parthasarathy", "Dr. Meenakshi Sundaram"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "mun2026@cac.edu"
  });
  const e11 = await eventService.createEvent({
    title: "UI/UX Designathon & Product Prototype Jam",
    description: "Design sprint challenging student designers to solve real-world accessibility and fintech UX bottlenecks using Figma design systems.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: cGIT.collegeId,
    organizerId: orgGIT.userId,
    organizerName: orgGIT.name,
    date: "2026-11-22",
    startTime: "10:00 AM",
    endTime: "07:00 PM",
    venue: "Design Studio & Innovation Lab, GIT Tech Park",
    registrationDeadline: "2026-11-18",
    capacity: 75,
    registrationFee: 0,
    prizePool: 4e4,
    minTeamSize: 2,
    maxTeamSize: 3,
    speakers: ["Tanvi Sethi (Staff Product Designer)"],
    sponsors: ["Figma Community", "Dribbble"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "designjam@git.edu"
  });
  const e12 = await eventService.createEvent({
    title: "Badminton Singles & Doubles Trophy",
    description: "Intra-college tournament across men and women singles and mixed doubles brackets. Yonex shuttlecocks provided.",
    category: "Sports",
    eventType: "INTRA_COLLEGE",
    collegeId: cRCOEM.collegeId,
    organizerId: orgRCOEM.userId,
    organizerName: orgRCOEM.name,
    date: "2026-11-04",
    startTime: "04:00 PM",
    endTime: "08:30 PM",
    venue: "Indoor Badminton Arena, RCOEM",
    registrationDeadline: "2026-11-01",
    capacity: 32,
    registrationFee: 50,
    prizePool: 15e3,
    minTeamSize: 1,
    maxTeamSize: 2,
    status: "PUBLISHED",
    contactInformation: "badminton@rcoem.in"
  });
  const e13 = await eventService.createEvent({
    title: "CyberShield CTF: National Cybersecurity Contest",
    description: "Jeopardy-style capture the flag contest testing binary exploitation, reverse engineering, web security, cryptography, and forensics.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: cGIT.collegeId,
    organizerId: orgGIT.userId,
    organizerName: orgGIT.name,
    date: "2026-12-02",
    startTime: "09:00 AM",
    endTime: "09:00 PM",
    venue: "Cyber Range, Greenfield Institute of Technology",
    registrationDeadline: "2026-11-26",
    capacity: 100,
    registrationFee: 0,
    prizePool: 75e3,
    minTeamSize: 2,
    maxTeamSize: 4,
    speakers: ["Col. Vivek Nair (Cyber Defense Strategist)"],
    sponsors: ["CrowdStrike", "Offensive Security"],
    isInterCollege: true,
    status: "PUBLISHED",
    contactInformation: "ctf@git.edu"
  });
  await eventService.createEvent({
    title: "Quantum Computing & Post-Quantum Cryptography Seminar",
    description: "Inter-college symposium covering quantum key distribution, Shor algorithm threats, and NIST post-quantum standardization.",
    category: "Seminar",
    eventType: "INTER_COLLEGE",
    collegeId: cGIT.collegeId,
    organizerId: orgGIT.userId,
    organizerName: orgGIT.name,
    date: "2026-12-08",
    startTime: "11:00 AM",
    endTime: "03:00 PM",
    venue: "GIT Tech Center, Room 402",
    registrationDeadline: "2026-12-01",
    capacity: 80,
    registrationFee: 0,
    status: "SUBMITTED",
    contactInformation: "quantum@git.edu"
  });
  await eventService.createEvent({
    title: "Robotics Autonomous Navigation Workshop",
    description: "Hands-on ROS2 and LiDAR SLAM navigation workshop for undergraduate engineering students.",
    category: "Workshop",
    eventType: "INTER_COLLEGE",
    collegeId: cGIT.collegeId,
    organizerId: orgGIT.userId,
    organizerName: orgGIT.name,
    date: "2026-12-15",
    startTime: "10:00 AM",
    endTime: "04:00 PM",
    venue: "GIT Robotics Lab",
    registrationDeadline: "2026-12-10",
    capacity: 35,
    registrationFee: 200,
    status: "DRAFT",
    contactInformation: "robotics@git.edu"
  });
  await regService.registerStudentForEvent(studentBhumika.userId, e1.eventId);
  await regService.registerStudentForEvent(studentAarav.userId, e1.eventId);
  const studentUsers = await Promise.all([
    userRepo.findByUsername("student1"),
    userRepo.findByUsername("student2"),
    userRepo.findByUsername("student3"),
    userRepo.findByUsername("student4"),
    userRepo.findByUsername("student5"),
    userRepo.findByUsername("student6"),
    userRepo.findByUsername("student7"),
    userRepo.findByUsername("student8"),
    userRepo.findByUsername("student9")
  ]);
  if (studentUsers[0]) await regService.registerStudentForEvent(studentUsers[0].userId, e1.eventId);
  if (studentUsers[1]) await regService.registerStudentForEvent(studentUsers[1].userId, e1.eventId);
  await regService.registerStudentForEvent(studentAarav.userId, e2.eventId);
  if (studentUsers[2]) await regService.registerStudentForEvent(studentUsers[2].userId, e2.eventId);
  if (studentUsers[3]) await regService.registerStudentForEvent(studentUsers[3].userId, e2.eventId);
  await regService.registerStudentForEvent(studentBhumika.userId, e3.eventId);
  if (studentUsers[0]) {
    await regService.registerStudentForEvent(studentUsers[0].userId, e3.eventId);
  }
  await regService.registerStudentForEvent(studentAlex.userId, e4.eventId);
  if (studentUsers[4]) await regService.registerStudentForEvent(studentUsers[4].userId, e4.eventId);
  if (studentUsers[5]) await regService.registerStudentForEvent(studentUsers[5].userId, e5.eventId);
  if (studentUsers[6]) await regService.registerStudentForEvent(studentUsers[6].userId, e5.eventId);
  if (studentUsers[7]) await regService.registerStudentForEvent(studentUsers[7].userId, e7.eventId);
  await regService.registerStudentForEvent(studentBhumika.userId, e8.eventId);
  if (studentUsers[8]) await regService.registerStudentForEvent(studentUsers[8].userId, e8.eventId);
  logger.info("Database seeding completed successfully.");
}
