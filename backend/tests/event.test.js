import { setupTestDb, assert, assertEquals } from "./testHelper.js";
import { EventFactoryProvider } from "../src/patterns/factory/EventFactory.js";
import { EventService } from "../src/services/EventService.js";
import { UserRepository } from "../src/repositories/UserRepository.js";
export async function runEventTests() {
  console.log("\u{1F9EA} Running Suite: Event Factory & Creation Tests...");
  await setupTestDb();
  const userRepo = new UserRepository();
  const eventService = new EventService();
  const organizer = await userRepo.findByUsername("org_rbu");
  assert(!!organizer, "Organizer org_rbu should exist in database.");
  const techFactory = EventFactoryProvider.getFactory("Technical");
  const techData = techFactory.createEvent({
    title: "Algorithm Speedrun",
    description: "Competitive coding round.",
    category: "Technical",
    eventType: "INTER_COLLEGE",
    collegeId: organizer.collegeId,
    organizerId: organizer.userId,
    organizerName: organizer.name,
    date: "2026-10-20",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    venue: "Lab 1",
    registrationDeadline: "2026-10-18",
    capacity: 50
  });
  assertEquals(techData.category, "Technical", "Category should be Technical");
  assert(techData.eligibilityDescription.includes("programming"), "Technical event should have programming eligibility note.");
  assertEquals(techData.status, "DRAFT", "Default event status should be DRAFT");
  const culturalFactory = EventFactoryProvider.getFactory("Cultural");
  const cultData = culturalFactory.createEvent({
    title: "Acoustic Night",
    description: "Live musical showcase.",
    category: "Cultural",
    eventType: "INTRA_COLLEGE",
    collegeId: organizer.collegeId,
    organizerId: organizer.userId,
    organizerName: organizer.name,
    date: "2026-10-25",
    startTime: "06:00 PM",
    endTime: "09:00 PM",
    venue: "Auditorium",
    registrationDeadline: "2026-10-22",
    capacity: 100
  });
  assertEquals(cultData.category, "Cultural", "Category should be Cultural");
  assert(cultData.eligibilityDescription.includes("student ID"), "Cultural event should require student ID verification.");
  const createdEvent = await eventService.createEvent(techData, organizer);
  assert(!!createdEvent.eventId, "Created event should have an assigned integer eventId.");
  assertEquals(createdEvent.status, "DRAFT", "Created event should start in DRAFT status.");
  console.log("\u2705 Event Factory & Creation Tests Passed!\n");
}
if (typeof require !== "undefined" && require.main === module) {
  runEventTests().catch((err) => {
    console.error("\u274C Event Tests Failed:", err);
    process.exit(1);
  });
}
