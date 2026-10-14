import { setupTestDb, assert, assertEquals } from "./testHelper";
import { EventService } from "../src/services/EventService";
import { RegistrationService } from "../src/services/RegistrationService";
import { UserRepository } from "../src/repositories/UserRepository";
import { NotificationRepository } from "../src/repositories/NotificationRepository";
export async function runWaitlistTests() {
  console.log("\u{1F9EA} Running Suite: Waitlist Management & Auto-Promotion Tests...");
  await setupTestDb();
  const userRepo = new UserRepository();
  const eventService = new EventService();
  const regService = new RegistrationService();
  const notifRepo = new NotificationRepository();
  const organizer = await userRepo.findByUsername("org_rbu");
  const student1 = await userRepo.findByUsername("student3");
  const student2 = await userRepo.findByUsername("student4");
  const student3 = await userRepo.findByUsername("student5");
  const student4 = await userRepo.findByUsername("student6");
  const event = await eventService.createEvent({
    title: "Micro-Capacity Robotics Workshop",
    description: "Hands-on hardware session with capacity strictly capped at 2 seats.",
    category: "Workshop",
    eventType: "INTER_COLLEGE",
    collegeId: organizer.collegeId,
    organizerId: organizer.userId,
    organizerName: organizer.name,
    date: "2026-11-30",
    startTime: "01:00 PM",
    endTime: "04:00 PM",
    venue: "Hardware Lab",
    registrationDeadline: "2026-11-28",
    capacity: 2,
    status: "PUBLISHED"
  }, organizer);
  const reg1 = await regService.registerStudentForEvent(student1.userId, event.eventId);
  assertEquals(reg1.success, true, "Student 1 registration should succeed");
  assertEquals(reg1.status, "CONFIRMED", "Student 1 must be CONFIRMED");
  const reg2 = await regService.registerStudentForEvent(student2.userId, event.eventId);
  assertEquals(reg2.success, true, "Student 2 registration should succeed");
  assertEquals(reg2.status, "CONFIRMED", "Student 2 must be CONFIRMED");
  const reg3 = await regService.registerStudentForEvent(student3.userId, event.eventId);
  assertEquals(reg3.success, true, "Student 3 should be successfully waitlisted");
  assertEquals(reg3.status, "WAITLISTED", "Student 3 must receive WAITLISTED status");
  assertEquals(reg3.queuePosition, 1, "Student 3 must be first in queue (position 1)");
  const reg4 = await regService.registerStudentForEvent(student4.userId, event.eventId);
  assertEquals(reg4.success, true, "Student 4 should be successfully waitlisted");
  assertEquals(reg4.status, "WAITLISTED", "Student 4 must receive WAITLISTED status");
  assertEquals(reg4.queuePosition, 2, "Student 4 must be second in queue (position 2)");
  const cancelResult = await regService.cancelRegistration(reg1.registration.registrationId, student1.userId);
  assertEquals(cancelResult.success, true, "Cancellation of Student 1 should succeed");
  assert(!!cancelResult.promotedStudent, "A waitlisted student should be automatically promoted");
  assertEquals(cancelResult.promotedStudent.studentId, student3.userId, "Student 3 (FIFO front) must be the promoted student");
  assertEquals(cancelResult.promotedStudent.status, "CONFIRMED", "Promoted student must now be in CONFIRMED status");
  const student4Regs = await regService.getStudentRegistrations(student4.userId);
  const student4EventReg = student4Regs.find((r) => r.eventId === event.eventId);
  assertEquals(student4EventReg?.queuePosition, 1, "Student 4 queue position should now be #1");
  const student3Notifs = await notifRepo.findByUser(student3.userId);
  const promoNotif = student3Notifs.find((n) => n.type === "Waitlist Promotion");
  assert(!!promoNotif, "Promoted student must receive a Waitlist Promotion notification");
  console.log("\u2705 Waitlist Management & Auto-Promotion Tests Passed!\n");
}
if (require.main === module) {
  runWaitlistTests().catch((err) => {
    console.error("\u274C Waitlist Tests Failed:", err);
    process.exit(1);
  });
}
