import { setupTestDb, assert, assertEquals } from './testHelper';
import { EventService } from '../src/services/EventService';
import { AuthService } from '../src/services/AuthService';
import { UserRepository } from '../src/repositories/UserRepository';

export async function runAuthorizationTests() {
  console.log('🧪 Running Suite: Proxy Pattern, College Isolation & Authentication Tests...');
  await setupTestDb();

  const userRepo = new UserRepository();
  const eventService = new EventService();
  const authService = new AuthService();

  // 1. Authentication & Registration Persistence Test
  const newStudent = await authService.registerStudent({
    name: 'Test New Student',
    username: 'fresh_student_99',
    email: 'fresh.student@rbunagpur.in',
    passwordPlain: 'mySecurePass!123',
    collegeId: 1,
    department: 'Computer Science',
    year: 2,
    phone: '9876543210'
  });
  assert(!!newStudent.userId, 'Registered student must have a valid userId.');

  // 1a. Login via exact username
  const loginByUsername = await authService.login('fresh_student_99', 'mySecurePass!123');
  assert(!!loginByUsername.token, 'Login with username should return valid JWT.');
  assertEquals(loginByUsername.user.username, 'fresh_student_99', 'Logged in username must match.');

  // 1b. Login via email
  const loginByEmail = await authService.login('fresh.student@rbunagpur.in', 'mySecurePass!123');
  assert(!!loginByEmail.token, 'Login with email should return valid JWT.');
  assertEquals(loginByEmail.user.email, 'fresh.student@rbunagpur.in', 'Logged in email must match.');

  // 1c. Login via case-insensitive username and email with whitespace
  const loginCaseInsensitive = await authService.login('  FRESH_STUDENT_99  ', 'mySecurePass!123');
  assert(!!loginCaseInsensitive.token, 'Login with uppercase/whitespace username should succeed.');

  // 1d. Login rejection with wrong password
  let failedLogin = false;
  try {
    await authService.login('fresh_student_99', 'wrongPasswordAttempt');
  } catch (err: any) {
    failedLogin = true;
    assert(err.message.includes('Invalid'), 'Wrong password must be rejected with invalid message.');
  }
  assert(failedLogin, 'Login with incorrect password must fail.');

  // 2. Existing Demo Users Login Check
  const studentRBU = (await userRepo.findByUsername('bhumika_rbu'))!; // College: RBU
  const studentRCOEM = (await userRepo.findByUsername('aarav_rcoem'))!; // College: RCOEM
  const admin = (await userRepo.findByUsername('admin'))!;
  const orgRBU = (await userRepo.findByUsername('org_rbu'))!;

  const rbuLogin = await authService.login('bhumika_rbu', 'password123');
  assert(!!rbuLogin.token, 'Demo user bhumika_rbu should log in successfully.');

  // 3. Create a strictly INTRA_COLLEGE event for RBU
  const intraEvent = await eventService.createEvent({
    title: 'RBU Closed Campus Coding Challenge',
    description: 'Restricted strictly to RBU enrolled students.',
    category: 'Technical',
    eventType: 'INTRA_COLLEGE',
    collegeId: studentRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: '2026-11-25',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    venue: 'RBU CS Lab 3',
    registrationDeadline: '2026-11-23',
    capacity: 30,
    status: 'PUBLISHED'
  }, orgRBU);

  // 4. Member student of RBU should have full access
  const memberAccess = await eventService.getEventByIdForUser(intraEvent.eventId, studentRBU);
  assertEquals(memberAccess.restricted, false, 'RBU student should have unrestricted access to RBU intra event.');
  assert(!!memberAccess.event, 'Member access should return event metadata.');

  // 5. Student of RCOEM (different college) should be blocked by EventAccessProxy
  const nonMemberAccess = await eventService.getEventByIdForUser(intraEvent.eventId, studentRCOEM);
  assertEquals(nonMemberAccess.restricted, true, 'RCOEM student must be blocked from RBU intra-college event.');
  assert(nonMemberAccess.reason!.includes('Proxy Access Denied') || nonMemberAccess.reason!.includes('INTRA_COLLEGE'), 'Denial reason must cite intra-college restriction.');

  // 6. Unauthenticated guest should also be blocked
  const guestAccess = await eventService.getEventByIdForUser(intraEvent.eventId, undefined);
  assertEquals(guestAccess.restricted, true, 'Unauthenticated guest must be blocked from INTRA_COLLEGE event.');

  // 7. Platform Admin should have audit access
  const adminAccess = await eventService.getEventByIdForUser(intraEvent.eventId, admin);
  assertEquals(adminAccess.restricted, false, 'Platform Admin must have full governance access.');

  console.log('✅ Proxy Pattern, College Isolation & Authentication Tests Passed!\n');
}

if (require.main === module) {
  runAuthorizationTests().catch(err => {
    console.error('❌ Authorization Tests Failed:', err);
    process.exit(1);
  });
}
