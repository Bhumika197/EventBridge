import { setupTestDb, assert, assertEquals } from "./testHelper";
import { EventService } from "../src/services/EventService";
import { UserRepository } from "../src/repositories/UserRepository";
export async function runLifecycleTests() {
  console.log("\u{1F9EA} Running Suite: Event Lifecycle & Approval State Machine Tests...");
  await setupTestDb();
  const userRepo = new UserRepository();
  const eventService = new EventService();
  const organizer = await userRepo.findByUsername("org_rbu");
  const admin = await userRepo.findByUsername("admin");
  const student = await userRepo.findByUsername("bhumika_rbu");
  const draftEvent = await eventService.createEvent({
    title: "Lifecycle Verification Hackathon",
    description: "Testing lifecycle transitions.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: organizer.collegeId,
    organizerId: organizer.userId,
    organizerName: organizer.name,
    date: "2026-11-20",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Hack Center",
    registrationDeadline: "2026-11-15",
    capacity: 40
  }, organizer);
  assertEquals(draftEvent.status, "DRAFT", "Initial event status must be DRAFT");
  const submittedEvent = await eventService.submitForReview(draftEvent.eventId, organizer);
  assertEquals(submittedEvent.status, "SUBMITTED", "Status must transition to SUBMITTED");
  let studentReviewFailed = false;
  try {
    await eventService.reviewEvent(submittedEvent.eventId, "APPROVE", void 0, student);
  } catch (err) {
    studentReviewFailed = true;
    assert(err.message.includes("Unauthorized"), "Student review should be rejected as Unauthorized");
  }
  assert(studentReviewFailed, "Student should not be permitted to approve events.");
  const rejectedEvent = await eventService.reviewEvent(
    submittedEvent.eventId,
    "REJECT",
    "Please clarify the venue safety regulations before resubmission.",
    admin
  );
  assertEquals(rejectedEvent.status, "REJECTED", "Status must transition to REJECTED");
  assertEquals(
    rejectedEvent.rejectionReason,
    "Please clarify the venue safety regulations before resubmission.",
    "Rejection reason must be stored on event"
  );
  await eventService.updateEvent(rejectedEvent.eventId, { venue: "Main Auditorium (Safety Approved)" }, organizer);
  const resubmitted = await eventService.submitForReview(rejectedEvent.eventId, organizer);
  assertEquals(resubmitted.status, "SUBMITTED", "Status must transition back to SUBMITTED on re-submission");
  const approvedEvent = await eventService.reviewEvent(resubmitted.eventId, "APPROVE", void 0, admin);
  assertEquals(approvedEvent.status, "PUBLISHED", "Approved event must be in PUBLISHED status ready for registration");
  console.log("\u2705 Event Lifecycle & Approval State Machine Tests Passed!\n");
}
if (require.main === module) {
  runLifecycleTests().catch((err) => {
    console.error("\u274C Lifecycle Tests Failed:", err);
    process.exit(1);
  });
}
