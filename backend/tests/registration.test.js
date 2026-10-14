import { setupTestDb, assertEquals } from "./testHelper";
import { EventService } from "../src/services/EventService";
import { RegistrationService } from "../src/services/RegistrationService";
import { UserRepository } from "../src/repositories/UserRepository";
export async function runRegistrationTests() {
  console.log("\u{1F9EA} Running Suite: Registration Validation Chain & Duplicate Protection Tests...");
  await setupTestDb();
  const userRepo = new UserRepository();
  const eventService = new EventService();
  const regService = new RegistrationService();
  const studentRBU = await userRepo.findByUsername("bhumika_rbu");
  const organizerRBU = await userRepo.findByUsername("org_rbu");
  const studentRCOEM = await userRepo.findByUsername("aarav_rcoem");
  const event = await eventService.createEvent({
    title: "Registration Chain Demo Workshop",
    description: "Testing validation chain.",
    category: "Workshop",
    eventType: "INTRA_COLLEGE",
    collegeId: studentRBU.collegeId,
    organizerId: organizerRBU.userId,
    organizerName: organizerRBU.name,
    date: "2026-11-15",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    venue: "Hall A",
    registrationDeadline: "2026-11-10",
    capacity: 20,
    status: "PUBLISHED"
  }, organizerRBU);
  const crossResult = await regService.registerStudentForEvent(studentRCOEM.userId, event.eventId);
  assertEquals(crossResult.success, false, "Cross-college student registration should be rejected");
  assertEquals(crossResult.validationResult.handlerName, "VisibilityCheckHandler", "VisibilityCheckHandler must intercept cross-college intra registration");
  const openEvent = await eventService.createEvent({
    title: "Open University Hackfest",
    description: "Open registration event.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: organizerRBU.collegeId,
    organizerId: organizerRBU.userId,
    organizerName: organizerRBU.name,
    date: "2026-11-20",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Campus Auditorium",
    registrationDeadline: "2026-11-18",
    capacity: 50,
    status: "PUBLISHED"
  }, organizerRBU);
  const validResult = await regService.registerStudentForEvent(studentRBU.userId, openEvent.eventId);
  assertEquals(validResult.success, true, "Eligible student registration should succeed");
  assertEquals(validResult.status, "CONFIRMED", "Initial registration under capacity should be CONFIRMED");
  const duplicateResult = await regService.registerStudentForEvent(studentRBU.userId, openEvent.eventId);
  assertEquals(duplicateResult.success, false, "Duplicate registration attempt must fail");
  assertEquals(duplicateResult.validationResult.handlerName, "DuplicateRegistrationHandler", "DuplicateRegistrationHandler must intercept re-registration");
  const expiredEvent = await eventService.createEvent({
    title: "Expired Deadline Event",
    description: "Event with past deadline.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: organizerRBU.collegeId,
    organizerId: organizerRBU.userId,
    organizerName: organizerRBU.name,
    date: "2026-05-15",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    venue: "Hall B",
    registrationDeadline: "2026-05-10",
    // Past deadline
    capacity: 20,
    status: "PUBLISHED"
  }, organizerRBU);
  const expiredResult = await regService.registerStudentForEvent(studentRBU.userId, expiredEvent.eventId);
  assertEquals(expiredResult.success, false, "Registration past deadline must be rejected");
  assertEquals(expiredResult.validationResult.handlerName, "DeadlineCheckHandler", "DeadlineCheckHandler must intercept expired deadline");
  console.log("\u2705 Registration Validation Chain & Duplicate Protection Tests Passed!\n");
}
if (require.main === module) {
  runRegistrationTests().catch((err) => {
    console.error("\u274C Registration Tests Failed:", err);
    process.exit(1);
  });
}
