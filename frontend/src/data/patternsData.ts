export const PATTERNS_DATA = {
  patterns: [
    {
      id: 'singleton',
      name: 'Singleton Pattern',
      category: 'Creational',
      targetClass: 'DatabaseManager',
      filePath: 'backend/src/db/DatabaseManager.ts',
      featurePower: 'Guarantees a single shared connection and serialized transaction lock for the SQLite WASM database.',
      problem: 'Multiple database connection instances cause memory leaks, thread contention, and inconsistent ACID transactions across requests.',
      solution: 'Encapsulate connection logic inside a private constructor with a static getInstance() method ensuring exactly one global instance.',
      classesInvolved: ['DatabaseManager', 'CustomDatabase'],
      codeSnippet: `export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private constructor() { ... }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
}`
    },
    {
      id: 'builder',
      name: 'Builder Pattern',
      category: 'Creational',
      targetClass: 'EventBuilder',
      filePath: 'backend/src/patterns/builder/EventBuilder.ts',
      featurePower: 'Powers the "Create Event" Multi-Step Wizard with required/optional field assembly and atomic validation.',
      problem: 'Events possess numerous required and optional parameters (title, date, college, venue, deadline, capacity, prize pool, team sizing, speakers list, sponsors list, inter-college visibility). A huge multi-argument constructor is unwieldy ("telescoping constructor antipattern") and prone to ordering bugs.',
      solution: 'Provide an EventBuilder with chained methods (setTitle, setDate, setCollege, setPrizePool, addSpeaker, addSponsor, setInterCollege) assembling parts incrementally and performing comprehensive domain validation in build().',
      classesInvolved: [
        'EventBuilder',
        'EventBuilderValidationResult',
        'EventCreationData'
      ],
      codeSnippet: `const newEvent = new EventBuilder()
  .setTitle("National AI Hackathon 2026")
  .setDate("2026-11-20")
  .setCollege(1)
  .setSchedule("09:00 AM", "06:00 PM")
  .setVenue("APJ Abdul Kalam Auditorium")
  .setCapacity(200)
  .setInterCollege(true)
  .setPrizePool(75000)
  .setTeamSize(2, 4)
  .addSpeaker("Dr. Andrew Ng")
  .addSponsor("Google Cloud")
  .build(); // Validates required fields, deadline constraints, and returns verified event`
    },
    {
      id: 'prototype',
      name: 'Prototype Pattern',
      category: 'Creational',
      targetClass: 'EventPrototype',
      filePath: 'backend/src/patterns/prototype/EventPrototype.ts',
      featurePower: 'Powers the "Duplicate Event" (Clone) button on organizer events with deep copying of arrays.',
      problem: 'Colleges regularly rerun annual fests, coding cups, and tournaments year after year. Manually re-entering speakers, sponsors, eligibility, and rules is tedious, while a naive shallow copy would corrupt existing event rosters and reference-linked arrays.',
      solution: 'Implement an EventPrototype with a clone() method that produces a clean deep copy of the event, deep-copies arrays (speakers, sponsors), resets registrations to 0, sets status to DRAFT, and lets organizers quickly adjust date and venue.',
      classesInvolved: [
        'Prototype<T> (Interface)',
        'EventPrototype'
      ],
      codeSnippet: `export class EventPrototype implements Prototype<EventPrototype> {
  public clone(overrides?: { date?: string; venue?: string; title?: string }): EventPrototype {
    return new EventPrototype({
      ...this,
      title: overrides?.title || \`\${this.title} (Clone)\`,
      date: overrides?.date || this.date,
      venue: overrides?.venue || this.venue,
      status: 'DRAFT',
      currentRegistrations: 0,
      speakers: [...this.speakers], // Deep copy prevents reference mutation
      sponsors: [...this.sponsors]  // Deep copy
    });
  }
}`
    },
    {
      id: 'factory_method',
      name: 'Factory Method Pattern',
      category: 'Creational',
      targetClass: 'EventFactory',
      filePath: 'backend/src/patterns/factory/EventFactory.ts',
      featurePower: 'Configures category-specific domain defaults, contact headers, and eligibility rules during event creation.',
      problem: 'Direct instantiation of events spreads category defaults, contact details, and eligibility defaults throughout the app.',
      solution: 'Define an abstract EventFactory with createEvent() and create category-specific subclasses (TechnicalEventFactory, CulturalEventFactory, SportsEventFactory, LiteraryEventFactory, etc.) to encapsulate creation logic.',
      classesInvolved: [
        'EventFactory (Abstract)',
        'TechnicalEventFactory',
        'CulturalEventFactory',
        'SportsEventFactory',
        'LiteraryEventFactory',
        'WorkshopEventFactory',
        'ManagementEventFactory',
        'SocialEventFactory',
        'EventFactoryProvider'
      ],
      codeSnippet: `export abstract class EventFactory {
  public abstract createEvent(data: EventCreationData): Omit<Event, 'eventId'>;
}

export class TechnicalEventFactory extends EventFactory {
  public createEvent(data: EventCreationData) {
    return { ...data, category: 'Technical', ... };
  }
}`
    },
    {
      id: 'abstract_factory',
      name: 'Abstract Factory Pattern',
      category: 'Creational',
      targetClass: 'EventComponentFactory',
      filePath: 'backend/src/patterns/abstractFactory/EventComponentFactory.ts',
      featurePower: 'Provides cohesive product families (Event Data, Registration Policies, Eligibility Rules) per category.',
      problem: 'Events require related families of components (Event Instance, Registration Policy, Eligibility Policy) that must remain consistent for each category.',
      solution: 'Provide an EventComponentFactory interface with methods createEvent(), createRegistrationPolicy(), and createEligibilityPolicy() implemented by concrete category factories (TechnicalComponentFactory, CulturalComponentFactory, SportsComponentFactory).',
      classesInvolved: [
        'EventComponentFactory (Interface)',
        'TechnicalComponentFactory',
        'CulturalComponentFactory',
        'SportsComponentFactory',
        'IRegistrationPolicy',
        'IEligibilityPolicy'
      ],
      codeSnippet: `export interface EventComponentFactory {
  createEvent(data: EventCreationData): Omit<Event, 'eventId'>;
  createRegistrationPolicy(): IRegistrationPolicy;
  createEligibilityPolicy(): IEligibilityPolicy;
}`
    },
    {
      id: 'chain_of_responsibility',
      name: 'Chain of Responsibility Pattern',
      category: 'Behavioral',
      targetClass: 'RegistrationValidationChain',
      filePath: 'backend/src/patterns/chain/',
      featurePower: 'Powers the 6-stage student registration validation pipeline with early termination and clear failure reasons.',
      problem: 'Registration checks (Auth, Status, Visibility, Eligibility, Deadline, Capacity, Duplicate) are complex and rigid when hardcoded together in a monolithic method.',
      solution: 'Pass registration context through a chain of handler objects (AuthCheckHandler -> EventStatusHandler -> VisibilityCheckHandler -> CollegeEligibilityHandler -> DeadlineCheckHandler -> CapacityCheckHandler -> DuplicateRegistrationHandler). Each handler validates its specific rule and either passes control or aborts with a reason.',
      classesInvolved: [
        'ValidationHandler (Abstract)',
        'AuthCheckHandler',
        'EventStatusHandler',
        'VisibilityCheckHandler',
        'CollegeEligibilityHandler',
        'DeadlineCheckHandler',
        'CapacityCheckHandler',
        'DuplicateRegistrationHandler',
        'RegistrationValidationChain'
      ],
      codeSnippet: `authCheck
  .setNext(eventStatus)
  .setNext(visibility)
  .setNext(collegeEligibility)
  .setNext(deadline)
  .setNext(capacity)
  .setNext(duplicate);

const result = await this.head.handle(context);`
    },
    {
      id: 'mediator',
      name: 'Mediator Pattern',
      category: 'Behavioral',
      targetClass: 'EventCoordinator',
      filePath: 'backend/src/patterns/mediator/RegistrationMediator.ts',
      featurePower: 'Coordinates registration flow (Seat Check -> Payment -> Confirmation Email -> Organizer Dashboard Roster) without components calling each other directly.',
      problem: 'When a student registers, multiple distinct modules must execute in sequence: Seat Reservation, Payment/Fee Processing, Notification Email Dispatch, and Organizer Dashboard live counter update. Having these modules call each other creates tangled "spaghetti" coupling.',
      solution: 'Introduce an EventCoordinator (Mediator) that acts as the sole communications hub. Four independent colleagues (SeatColleague, PaymentColleague, NotificationColleague, DashboardColleague) interact strictly through the mediator.',
      classesInvolved: [
        'Mediator (Interface)',
        'EventCoordinator (Concrete Mediator)',
        'Colleague (Abstract Base)',
        'SeatColleague',
        'PaymentColleague',
        'NotificationColleague',
        'DashboardColleague'
      ],
      codeSnippet: `export class EventCoordinator implements Mediator {
  public async coordinateRegistration(student, event) {
    // 1. Seat check
    const seat = await this.seatColleague.checkAndReserveSeat(event);
    // 2. Fee payment
    const payment = await this.paymentColleague.processPayment(event.registrationFee, student);
    // 3. Confirmation email
    const email = await this.notifColleague.sendConfirmation(student, event, !seat.available);
    // 4. Live organizer dashboard refresh
    const dash = await this.dashColleague.updateOrganizerDashboard(event.organizerId, event.eventId, 'CONFIRMED');
    return { success: true, seat, payment, email, dash };
  }
}`
    },
    {
      id: 'template_method',
      name: 'Template Method Pattern',
      category: 'Behavioral',
      targetClass: 'EventWorkflow',
      filePath: 'backend/src/patterns/template/EventWorkflow.ts',
      featurePower: 'Powers category lifecycle workflows (HackathonWorkflow vs CulturalFestWorkflow) with invariant skeleton steps and specialized steps.',
      problem: 'All campus events share a common operational lifecycle (validate, setup registration, publish, execute event, close, generate analytics report). However, a Hackathon needs team registration, GitHub commits, and judging rubrics, whereas a Cultural Fest needs solo ticketing, stage acoustic checks, and crowd voting. Rewriting the entire lifecycle for each category duplicates the skeleton sequence.',
      solution: 'Define an abstract EventWorkflow with a final run() template method that enforces the invariant execution sequence (publish, close), while leaving primitive steps (validate, setupRegistration, executeEvent, generateReport) to be implemented by HackathonWorkflow and CulturalFestWorkflow.',
      classesInvolved: [
        'EventWorkflow (Abstract Base with run() Template Method)',
        'HackathonWorkflow (Concrete)',
        'CulturalFestWorkflow (Concrete)',
        'WorkflowReport',
        'WorkflowStepLog'
      ],
      codeSnippet: `export abstract class EventWorkflow {
  // Template Method: Skeleton algorithm
  public async run(event: Partial<Event>): Promise<WorkflowReport> {
    await this.validate(event);         // Overridden by subclass
    await this.setupRegistration(event);// Overridden by subclass
    await this.publish(event);           // Fixed Invariant in Base
    await this.executeEvent(event);     // Overridden by subclass
    await this.close(event);             // Fixed Invariant in Base
    const summary = await this.generateReport(event); // Overridden
    return { ... };
  }
}`
    },
    {
      id: 'strategy',
      name: 'Strategy Pattern',
      category: 'Behavioral',
      targetClass: 'PricingStrategy',
      filePath: 'backend/src/patterns/strategy/FeeStrategy.ts',
      featurePower: 'Powers dynamic ticket fee calculation (Free, EarlyBird, InterCollegeFee, GroupDiscount, StudentIdDiscount) resolved at runtime.',
      problem: 'Colleges use varied pricing rules: free entry for workshops, early bird discounts, cross-college surcharges, group discounts for hackathon teams, and student ID concessions. Hardcoding nested if-else statements inside registration controllers makes fee calculation brittle.',
      solution: 'Encapsulate each pricing rule in a dedicated strategy class implementing PricingStrategy. A FeeCalculatorContext picks and applies the appropriate strategy at runtime.',
      classesInvolved: [
        'PricingStrategy (Interface)',
        'FreeStrategy',
        'EarlyBirdStrategy',
        'InterCollegeFeeStrategy',
        'GroupDiscountStrategy',
        'StudentIdDiscountStrategy',
        'FeeCalculatorContext',
        'FeeBreakdown'
      ],
      codeSnippet: `export interface PricingStrategy {
  calculateFee(context: FeeCalculationContext): FeeBreakdown;
}

export class EarlyBirdStrategy implements PricingStrategy {
  public calculateFee(ctx) {
    const discount = Math.round((ctx.baseFee * 25) / 100);
    return { strategyName: 'EarlyBird', discountAmount: discount, finalFee: ctx.baseFee - discount };
  }
}

// Runtime resolution:
const calculator = new FeeCalculatorContext(new GroupDiscountStrategy(20));
const breakdown = calculator.calculate({ baseFee: 200, teamSize: 4 });`
    },
    {
      id: 'memento',
      name: 'Memento Pattern',
      category: 'Behavioral',
      targetClass: 'EventMemento',
      filePath: 'backend/src/patterns/memento/EventMemento.ts',
      featurePower: 'Powers the "Undo Last Edit" button and Version History stack for organizers (e.g. restoring accidental deadline changes).',
      problem: 'Organizers frequently adjust event details (registration deadlines, venue, timings, capacities). Accidental modifications to registration deadlines can immediately lock students out. Organizers need a reliable Undo capability without exposing the event internal state.',
      solution: 'Implement the Memento pattern using EventMemento (immutable state snapshot), EventOriginator (creates and restores snapshots), and EventHistoryCaretaker (manages the version history stack and persistent database snapshots).',
      classesInvolved: [
        'EventMemento (Immutable Snapshot)',
        'EventOriginator (Creates & Restores)',
        'EventHistoryCaretaker (History Stack Manager)',
        'MementoRepository (Database Persistence)'
      ],
      codeSnippet: `// 1. Save snapshot before modifying
const originator = new EventOriginator(event);
const caretaker = new EventHistoryCaretaker(eventId);
await caretaker.pushSnapshot(originator, 'Changed registration deadline');

// 2. Accidental mistake made...
// 3. Undo restores previous state:
const restoredState = await caretaker.undo(originator);
await eventRepository.update(eventId, restoredState);`
    },
    {
      id: 'observer',
      name: 'Observer Pattern',
      category: 'Behavioral',
      targetClass: 'EventSubject',
      filePath: 'backend/src/patterns/observer/EventSubject.ts',
      featurePower: 'Dispatches automated in-app alerts and notifications to enrolled students, organizers, and audit logs upon event changes.',
      problem: 'When an event changes (date/time/venue/cancellation), notifying all registered students, organizers, and admins manually causes tight coupling.',
      solution: 'Define EventSubject (Subject) that maintains a list of IEventObserver instances (RegisteredStudentsObserver, OrganizerObserver, AdminAuditObserver). Automatically broadcast notifications on event state changes.',
      classesInvolved: [
        'EventSubject (Subject)',
        'IEventObserver (Observer Interface)',
        'RegisteredStudentsObserver',
        'OrganizerObserver',
        'AdminAuditObserver'
      ],
      codeSnippet: `export class EventSubject {
  private observers: IEventObserver[] = [];
  public async notifyObservers(event: Event, changeType: string, msg?: string) {
    for (const obs of this.observers) { await obs.onEventChanged(event, changeType, msg); }
  }
}`
    },
    {
      id: 'proxy',
      name: 'Proxy Pattern',
      category: 'Structural',
      targetClass: 'EventAccessProxy',
      filePath: 'backend/src/patterns/proxy/EventAccessProxy.ts',
      featurePower: 'Enforces institutional isolation (INTRA_COLLEGE vs INTER_COLLEGE) and shields unapproved drafts at repository boundaries.',
      problem: 'Direct queries can leak restricted INTRA_COLLEGE events from other colleges to unauthorized students or allow unauthorized modifications.',
      solution: 'Wrap EventRepository inside EventAccessProxy implementing IEventRepository. The proxy inspects user credentials, college affiliation, and event type to filter feeds and restrict access before hitting the database.',
      classesInvolved: [
        'IEventRepository (Interface)',
        'EventRepository (RealSubject)',
        'EventAccessProxy (Proxy)'
      ],
      codeSnippet: `export class EventAccessProxy implements IEventRepository {
  public async findAllEligibleForUser(user?: User): Promise<Event[]> {
    const all = await this.realRepository.findAll();
    return all.filter(e => e.eventType === 'INTER_COLLEGE' || e.collegeId === user?.collegeId);
  }
}`
    },
    {
      id: 'bridge',
      name: 'Bridge Pattern',
      category: 'Structural',
      targetClass: 'NotificationBridge',
      filePath: 'backend/src/patterns/bridge/NotificationBridge.ts',
      featurePower: 'Decouples notification message abstractions from delivery channels (In-App, Email, SMS).',
      problem: 'Combining 7 notification types with 3 delivery channels creates 21 subclass permutations (e.g. EmailRegistrationConfirmation, InAppEventCancelled).',
      solution: 'Decouple Notification Abstraction (RegistrationConfirmation, EventUpdated, EventCancelled) from Delivery Channel Implementation (InAppChannel, EmailChannel, SMSChannel).',
      classesInvolved: [
        'NotificationBridge (Abstraction)',
        'RegistrationConfirmationNotification',
        'EventUpdatedNotification',
        'EventCancelledNotification',
        'NotificationChannel (Implementor Interface)',
        'InAppChannel',
        'EmailChannel',
        'SMSChannel'
      ],
      codeSnippet: `export abstract class NotificationBridge {
  protected channel: NotificationChannel;
  constructor(channel?: NotificationChannel) { this.channel = channel; }
  public abstract dispatch(userId: number, eventId: number, title: string): Promise<any>;
}`
    },
    {
      id: 'mvc',
      name: 'Model-View-Controller (MVC) Pattern',
      category: 'Architectural',
      targetClass: 'Express & React MVC Architecture',
      filePath: 'Full Stack Structure: backend/src/ (Models & Controllers) + frontend/src/ (Views)',
      featurePower: 'Architectural separation: Models manage state & persistence, Views render UI & capture interaction, Controllers orchestrate workflows.',
      problem: 'Spaghetti code where frontend components directly write SQL queries or backend models render HTML strings results in untestable code and massive maintenance debt.',
      solution: 'Enforce strict 3-tier MVC separation: Models (Event, User, Registration entities & repositories) handle schema and database operations; Views (React components, EventCard, OrganizerDashboard) render UI and never touch SQL; Controllers (EventController, RegistrationController) parse HTTP requests, coordinate services, and return JSON.',
      classesInvolved: [
        'Models: Event, Registration, User, EventRepository, DatabaseManager',
        'Views: EventCard, CreateEventModal, OrganizerDashboard, DesignPatternExplorer',
        'Controllers: EventController, RegistrationController, AuthController, api.ts service client'
      ],
      codeSnippet: `// MODEL: Pure persistence & data rules
export class EventRepository { findById(id) { return db.get("SELECT * FROM EVENT..."); } }

// CONTROLLER: HTTP request handling, validation, status codes
export class EventController {
  public getEvent = async (req, res) => {
    const event = await this.eventService.getEventById(req.params.id);
    return res.status(200).json({ success: true, data: event });
  }
}

// VIEW: Pure React UI presentation
export const EventCard: React.FC<{ event: Event }> = ({ event }) => (
  <div className="card"><h3>{event.title}</h3><p>{event.venue}</p></div>
);`
    }
  ],
  umlDiagrams: [
    {
      title: '1. Use Case Diagram',
      type: 'Use Case',
      description: 'Primary actors (Student, Organizer, Admin) and platform interactions.',
      mermaidCode: `graph TD
    subgraph Actors
        Student["Student"]
        Organizer["Event Organizer"]
        Admin["Platform Administrator"]
    end

    subgraph EventBridge Platform
        UC1["Discover Eligible Events"]
        UC2["Register for Event"]
        UC3["Cancel Registration"]
        UC4["View Registered Events"]
        UC5["Contact Organizer"]
        UC6["Receive In-App / Email Notifications"]
        UC7["Create & Publish Event (Builder)"]
        UC8["Duplicate Past Event (Prototype)"]
        UC9["Undo Accidental Edit (Memento)"]
        UC10["Manage Event & Announcements"]
        UC11["View Participant List"]
        UC12["Manage Colleges & Users"]
        UC13["View Platform Governance Stats"]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6

    Organizer --> UC7
    Organizer --> UC8
    Organizer --> UC9
    Organizer --> UC10
    Organizer --> UC11
    Organizer --> UC6

    Admin --> UC12
    Admin --> UC13
    Admin --> UC1`
    },
    {
      title: '2. Class Diagram: Creational Patterns (Builder, Prototype, Factory, Singleton)',
      type: 'Class',
      description: 'Object creation patterns ensuring clean construction, deep cloning, and single database connectivity.',
      mermaidCode: `classDiagram
    class DatabaseManager {
        -static instance: DatabaseManager
        +getInstance() DatabaseManager
        +getDb() CustomDatabase
    }

    class EventBuilder {
        -title: string
        -date: string
        -collegeId: number
        -prizePool: number
        -speakers: string[]
        -sponsors: string[]
        +setTitle(title) EventBuilder
        +setDate(date) EventBuilder
        +setCollege(id) EventBuilder
        +setPrizePool(amount) EventBuilder
        +addSpeaker(speaker) EventBuilder
        +validate() ValidationResult
        +build() EventCreationData
    }

    class Prototype {
        <<interface>>
        +clone() T
    }

    class EventPrototype {
        -title: string
        -speakers: string[]
        -sponsors: string[]
        +clone(overrides) EventPrototype
        +toEventCreationData() EventCreationData
    }

    Prototype <|.. EventPrototype : implements
    EventBuilder ..> EventPrototype : constructs data for`
    },
    {
      title: '3. Class Diagram: Behavioral Patterns (Mediator, Template Method, Strategy, Memento, Chain)',
      type: 'Class',
      description: 'Decoupled coordination, lifecycle template execution, fee calculation, and version history undo.',
      mermaidCode: `classDiagram
    class Mediator {
        <<interface>>
        +notify(sender, event, data)
    }

    class EventCoordinator {
        -seatColleague: SeatColleague
        -paymentColleague: PaymentColleague
        -notifColleague: NotificationColleague
        -dashColleague: DashboardColleague
        +coordinateRegistration(student, event)
    }
    Mediator <|.. EventCoordinator

    class EventWorkflow {
        <<abstract>>
        +run(event) WorkflowReport
        #validate(event)*
        #setupRegistration(event)*
        #publish(event)
        #executeEvent(event)*
        #close(event)
        #generateReport(event)*
    }
    class HackathonWorkflow {
        #validate(event)
        #setupRegistration(event)
        #executeEvent(event)
        #generateReport(event)
    }
    class CulturalFestWorkflow {
        #validate(event)
        #setupRegistration(event)
        #executeEvent(event)
        #generateReport(event)
    }
    EventWorkflow <|-- HackathonWorkflow
    EventWorkflow <|-- CulturalFestWorkflow

    class PricingStrategy {
        <<interface>>
        +calculateFee(ctx) FeeBreakdown
    }
    class FreeStrategy
    class EarlyBirdStrategy
    class InterCollegeFeeStrategy
    class GroupDiscountStrategy
    class StudentIdDiscountStrategy
    PricingStrategy <|.. FreeStrategy
    PricingStrategy <|.. EarlyBirdStrategy
    PricingStrategy <|.. InterCollegeFeeStrategy
    PricingStrategy <|.. GroupDiscountStrategy
    PricingStrategy <|.. StudentIdDiscountStrategy

    class EventMemento {
        -state: EventStateSnapshot
        -timestamp: string
        +getState()
    }
    class EventOriginator {
        -state: EventStateSnapshot
        +saveToMemento() EventMemento
        +restoreFromMemento(memento)
    }
    class EventHistoryCaretaker {
        -inMemoryStack: EventMemento[]
        +pushSnapshot()
        +undo()
    }
    EventOriginator ..> EventMemento : creates
    EventHistoryCaretaker o-- EventMemento : manages stack`
    },
    {
      title: '4. Sequence Diagram: Registration Flow via Mediator Pattern',
      type: 'Sequence',
      description: 'Interaction between the 4 decoupled colleagues coordinated by EventCoordinator.',
      mermaidCode: `sequenceDiagram
    autonumber
    actor Student
    participant Coord as EventCoordinator (Mediator)
    participant Seat as SeatColleague
    participant Pay as PaymentColleague
    participant Notif as NotificationColleague
    participant Dash as DashboardColleague

    Student->>Coord: coordinateRegistration(student, event)
    Coord->>Seat: checkAndReserveSeat(event)
    Seat-->>Coord: notify('SEAT_RESERVED', available=true)
    Coord->>Pay: processPayment(fee, student)
    Pay-->>Coord: notify('PAYMENT_PROCESSED', txnId)
    Coord->>Notif: sendConfirmation(student, event)
    Notif-->>Coord: notify('EMAIL_DISPATCHED')
    Coord->>Dash: updateOrganizerDashboard(orgId, eventId)
    Dash-->>Coord: notify('DASHBOARD_ROSTER_UPDATED')
    Coord-->>Student: Registration Confirmed & Ticket Issued`
    },
    {
      title: '5. Sequence Diagram: Undo Event Edit via Memento Pattern',
      type: 'Sequence',
      description: 'How an accidental deadline or venue edit is pushed to caretaker and restored via Undo.',
      mermaidCode: `sequenceDiagram
    autonumber
    actor Organizer
    participant Service as EventService
    participant Orig as EventOriginator
    participant Care as EventHistoryCaretaker
    participant DB as SQLite DB

    Note over Organizer,Service: 1. Normal Edit with Snapshot Saved
    Organizer->>Service: updateEvent(eventId, { deadline: "2026-10-15" })
    Service->>Orig: new EventOriginator(currentEvent)
    Service->>Care: pushSnapshot(Orig, "Before deadline change")
    Care->>DB: INSERT INTO EVENT_MEMENTO...
    Service->>DB: UPDATE EVENT SET deadline = "2026-10-15"...

    Note over Organizer,Service: 2. Organizer notices mistake & clicks [Undo]
    Organizer->>Service: undoEventEdit(eventId)
    Service->>Care: undo(Orig)
    Care->>DB: SELECT & DELETE LATEST FROM EVENT_MEMENTO...
    Care-->>Orig: restoreFromMemento(memento)
    Service->>DB: UPDATE EVENT SET originalFields...
    Service-->>Organizer: Event Reverted to Previous Snapshot`
    },
    {
      title: '6. Model-View-Controller (MVC) Architectural Diagram',
      type: 'Component',
      description: 'Clean separation of concerns: Models never touch DOM, Views never touch raw SQL, Controllers handle flow.',
      mermaidCode: `graph TD
    subgraph View Layer (React Frontend)
        V1["EventCard Component"]
        V2["OrganizerDashboard Page"]
        V3["CreateEventWizard Modal"]
        V4["DesignPatternExplorer Page"]
    end

    subgraph Controller Layer (API & Services)
        C1["EventController"]
        C2["RegistrationController"]
        C3["AuthController"]
        C4["Frontend api.ts Client"]
    end

    subgraph Model Layer (Domain Entities & DB)
        M1["Event Repository"]
        M2["Registration Repository"]
        M3["Memento Repository"]
        M4["DatabaseManager (SQLite WASM)"]
    end

    V1 --> C4
    V2 --> C4
    V3 --> C4
    V4 --> C4
    C4 -- HTTP / REST API --> C1
    C4 -- HTTP / REST API --> C2
    C4 -- HTTP / REST API --> C3

    C1 --> M1
    C1 --> M3
    C2 --> M2
    M1 --> M4
    M2 --> M4
    M3 --> M4`
    },
    {
      title: '7. Activity Diagram: 6-Stage Registration Validation Chain',
      type: 'Activity',
      description: 'Chain of Responsibility decision pipeline for validating incoming student registration requests.',
      mermaidCode: `graph TD
    Start([Student Clicks Register]) --> A[AuthCheckHandler]
    A -->|Not Logged In| Err1[Return HTTP 401 Unauthorized]
    A -->|Valid Student JWT| B[EventStatusHandler]
    B -->|Event Not Published| Err2[Reject: Event not open]
    B -->|Published| C[VisibilityCheckHandler]
    C -->|Intra-College Violation| Err3[Reject: Host Institution Only]
    C -->|Allowed| D[CollegeEligibilityHandler]
    D -->|Ineligible Dept/Year| Err4[Reject: Criteria Unmet]
    D -->|Eligible| E[DeadlineCheckHandler]
    E -->|Deadline Passed| Err5[Reject: Deadline Expired]
    E -->|Active Window| F[DuplicateRegistrationHandler]
    F -->|Already Registered| Err6[Return HTTP 409 Duplicate]
    F -->|New Entry| Router{Seats Available?}
    Router -->|Yes| Confirmed[Assign CONFIRMED Seat]
    Router -->|No Capacity| Waitlist[Place on FIFO Waitlist Queue]`
    },
    {
      title: '8. Sequence Diagram: FIFO Waitlist Auto-Promotion',
      type: 'Sequence',
      description: 'Automatic promotion of #1 waitlisted candidate when a confirmed attendee cancels.',
      mermaidCode: `sequenceDiagram
    autonumber
    actor ConfirmedAttendee as Confirmed Student
    actor WaitlistedStudent as Waitlisted Student #1
    participant RS as RegistrationService
    participant WS as WaitlistService
    participant DB as SQLite DB
    participant Obs as EventSubject (Observer)

    ConfirmedAttendee->>RS: cancelRegistration(regId)
    RS->>DB: UPDATE REGISTRATION SET status = 'CANCELLED'
    RS->>WS: promoteNextInQueue(eventId)
    WS->>DB: SELECT * FROM REGISTRATION WHERE status='WAITLISTED' ORDER BY queuePosition LIMIT 1
    WS->>DB: UPDATE REGISTRATION SET status='CONFIRMED', queuePosition=NULL
    WS->>DB: UPDATE REGISTRATION SET queuePosition = queuePosition - 1 WHERE status='WAITLISTED'
    WS->>Obs: notifyObservers(event, 'WAITLIST_PROMOTED', studentId)
    Obs-->>WaitlistedStudent: Push Notification: "Your spot has been confirmed!"
    RS-->>ConfirmedAttendee: Cancellation complete`
    },
    {
      title: '9. State Machine Diagram: Event Approval & Lifecycle',
      type: 'State',
      description: 'Lifecycle states and transitions from draft creation to approval, publication, and closure.',
      mermaidCode: `stateDiagram-v2
    [*] --> DRAFT : Organizer uses EventBuilder
    DRAFT --> SUBMITTED : Submit for Review
    SUBMITTED --> REJECTED : Admin Rejects with Reason
    REJECTED --> DRAFT : Organizer Updates via Memento / Edit
    SUBMITTED --> APPROVED : Admin Approves
    APPROVED --> PUBLISHED : Live in Catalog Feed
    PUBLISHED --> CANCELLED : Organizer / Admin Cancels
    PUBLISHED --> COMPLETED : Event Concludes
    CANCELLED --> [*]
    COMPLETED --> [*]`
    },
    {
      title: '10. Physical Deployment Diagram',
      type: 'Deployment',
      description: 'Physical deployment layout of Client Browser, Node Express Web Server, and SQLite WASM Database.',
      mermaidCode: `graph LR
    subgraph Client Device
        Browser["Modern Web Browser (React SPA + Vite Bundle)"]
    end

    subgraph Application Server
        Express["Express.js Server (TypeScript REST Endpoints)"]
        WASM["SQLite WASM Binary (sql.js Engine)"]
    end

    subgraph Storage File System
        DBFile["eventbridge.db (Atomic Disk Sync File)"]
        Memento["EVENT_MEMENTO Snapshots Table"]
    end

    Browser -- HTTP / REST API Calls --> Express
    Express -- SQL Queries --> WASM
    WASM -- Flush to Disk --> DBFile
    WASM -- Version History --> Memento`
    }
  ]
};
