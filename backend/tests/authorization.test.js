import { setupTestDb, assert, assertEquals } from "./testHelper";
import { EventService } from "../src/services/EventService";
import { AuthService } from "../src/services/AuthService";
import { UserRepository } from "../src/repositories/UserRepository";
export async function runAuthorizationTests() {
  console.log("\u{1F9EA} Running Suite: Proxy Pattern, College Isolation & Authentication Tests...");
  await setupTestDb();
  const userRepo = new UserRepository();
  const eventService = new EventService();
  const authService = new AuthService();
  const testUsername = `fresh_student_${Date.now()}`;
  const testEmail = `${testUsername}@rbunagpur.in`;
  const newStudent = await authService.registerStudent({
    name: "Test New Student",
    username: testUsername,
    email: testEmail,
    passwordPlain: "mySecurePass!123",
    collegeId: 1,
    department: "Computer Science",
    year: 2,
    phone: "9876543210"
  });
  assert(!!newStudent.userId, "Registered student must have a valid userId.");
  const loginByUsername = await authService.login(testUsername, "mySecurePass!123");
  assert(!!loginByUsername.token, "Login with username should return valid JWT.");
  assertEquals(loginByUsername.user.username, testUsername, "Logged in username must match.");
  const loginByEmail = await authService.login(testEmail, "mySecurePass!123");
  assert(!!loginByEmail.token, "Login with email should return valid JWT.");
  assertEquals(loginByEmail.user.email, testEmail, "Logged in email must match.");
  const loginCaseInsensitive = await authService.login(`  ${testUsername.toUpperCase()}  `, "mySecurePass!123");
  assert(!!loginCaseInsensitive.token, "Login with uppercase/whitespace username should succeed.");
  let failedLogin = false;
  try {
    await authService.login(testUsername, "wrongPasswordAttempt");
  } catch (err) {
    failedLogin = true;
    assert(err.message.includes("Invalid"), "Wrong password must be rejected with invalid message.");
  }
  assert(failedLogin, "Login with incorrect password must fail.");
  let failedDeletion = false;
  try {
    await authService.deleteAccount(testUsername, "wrongPass");
  } catch (err) {
    failedDeletion = true;
    assert(err.message.includes("Invalid password"), "Wrong password on deletion must be rejected.");
  }
  assert(failedDeletion, "Account deletion with incorrect password must fail.");
  const delRes = await authService.deleteAccount(testUsername, "mySecurePass!123");
  assertEquals(delRes.success, true, "Valid account deletion should succeed.");
  const deletedCheck = await userRepo.findByIdentifier(testUsername);
  assertEquals(deletedCheck, void 0, "User must no longer exist in database after deletion.");
  const studentRBU = await userRepo.findByUsername("bhumika_rbu");
  const studentRCOEM = await userRepo.findByUsername("aarav_rcoem");
  const admin = await userRepo.findByUsername("admin");
  const orgRBU = await userRepo.findByUsername("org_rbu");
  const rbuLogin = await authService.login("bhumika_rbu", "password123");
  assert(!!rbuLogin.token, "Demo user bhumika_rbu should log in successfully.");
  const intraEvent = await eventService.createEvent({
    title: "RBU Closed Campus Coding Challenge",
    description: "Restricted strictly to RBU enrolled students.",
    category: "Technical",
    eventType: "INTRA_COLLEGE",
    collegeId: studentRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: "2026-11-25",
    startTime: "02:00 PM",
    endTime: "05:00 PM",
    venue: "RBU CS Lab 3",
    registrationDeadline: "2026-11-23",
    capacity: 30,
    status: "PUBLISHED"
  }, orgRBU);
  const memberAccess = await eventService.getEventByIdForUser(intraEvent.eventId, studentRBU);
  assertEquals(memberAccess.restricted, false, "RBU student should have unrestricted access to RBU intra event.");
  assert(!!memberAccess.event, "Member access should return event metadata.");
  const nonMemberAccess = await eventService.getEventByIdForUser(intraEvent.eventId, studentRCOEM);
  assertEquals(nonMemberAccess.restricted, true, "RCOEM student must be blocked from RBU intra-college event.");
  assert(nonMemberAccess.reason.includes("Proxy Access Denied") || nonMemberAccess.reason.includes("INTRA_COLLEGE"), "Denial reason must cite intra-college restriction.");
  const guestAccess = await eventService.getEventByIdForUser(intraEvent.eventId, void 0);
  assertEquals(guestAccess.restricted, true, "Unauthenticated guest must be blocked from INTRA_COLLEGE event.");
  const adminAccess = await eventService.getEventByIdForUser(intraEvent.eventId, admin);
  assertEquals(adminAccess.restricted, false, "Platform Admin must have full governance access.");
  console.log("\u2705 Proxy Pattern, College Isolation & Authentication Tests Passed!\n");
}
if (require.main === module) {
  runAuthorizationTests().catch((err) => {
    console.error("\u274C Authorization Tests Failed:", err);
    process.exit(1);
  });
}
