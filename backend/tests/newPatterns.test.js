import { EventBuilder } from "../src/patterns/builder/EventBuilder.js";
import { EventPrototype } from "../src/patterns/prototype/EventPrototype.js";
import { EventCoordinator } from "../src/patterns/mediator/RegistrationMediator.js";
import { HackathonWorkflow, CulturalFestWorkflow } from "../src/patterns/template/EventWorkflow.js";
import {
  FeeCalculatorContext,
  FreeStrategy,
  EarlyBirdStrategy,
  InterCollegeFeeStrategy,
  GroupDiscountStrategy,
  StudentIdDiscountStrategy
} from "../src/patterns/strategy/FeeStrategy.js";
import { EventOriginator, EventHistoryCaretaker } from "../src/patterns/memento/EventMemento.js";
export async function runNewPatternsTests() {
  console.log("\u{1F9EA} Running Suite: New Design Patterns (Builder, Prototype, Mediator, Template, Strategy, Memento)...");
  console.log("  Testing Builder Pattern (EventBuilder)...");
  {
    const invalidBuilder = new EventBuilder();
    invalidBuilder.setDescription("Incomplete event");
    const invalidResult = invalidBuilder.validate();
    if (invalidResult.valid) {
      throw new Error("Builder should fail validation when required fields (title, date, college) are missing.");
    }
    if (invalidResult.errors.length < 3) {
      throw new Error(`Expected at least 3 validation errors, got ${invalidResult.errors.length}`);
    }
    const deadlineBuilder = new EventBuilder().setTitle("AI Symposium").setDate("2026-11-01").setCollege(1).setRegistrationDeadline("2026-11-10");
    const deadlineResult = deadlineBuilder.validate();
    if (deadlineResult.valid) {
      throw new Error("Builder should fail validation when registration deadline is after event date.");
    }
    const validBuilder = new EventBuilder().setTitle("National Code Fest 2026").setDate("2026-11-15").setCollege(1).setSchedule("10:00 AM", "06:00 PM").setVenue("Tech Auditorium 3").setRegistrationDeadline("2026-11-10").setCapacity(150).setCategory("Technical").setInterCollege(true).setPrizePool(75e3).setTeamSize(2, 4).addSpeaker("Dr. Alan Turing").addSpeaker("Ada Lovelace").addSponsor("TechCorp Global").setRegistrationFee(100);
    const builtEvent = validBuilder.build();
    if (builtEvent.title !== "National Code Fest 2026") {
      throw new Error("Builder title mismatch.");
    }
    if (builtEvent.prizePool !== 75e3) {
      throw new Error("Builder prize pool mismatch.");
    }
    if (!Array.isArray(builtEvent.speakers) || builtEvent.speakers.length !== 2) {
      throw new Error("Builder speakers array mismatch.");
    }
    if (!Array.isArray(builtEvent.sponsors) || builtEvent.sponsors.length !== 1) {
      throw new Error("Builder sponsors array mismatch.");
    }
    if (builtEvent.eventType !== "INTER_COLLEGE") {
      throw new Error("Builder eventType mismatch.");
    }
  }
  console.log("  Testing Prototype Pattern (EventPrototype deep copy)...");
  {
    const originalEvent = {
      title: "Annual Tech Fest 2025",
      date: "2025-10-20",
      venue: "Old Hall A",
      speakers: ["Keynote Speaker 1", "Keynote Speaker 2"],
      sponsors: ["Sponsor Alpha", "Sponsor Beta"],
      capacity: 200,
      currentRegistrations: 195,
      status: "COMPLETED",
      collegeId: 1
    };
    const prototype = new EventPrototype(originalEvent);
    const cloned = prototype.clone({
      title: "Annual Tech Fest 2026 (Edition 2)",
      date: "2026-10-20",
      venue: "New Convention Center"
    });
    if (cloned.title !== "Annual Tech Fest 2026 (Edition 2)") {
      throw new Error("Cloned title override failed.");
    }
    if (cloned.date !== "2026-10-20") {
      throw new Error("Cloned date override failed.");
    }
    if (cloned.venue !== "New Convention Center") {
      throw new Error("Cloned venue override failed.");
    }
    if (cloned.status !== "DRAFT") {
      throw new Error("Cloned status should reset to DRAFT.");
    }
    cloned.speakers.push("New Speaker for 2026");
    cloned.sponsors.push("New Sponsor 2026");
    if (prototype.speakers.length !== 2) {
      throw new Error("Shallow copy detected! Mutating clone modified original prototype speakers.");
    }
    if (cloned.speakers.length !== 3) {
      throw new Error("Clone speakers length unexpected.");
    }
    if (prototype.sponsors.length !== 2) {
      throw new Error("Shallow copy detected! Mutating clone modified original prototype sponsors.");
    }
  }
  console.log("  Testing Mediator Pattern (EventCoordinator)...");
  {
    const coordinator = new EventCoordinator();
    const student = { name: "Priya Verma", email: "priya@rbunagpur.in" };
    const event = {
      title: "Cyber Security Masterclass",
      capacity: 50,
      currentRegistrations: 45,
      registrationFee: 200,
      organizerId: 2,
      eventId: 101
    };
    const result = await coordinator.coordinateRegistration(student, event);
    if (!result.success || result.status !== "CONFIRMED") {
      throw new Error("Mediator registration coordination should succeed as CONFIRMED.");
    }
    if (!result.seatConfirmed || !result.paymentCleared || !result.emailSent || !result.dashboardUpdated) {
      throw new Error("All 4 mediator colleagues should report successful operations.");
    }
    const logs = result.logs;
    if (logs.length !== 4) {
      throw new Error(`Expected exactly 4 mediator log entries for the 4 colleagues, got ${logs.length}`);
    }
    const colleagues = logs.map((l) => l.colleague);
    if (colleagues[0] !== "SeatColleague" || colleagues[1] !== "PaymentColleague" || colleagues[2] !== "NotificationColleague" || colleagues[3] !== "DashboardColleague") {
      throw new Error(`Unexpected colleague dispatch sequence: ${colleagues.join(" -> ")}`);
    }
  }
  console.log("  Testing Template Method Pattern (EventWorkflow)...");
  {
    const hackathon = new HackathonWorkflow();
    const hackReport = await hackathon.run({
      title: "Web3 Innovate Hackathon",
      minTeamSize: 2,
      maxTeamSize: 4,
      prizePool: 6e4
    });
    if (hackReport.workflowType !== "HackathonWorkflow") {
      throw new Error("Unexpected workflow name.");
    }
    if (hackReport.steps.length !== 6) {
      throw new Error(`Expected 6 lifecycle steps, got ${hackReport.steps.length}`);
    }
    const step3 = hackReport.steps.find((s) => s.stepNumber === 3);
    const step5 = hackReport.steps.find((s) => s.stepNumber === 5);
    const step1 = hackReport.steps.find((s) => s.stepNumber === 1);
    if (step3.isOverridden || !step3.executedBy.includes("Base Class")) {
      throw new Error("Step 3 (Publish) should be a fixed invariant implemented in base class.");
    }
    if (step5.isOverridden || !step5.executedBy.includes("Base Class")) {
      throw new Error("Step 5 (Close) should be a fixed invariant implemented in base class.");
    }
    if (!step1.isOverridden || !step1.executedBy.includes("HackathonWorkflow")) {
      throw new Error("Step 1 (Validate) should be overridden by HackathonWorkflow.");
    }
    const cultural = new CulturalFestWorkflow();
    const culturalReport = await cultural.run({
      title: "Aarohan Annual Cultural Night"
    });
    if (culturalReport.workflowType !== "CulturalFestWorkflow") {
      throw new Error("Unexpected cultural workflow name.");
    }
    const culturalStep1 = culturalReport.steps.find((s) => s.stepNumber === 1);
    if (!culturalStep1.output.includes("stage acoustics")) {
      throw new Error("Cultural fest validate step should verify stage safety and acoustics.");
    }
  }
  console.log("  Testing Strategy Pattern (PricingStrategy)...");
  {
    const baseFee = 200;
    const context = new FeeCalculatorContext();
    context.setStrategy(new FreeStrategy());
    const freeRes = context.calculate({ baseFee });
    if (freeRes.finalFee !== 0 || freeRes.discountAmount !== 200) {
      throw new Error("FreeStrategy failed.");
    }
    context.setStrategy(new EarlyBirdStrategy(25));
    const earlyRes = context.calculate({ baseFee, isEarlyBird: true });
    if (earlyRes.finalFee !== 150 || earlyRes.discountAmount !== 50) {
      throw new Error(`EarlyBirdStrategy failed. Expected 150, got ${earlyRes.finalFee}`);
    }
    context.setStrategy(new InterCollegeFeeStrategy(50));
    const interRes = context.calculate({ baseFee, isInterCollegeStudent: true });
    if (interRes.finalFee !== 250 || interRes.surchargeAmount !== 50) {
      throw new Error(`InterCollegeFeeStrategy failed. Expected 250, got ${interRes.finalFee}`);
    }
    context.setStrategy(new GroupDiscountStrategy(20));
    const soloRes = context.calculate({ baseFee, teamSize: 1 });
    if (soloRes.finalFee !== 200) {
      throw new Error("Group discount should not apply for solo (teamSize 1).");
    }
    const groupRes = context.calculate({ baseFee, teamSize: 4 });
    if (groupRes.finalFee !== 160 || groupRes.discountAmount !== 40) {
      throw new Error(`Group discount failed. Expected 160, got ${groupRes.finalFee}`);
    }
    context.setStrategy(new StudentIdDiscountStrategy(15));
    const idRes = context.calculate({ baseFee, hasStudentId: true });
    if (idRes.finalFee !== 170 || idRes.discountAmount !== 30) {
      throw new Error(`StudentIdDiscountStrategy failed. Expected 170, got ${idRes.finalFee}`);
    }
  }
  console.log("  Testing Memento Pattern (EventMemento & History Caretaker)...");
  {
    const initialEvent = {
      title: "Grand Robotics Competition",
      venue: "Main Sports Complex",
      registrationDeadline: "2026-10-31",
      capacity: 80,
      registrationFee: 300
    };
    const originator = new EventOriginator(initialEvent);
    const caretaker = new EventHistoryCaretaker();
    await caretaker.pushSnapshot(originator, "Initial approved setup");
    originator.updateState({
      venue: "Accidental Wrong Room B",
      registrationDeadline: "2026-10-15",
      // Accidental deadline change!
      capacity: 50
    });
    const modifiedState = originator.getState();
    if (modifiedState.registrationDeadline !== "2026-10-15") {
      throw new Error("Originator state modification failed.");
    }
    await caretaker.pushSnapshot(originator, "Second edit");
    originator.updateState({
      venue: "Third Hall C",
      capacity: 20
    });
    const restored1 = await caretaker.undo(originator);
    if (!restored1 || restored1.venue !== "Accidental Wrong Room B") {
      throw new Error(`Undo 1 failed. Expected 'Accidental Wrong Room B', got '${restored1?.venue}'`);
    }
    const restoredInitial = await caretaker.undo(originator);
    if (!restoredInitial) {
      throw new Error("Undo 2 failed: snapshot not found.");
    }
    if (restoredInitial.venue !== "Main Sports Complex") {
      throw new Error(`Expected restored venue 'Main Sports Complex', got '${restoredInitial.venue}'`);
    }
    if (restoredInitial.registrationDeadline !== "2026-10-31") {
      throw new Error(`Accidental deadline edit was not restored! Got '${restoredInitial.registrationDeadline}'`);
    }
    if (restoredInitial.capacity !== 80) {
      throw new Error(`Expected capacity 80, got ${restoredInitial.capacity}`);
    }
  }
  console.log("\u2705 All New Design Patterns Tests Passed Successfully (Builder, Prototype, Mediator, Template, Strategy, Memento)!\n");
}
