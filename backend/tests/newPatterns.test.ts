import { EventBuilder } from '../src/patterns/builder/EventBuilder';
import { EventPrototype } from '../src/patterns/prototype/EventPrototype';
import { EventCoordinator } from '../src/patterns/mediator/RegistrationMediator';
import { HackathonWorkflow, CulturalFestWorkflow } from '../src/patterns/template/EventWorkflow';
import {
  FeeCalculatorContext,
  FreeStrategy,
  EarlyBirdStrategy,
  InterCollegeFeeStrategy,
  GroupDiscountStrategy,
  StudentIdDiscountStrategy
} from '../src/patterns/strategy/FeeStrategy';
import { EventOriginator, EventHistoryCaretaker } from '../src/patterns/memento/EventMemento';

export async function runNewPatternsTests() {
  console.log('🧪 Running Suite: New Design Patterns (Builder, Prototype, Mediator, Template, Strategy, Memento)...');

  // =========================================================================
  // 1. BUILDER PATTERN TESTS
  // =========================================================================
  console.log('  Testing Builder Pattern (EventBuilder)...');
  {
    // A. Validation failure on missing required fields
    const invalidBuilder = new EventBuilder();
    invalidBuilder.setDescription('Incomplete event');
    const invalidResult = invalidBuilder.validate();
    if (invalidResult.valid) {
      throw new Error('Builder should fail validation when required fields (title, date, college) are missing.');
    }
    if (invalidResult.errors.length < 3) {
      throw new Error(`Expected at least 3 validation errors, got ${invalidResult.errors.length}`);
    }

    // B. Validation failure on invalid deadline (deadline after event date)
    const deadlineBuilder = new EventBuilder()
      .setTitle('AI Symposium')
      .setDate('2026-11-01')
      .setCollege(1)
      .setRegistrationDeadline('2026-11-10'); // After date!
    const deadlineResult = deadlineBuilder.validate();
    if (deadlineResult.valid) {
      throw new Error('Builder should fail validation when registration deadline is after event date.');
    }

    // C. Successful build with chained optional fields
    const validBuilder = new EventBuilder()
      .setTitle('National Code Fest 2026')
      .setDate('2026-11-15')
      .setCollege(1)
      .setSchedule('10:00 AM', '06:00 PM')
      .setVenue('Tech Auditorium 3')
      .setRegistrationDeadline('2026-11-10')
      .setCapacity(150)
      .setCategory('Technical')
      .setInterCollege(true)
      .setPrizePool(75000)
      .setTeamSize(2, 4)
      .addSpeaker('Dr. Alan Turing')
      .addSpeaker('Ada Lovelace')
      .addSponsor('TechCorp Global')
      .setRegistrationFee(100);

    const builtEvent = validBuilder.build();
    if (builtEvent.title !== 'National Code Fest 2026') {
      throw new Error('Builder title mismatch.');
    }
    if (builtEvent.prizePool !== 75000) {
      throw new Error('Builder prize pool mismatch.');
    }
    if (!Array.isArray(builtEvent.speakers) || builtEvent.speakers.length !== 2) {
      throw new Error('Builder speakers array mismatch.');
    }
    if (!Array.isArray(builtEvent.sponsors) || builtEvent.sponsors.length !== 1) {
      throw new Error('Builder sponsors array mismatch.');
    }
    if (builtEvent.eventType !== 'INTER_COLLEGE') {
      throw new Error('Builder eventType mismatch.');
    }
  }

  // =========================================================================
  // 2. PROTOTYPE PATTERN TESTS
  // =========================================================================
  console.log('  Testing Prototype Pattern (EventPrototype deep copy)...');
  {
    const originalEvent = {
      title: 'Annual Tech Fest 2025',
      date: '2025-10-20',
      venue: 'Old Hall A',
      speakers: ['Keynote Speaker 1', 'Keynote Speaker 2'],
      sponsors: ['Sponsor Alpha', 'Sponsor Beta'],
      capacity: 200,
      currentRegistrations: 195,
      status: 'COMPLETED' as any,
      collegeId: 1
    };

    const prototype = new EventPrototype(originalEvent);
    const cloned = prototype.clone({
      title: 'Annual Tech Fest 2026 (Edition 2)',
      date: '2026-10-20',
      venue: 'New Convention Center'
    });

    // Verify properties
    if (cloned.title !== 'Annual Tech Fest 2026 (Edition 2)') {
      throw new Error('Cloned title override failed.');
    }
    if (cloned.date !== '2026-10-20') {
      throw new Error('Cloned date override failed.');
    }
    if (cloned.venue !== 'New Convention Center') {
      throw new Error('Cloned venue override failed.');
    }
    if (cloned.status !== 'DRAFT') {
      throw new Error('Cloned status should reset to DRAFT.');
    }

    // Verify DEEP COPY of arrays: modifying clone must not mutate prototype
    cloned.speakers.push('New Speaker for 2026');
    cloned.sponsors.push('New Sponsor 2026');

    if (prototype.speakers.length !== 2) {
      throw new Error('Shallow copy detected! Mutating clone modified original prototype speakers.');
    }
    if (cloned.speakers.length !== 3) {
      throw new Error('Clone speakers length unexpected.');
    }
    if (prototype.sponsors.length !== 2) {
      throw new Error('Shallow copy detected! Mutating clone modified original prototype sponsors.');
    }
  }

  // =========================================================================
  // 3. MEDIATOR PATTERN TESTS
  // =========================================================================
  console.log('  Testing Mediator Pattern (EventCoordinator)...');
  {
    const coordinator = new EventCoordinator();
    const student = { name: 'Priya Verma', email: 'priya@rbunagpur.in' };
    const event = {
      title: 'Cyber Security Masterclass',
      capacity: 50,
      currentRegistrations: 45,
      registrationFee: 200,
      organizerId: 2,
      eventId: 101
    };

    const result = await coordinator.coordinateRegistration(student, event);
    if (!result.success || result.status !== 'CONFIRMED') {
      throw new Error('Mediator registration coordination should succeed as CONFIRMED.');
    }
    if (!result.seatConfirmed || !result.paymentCleared || !result.emailSent || !result.dashboardUpdated) {
      throw new Error('All 4 mediator colleagues should report successful operations.');
    }

    const logs = result.logs;
    if (logs.length !== 4) {
      throw new Error(`Expected exactly 4 mediator log entries for the 4 colleagues, got ${logs.length}`);
    }

    // Verify colleague sequence
    const colleagues = logs.map(l => l.colleague);
    if (
      colleagues[0] !== 'SeatColleague' ||
      colleagues[1] !== 'PaymentColleague' ||
      colleagues[2] !== 'NotificationColleague' ||
      colleagues[3] !== 'DashboardColleague'
    ) {
      throw new Error(`Unexpected colleague dispatch sequence: ${colleagues.join(' -> ')}`);
    }
  }

  // =========================================================================
  // 4. TEMPLATE METHOD PATTERN TESTS
  // =========================================================================
  console.log('  Testing Template Method Pattern (EventWorkflow)...');
  {
    // A. HackathonWorkflow
    const hackathon = new HackathonWorkflow();
    const hackReport = await hackathon.run({
      title: 'Web3 Innovate Hackathon',
      minTeamSize: 2,
      maxTeamSize: 4,
      prizePool: 60000
    });

    if (hackReport.workflowType !== 'HackathonWorkflow') {
      throw new Error('Unexpected workflow name.');
    }
    if (hackReport.steps.length !== 6) {
      throw new Error(`Expected 6 lifecycle steps, got ${hackReport.steps.length}`);
    }

    // Check invariant vs overridden steps
    const step3 = hackReport.steps.find(s => s.stepNumber === 3)!; // publish
    const step5 = hackReport.steps.find(s => s.stepNumber === 5)!; // close
    const step1 = hackReport.steps.find(s => s.stepNumber === 1)!; // validate

    if (step3.isOverridden || !step3.executedBy.includes('Base Class')) {
      throw new Error('Step 3 (Publish) should be a fixed invariant implemented in base class.');
    }
    if (step5.isOverridden || !step5.executedBy.includes('Base Class')) {
      throw new Error('Step 5 (Close) should be a fixed invariant implemented in base class.');
    }
    if (!step1.isOverridden || !step1.executedBy.includes('HackathonWorkflow')) {
      throw new Error('Step 1 (Validate) should be overridden by HackathonWorkflow.');
    }

    // B. CulturalFestWorkflow
    const cultural = new CulturalFestWorkflow();
    const culturalReport = await cultural.run({
      title: 'Aarohan Annual Cultural Night'
    });

    if (culturalReport.workflowType !== 'CulturalFestWorkflow') {
      throw new Error('Unexpected cultural workflow name.');
    }
    const culturalStep1 = culturalReport.steps.find(s => s.stepNumber === 1)!;
    if (!culturalStep1.output.includes('stage acoustics')) {
      throw new Error('Cultural fest validate step should verify stage safety and acoustics.');
    }
  }

  // =========================================================================
  // 5. STRATEGY PATTERN TESTS
  // =========================================================================
  console.log('  Testing Strategy Pattern (PricingStrategy)...');
  {
    const baseFee = 200;
    const context = new FeeCalculatorContext();

    // Strategy 1: Free
    context.setStrategy(new FreeStrategy());
    const freeRes = context.calculate({ baseFee });
    if (freeRes.finalFee !== 0 || freeRes.discountAmount !== 200) {
      throw new Error('FreeStrategy failed.');
    }

    // Strategy 2: EarlyBird (25% off)
    context.setStrategy(new EarlyBirdStrategy(25));
    const earlyRes = context.calculate({ baseFee, isEarlyBird: true });
    if (earlyRes.finalFee !== 150 || earlyRes.discountAmount !== 50) {
      throw new Error(`EarlyBirdStrategy failed. Expected 150, got ${earlyRes.finalFee}`);
    }

    // Strategy 3: InterCollegeFee (+50 surcharge)
    context.setStrategy(new InterCollegeFeeStrategy(50));
    const interRes = context.calculate({ baseFee, isInterCollegeStudent: true });
    if (interRes.finalFee !== 250 || interRes.surchargeAmount !== 50) {
      throw new Error(`InterCollegeFeeStrategy failed. Expected 250, got ${interRes.finalFee}`);
    }

    // Strategy 4: GroupDiscount (20% off for >= 3)
    context.setStrategy(new GroupDiscountStrategy(20));
    const soloRes = context.calculate({ baseFee, teamSize: 1 });
    if (soloRes.finalFee !== 200) {
      throw new Error('Group discount should not apply for solo (teamSize 1).');
    }
    const groupRes = context.calculate({ baseFee, teamSize: 4 });
    if (groupRes.finalFee !== 160 || groupRes.discountAmount !== 40) {
      throw new Error(`Group discount failed. Expected 160, got ${groupRes.finalFee}`);
    }

    // Strategy 5: StudentIdDiscount (15% off)
    context.setStrategy(new StudentIdDiscountStrategy(15));
    const idRes = context.calculate({ baseFee, hasStudentId: true });
    if (idRes.finalFee !== 170 || idRes.discountAmount !== 30) {
      throw new Error(`StudentIdDiscountStrategy failed. Expected 170, got ${idRes.finalFee}`);
    }
  }

  // =========================================================================
  // 6. MEMENTO PATTERN TESTS
  // =========================================================================
  console.log('  Testing Memento Pattern (EventMemento & History Caretaker)...');
  {
    const initialEvent = {
      title: 'Grand Robotics Competition',
      venue: 'Main Sports Complex',
      registrationDeadline: '2026-10-31',
      capacity: 80,
      registrationFee: 300
    };

    const originator = new EventOriginator(initialEvent);
    const caretaker = new EventHistoryCaretaker();

    // 1. Take snapshot of initial state
    await caretaker.pushSnapshot(originator, 'Initial approved setup');

    // 2. Accidental / faulty edit: deadline moved mistakenly
    originator.updateState({
      venue: 'Accidental Wrong Room B',
      registrationDeadline: '2026-10-15', // Accidental deadline change!
      capacity: 50
    });

    const modifiedState = originator.getState();
    if (modifiedState.registrationDeadline !== '2026-10-15') {
      throw new Error('Originator state modification failed.');
    }

    // Take another snapshot after another edit
    await caretaker.pushSnapshot(originator, 'Second edit');

    originator.updateState({
      venue: 'Third Hall C',
      capacity: 20
    });

    // 3. Undo latest edit
    const restored1 = await caretaker.undo(originator);
    if (!restored1 || restored1.venue !== 'Accidental Wrong Room B') {
      throw new Error(`Undo 1 failed. Expected 'Accidental Wrong Room B', got '${restored1?.venue}'`);
    }

    // 4. Undo back to initial state!
    const restoredInitial = await caretaker.undo(originator);
    if (!restoredInitial) {
      throw new Error('Undo 2 failed: snapshot not found.');
    }
    if (restoredInitial.venue !== 'Main Sports Complex') {
      throw new Error(`Expected restored venue 'Main Sports Complex', got '${restoredInitial.venue}'`);
    }
    if (restoredInitial.registrationDeadline !== '2026-10-31') {
      throw new Error(`Accidental deadline edit was not restored! Got '${restoredInitial.registrationDeadline}'`);
    }
    if (restoredInitial.capacity !== 80) {
      throw new Error(`Expected capacity 80, got ${restoredInitial.capacity}`);
    }
  }

  console.log('✅ All New Design Patterns Tests Passed Successfully (Builder, Prototype, Mediator, Template, Strategy, Memento)!\n');
}
