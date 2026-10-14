import { Request, Response } from 'express';

export class PatternInfoController {
  public getPatterns = async (req: Request, res: Response) => {
    const patterns = [
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
  .build();`
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
      speakers: [...this.speakers], // Deep copy
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
    const seat = await this.seatColleague.checkAndReserveSeat(event);
    const payment = await this.paymentColleague.processPayment(event.registrationFee, student);
    const email = await this.notifColleague.sendConfirmation(student, event, !seat.available);
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

// 2. Undo restores previous state:
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
        codeSnippet: `// MODEL
export class EventRepository { findById(id) { return db.get("SELECT * FROM EVENT..."); } }

// CONTROLLER
export class EventController {
  public getEvent = async (req, res) => {
    const event = await this.eventService.getEventById(req.params.id);
    return res.status(200).json({ success: true, data: event });
  }
}

// VIEW
export const EventCard: React.FC<{ event: Event }> = ({ event }) => (
  <div className="card"><h3>{event.title}</h3></div>
);`
      }
    ];

    return res.status(200).json({
      success: true,
      data: {
        patterns,
        umlDiagrams: [] // Frontend supplies full diagram specs
      }
    });
  };
}
