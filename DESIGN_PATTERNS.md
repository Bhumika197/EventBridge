# EventBridge — Design Patterns Architecture

This document details the software design patterns implemented in **EventBridge**. Every pattern solves a concrete engineering problem in university event creation, access control, registration workflows, dynamic fee calculation, and edit versioning.

---

## 🎯 Master Patterns Overview

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EventBridge Design Patterns                                 │
├──────────────────────────┬────────────────────────────┬─────────────────────────────────────┤
│ Creational Patterns      │ Structural Patterns        │ Behavioral & Architectural Patterns │
├──────────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ 1. Builder Pattern       │ 6. Proxy Pattern           │ 9. Chain of Responsibility          │
│ 2. Prototype Pattern     │ 7. Bridge Pattern          │ 10. Mediator Pattern                │
│ 3. Factory Method        │                            │ 11. Template Method Pattern         │
│ 4. Abstract Factory      │                            │ 12. Strategy Pattern                │
│ 5. Singleton Pattern     │                            │ 13. Memento Pattern                 │
│                          │                            │ 14. Observer Pattern                │
│                          │                            │ 15. MVC Architectural Pattern       │
└──────────────────────────┴────────────────────────────┴─────────────────────────────────────┘
```

---

## 1. Builder Pattern

### Problem
Events in a university ecosystem require a rich mix of mandatory and optional configuration:
- **Mandatory**: `title`, `date`, `collegeId`.
- **Optional**: `prizePool`, team size constraints (`minTeamSize`, `maxTeamSize`), multiple `speakers`, multiple `sponsors`, schedule timings, venue, and institutional visibility flags (`isInterCollege`).

Using a telescoping constructor or a large untyped JavaScript object causes ordering bugs, missing validations, and untracked defaults.

### Solution
`EventBuilder` provides chained, fluent configuration steps (`setTitle`, `setDate`, `setCollege`, `setPrizePool`, `setTeamSize`, `addSpeaker`, `addSponsor`, `setInterCollege`). The terminal `build()` method executes strict domain invariant checks (e.g., verifying mandatory fields, ensuring `minTeamSize <= maxTeamSize`, and checking registration deadline logic) before returning a validated `EventCreationData` entity.

### Source Files
- Implementation: [`backend/src/patterns/builder/EventBuilder.ts`](backend/src/patterns/builder/EventBuilder.ts)
- Frontend Wizard: [`frontend/src/components/CreateEventWizardModal.tsx`](frontend/src/components/CreateEventWizardModal.tsx)

```typescript
const event = new EventBuilder()
  .setTitle("National AI Hackathon 2026")
  .setDate("2026-11-20")
  .setCollege(1)
  .setSchedule("09:00 AM", "06:00 PM")
  .setVenue("APJ Abdul Kalam Auditorium")
  .setCapacity(200)
  .setInterCollege(true)
  .setPrizePool(75000)
  .setTeamSize(2, 4)
  .addSpeaker("Dr. Alan Turing")
  .addSpeaker("Ada Lovelace")
  .addSponsor("Google Cloud")
  .build(); // Validates required fields and builds typed event object
```

---

## 2. Prototype Pattern

### Problem
Colleges frequently rerun major annual fests, technical hackathons, and symposiums every academic year. Entering all rules, prize structures, speakers, and sponsors from scratch is slow and prone to typographical errors. Furthermore, a naive shallow copy (`Object.assign` or spread operator) copies array references by pointer, meaning mutating the duplicate's speakers or sponsors would mutate the historical event.

### Solution
`EventPrototype` implements the `Prototype<T>` interface with a `clone()` method. It performs a true deep-copy of reference fields (e.g. `speakers` and `sponsors` arrays via spread/JSON duplication), resets attendee count to `0`, sets event status to `DRAFT`, and applies organizer-provided overrides for the new edition's `date`, `venue`, and `title`.

### Source Files
- Implementation: [`backend/src/patterns/prototype/EventPrototype.ts`](backend/src/patterns/prototype/EventPrototype.ts)
- Duplicate Modal: [`frontend/src/components/DuplicateEventModal.tsx`](frontend/src/components/DuplicateEventModal.tsx)

```typescript
export class EventPrototype implements Prototype<EventPrototype> {
  public clone(overrides?: { date?: string; venue?: string; title?: string }): EventPrototype {
    return new EventPrototype({
      ...this,
      title: overrides?.title || `${this.title} (Clone)`,
      date: overrides?.date || this.date,
      venue: overrides?.venue || this.venue,
      status: 'DRAFT',
      currentRegistrations: 0,
      speakers: [...this.speakers], // Isolated deep copy
      sponsors: [...this.sponsors]  // Isolated deep copy
    });
  }
}
```

---

## 3. Mediator Pattern

### Problem
When a student registers for an event, multiple autonomous subsystems must execute in strict sequence:
1. Seat capacity check and reservation (`SeatColleague`).
2. Payment calculation and gateway clearance (`PaymentColleague`).
3. Confirmation ticket email dispatch (`NotificationColleague`).
4. Live organizer attendee dashboard roster update (`DashboardColleague`).

Having each module invoke the other directly creates tangled point-to-point "spaghetti" coupling, making unit testing impossible without mocking all subsystems at once.

### Solution
`EventCoordinator` implements the `Mediator` interface. Colleagues inherit from `Colleague` and communicate solely through `mediator.notify(sender, event, data)`. The mediator encapsulates the sequence and business orchestration, preserving loose coupling between components.

### Source Files
- Implementation: [`backend/src/patterns/mediator/RegistrationMediator.ts`](backend/src/patterns/mediator/RegistrationMediator.ts)
- Live Sandbox: [`frontend/src/components/PatternDemoPanels.tsx`](frontend/src/components/PatternDemoPanels.tsx)

```typescript
export class EventCoordinator implements Mediator {
  public async coordinateRegistration(student: User, event: Event) {
    // 1. Seat check
    const seat = await this.seatColleague.checkAndReserveSeat(event);
    // 2. Fee payment
    const payment = await this.paymentColleague.processPayment(event.registrationFee, student);
    // 3. Confirmation email
    const email = await this.notificationColleague.sendConfirmation(student, event, !seat.available);
    // 4. Live organizer dashboard refresh
    const dashboard = await this.dashboardColleague.updateOrganizerDashboard(event.organizerId, event.eventId, 'CONFIRMED');
    return { success: true, seat, payment, email, dashboard };
  }
}
```

---

## 4. Template Method Pattern

### Problem
All campus events follow an invariant administrative lifecycle:
1. `validate(event)`
2. `setupRegistration(event)`
3. `publish(event)`
4. `executeEvent(event)`
5. `close(event)`
6. `generateReport(event)`

However, specific event genres differ fundamentally in operational execution:
- **Hackathons**: Require multi-person team registration, GitHub commit tracking, and judge rubric evaluation.
- **Cultural Fests**: Require solo/group performance slots, stage acoustics clearance, and audience ticketing gates.

Rewriting the entire lifecycle algorithm for each category duplicates the skeleton sequence and risks missed steps.

### Solution
`EventWorkflow` defines the final `run()` template method enforcing the invariant step sequence (`publish` and `close` are concrete base methods). `HackathonWorkflow` and `CulturalFestWorkflow` override only the primitive hooks (`setupRegistration`, `executeEvent`, `generateReport`) that differ.

### Source Files
- Implementation: [`backend/src/patterns/template/EventWorkflow.ts`](backend/src/patterns/template/EventWorkflow.ts)

```typescript
export abstract class EventWorkflow {
  // Template Method: Skeleton Algorithm
  public async run(event: Partial<Event>): Promise<WorkflowReport> {
    await this.validate(event);          // Hook
    await this.setupRegistration(event); // Hook
    await this.publish(event);           // Base invariant
    await this.executeEvent(event);      // Hook
    await this.close(event);             // Base invariant
    return await this.generateReport(event); // Hook
  }
}
```

---

## 5. Strategy Pattern

### Problem
Different events require distinct ticket pricing strategies:
- Open seminars are free.
- Early registrations receive discounts.
- External non-college students incur an institutional surcharge.
- Hackathon teams receive group discounts.
- Students with validated ID cards receive student subsidies.

Hardcoding nested `if-else` or `switch` statements inside registration controllers violates the Open/Closed Principle and creates brittle pricing calculation code.

### Solution
Define the `PricingStrategy` interface with `calculateFee(context: FeeCalculationContext)`. Concrete strategies (`FreeStrategy`, `EarlyBirdStrategy`, `InterCollegeFeeStrategy`, `GroupDiscountStrategy`, `StudentIdDiscountStrategy`) encapsulate their specific formulas. `FeeCalculatorContext` dynamically executes whichever strategy is configured at runtime.

### Source Files
- Implementation: [`backend/src/patterns/strategy/FeeStrategy.ts`](backend/src/patterns/strategy/FeeStrategy.ts)

```typescript
export interface PricingStrategy {
  calculateFee(context: FeeCalculationContext): FeeBreakdown;
}

export class GroupDiscountStrategy implements PricingStrategy {
  constructor(private discountPercent: number = 20) {}
  public calculateFee(ctx: FeeCalculationContext): FeeBreakdown {
    if (ctx.teamSize >= 3) {
      const discount = Math.round((ctx.baseFee * this.discountPercent) / 100);
      return { strategyName: 'GroupDiscountStrategy', originalFee: ctx.baseFee, discountAmount: discount, finalFee: ctx.baseFee - discount };
    }
    return { strategyName: 'GroupDiscountStrategy', originalFee: ctx.baseFee, discountAmount: 0, finalFee: ctx.baseFee };
  }
}
```

---

## 6. Memento Pattern

### Problem
Organizers frequently modify event details (dates, venues, deadlines, team requirements). Accidental edits to registration deadlines immediately shut out prospective applicants. Organizers require a dependable **"Undo"** mechanism and version history stack without violating object encapsulation or exposing private database fields.

### Solution
Implement the Memento pattern:
- **`EventMemento`**: Immutable state snapshot storing deep-copied event data, timestamp, and optional modification note.
- **`EventOriginator`**: Originator class capable of creating snapshots from current state and restoring state from a memento.
- **`EventHistoryCaretaker`**: Manages the version stack and persists snapshots into SQLite table `EVENT_MEMENTO`. An "Undo" command pops the top snapshot and restores the event.

### Source Files
- Implementation: [`backend/src/patterns/memento/EventMemento.ts`](backend/src/patterns/memento/EventMemento.ts)
- Version Modal: [`frontend/src/components/EventVersionModal.tsx`](frontend/src/components/EventVersionModal.tsx)

```typescript
// Snapshot before modification:
const originator = new EventOriginator(currentEvent);
await caretaker.pushSnapshot(originator, 'Changed registration deadline');

// Accidental edit occurred...
// Organizer clicks Undo:
const restoredData = await caretaker.undo(originator);
await eventRepository.update(eventId, restoredData);
```

---

## 7. Model-View-Controller (MVC) Pattern

### Problem
In complex web applications, coupling presentation code directly to database queries or mixing API response formatting inside React views produces unmaintainable, untestable code.

### Solution
EventBridge enforces strict 3-tier MVC separation:
- **Model**: SQLite entities (`Event`, `User`, `Registration`), `DatabaseManager`, and DAO repositories (`EventRepository`, `MementoRepository`). Manages data schemas and transactional integrity. Never touches HTML or the browser DOM.
- **View**: React components (`EventCard`, `OrganizerDashboard`, `CreateEventWizardModal`, `DesignPatternExplorer`). Renders presentation UI and captures user input. Never executes raw SQL or touches backend state directly.
- **Controller**: Express route handlers (`EventController`, `RegistrationController`, `AuthController`) and frontend `api.ts` service client. Coordinates incoming requests, validates input, calls domain services, and formats JSON responses.

### Source Files
- Models: [`backend/src/repositories/`](backend/src/repositories/)
- Views: [`frontend/src/pages/`](frontend/src/pages/), [`frontend/src/components/`](frontend/src/components/)
- Controllers: [`backend/src/controllers/`](backend/src/controllers/), [`frontend/src/services/api.ts`](frontend/src/services/api.ts)

---

## 8. Factory Method Pattern

### Problem
Different categories of events (`Technical`, `Cultural`, `Sports`, `Workshop`, `Seminar`) require domain-specific defaults (e.g., programming laptops for technical events, acoustic guidelines for cultural fests, sports safety declarations).

### Solution
Abstract `EventFactory` defines `createEvent(data)`. Category-specific factories (`TechnicalEventFactory`, `CulturalEventFactory`, `SportsEventFactory`, etc.) set appropriate eligibility notes and configurations.

### Source Files
- [`backend/src/patterns/factory/EventFactory.ts`](backend/src/patterns/factory/EventFactory.ts)

---

## 9. Abstract Factory Pattern

### Problem
Events require cohesive component families (Event Entity, Registration Policy, Eligibility Policy) that must remain coordinated per category.

### Solution
`EventComponentFactory` defines creation methods for matching families of policies implemented by `TechnicalComponentFactory`, `CulturalComponentFactory`, and `SportsComponentFactory`.

### Source Files
- [`backend/src/patterns/abstractFactory/EventComponentFactory.ts`](backend/src/patterns/abstractFactory/EventComponentFactory.ts)

---

## 10. Chain of Responsibility Pattern

### Problem
Event registration requires 6 independent validation checks (Auth, Status, Visibility, Eligibility, Deadline, Capacity, Duplicate). Hardcoded nested checks become unmaintainable.

### Solution
`RegistrationValidationChain` organizes individual handlers (`AuthCheckHandler`, `EventStatusHandler`, `VisibilityCheckHandler`, `CollegeEligibilityHandler`, `DeadlineCheckHandler`, `CapacityCheckHandler`, `DuplicateRegistrationHandler`) in a sequential pipeline with early abortion.

### Source Files
- [`backend/src/patterns/chain/RegistrationValidationChain.ts`](backend/src/patterns/chain/RegistrationValidationChain.ts)

---

## 11. Proxy Pattern

### Problem
Without protection at the repository boundary, unauthorized students could query private `INTRA_COLLEGE` events of other institutions or view unapproved `DRAFT` events.

### Solution
`EventAccessProxy` implements `IEventRepository`. It intercepts queries and enforces institutional isolation and status shielding before hitting the database.

### Source Files
- [`backend/src/patterns/proxy/EventAccessProxy.ts`](backend/src/patterns/proxy/EventAccessProxy.ts)

---

## 12. Observer Pattern

### Problem
Event changes (venue updates, cancellations, announcements) and waitlist auto-promotions require notifications across multiple recipients without coupling registration logic to messaging services.

### Solution
`EventSubject` manages `IEventObserver` subscribers (`RegisteredStudentsObserver`, `OrganizerObserver`, `AdminAuditObserver`) and broadcasts notifications when domain events occur.

### Source Files
- [`backend/src/patterns/observer/EventSubject.ts`](backend/src/patterns/observer/EventSubject.ts)

---

## 13. Bridge Pattern

### Problem
Decoupling notification types (Confirmations, Updates, Cancellations) from delivery channels (In-App, Email, SMS) avoids an exponential matrix of classes.

### Solution
`NotificationBridge` abstracts notification message logic from concrete `NotificationChannel` implementations.

### Source Files
- [`backend/src/patterns/bridge/NotificationBridge.ts`](backend/src/patterns/bridge/NotificationBridge.ts)

---

## 14. Singleton Pattern

### Problem
Multiple concurrent requests require a single coordinated SQLite WASM database connection and serialized transaction lock.

### Solution
`DatabaseManager` implements a private constructor with a static `getInstance()` method.

### Source Files
- [`backend/src/db/DatabaseManager.ts`](backend/src/db/DatabaseManager.ts)
