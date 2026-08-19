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
        problem: 'Multiple database connection instances cause memory leaks, lock contention, and inconsistent transactions.',
        solution: 'Encapsulate connection logic inside a private constructor with a static getInstance() method ensuring exactly one global instance.',
        classesInvolved: ['DatabaseManager'],
        codeSnippet: `export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private constructor() { ... }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }`
      },
      {
        id: 'chain_of_responsibility',
        name: 'Chain of Responsibility Pattern',
        category: 'Behavioral',
        targetClass: 'RegistrationValidationChain',
        filePath: 'backend/src/patterns/chain/',
        problem: 'Registration checks (Auth, Status, Visibility, Eligibility, Deadline, Capacity, Duplicate) are complex and rigid when hardcoded together.',
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
        id: 'factory_method',
        name: 'Factory Method Pattern',
        category: 'Creational',
        targetClass: 'EventFactory',
        filePath: 'backend/src/patterns/factory/EventFactory.ts',
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
        id: 'proxy',
        name: 'Proxy Pattern',
        category: 'Structural',
        targetClass: 'EventAccessProxy',
        filePath: 'backend/src/patterns/proxy/EventAccessProxy.ts',
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
        id: 'observer',
        name: 'Observer Pattern',
        category: 'Behavioral',
        targetClass: 'EventSubject',
        filePath: 'backend/src/patterns/observer/EventSubject.ts',
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
        id: 'database_connectivity',
        name: 'Database Connectivity / Repository DAO',
        category: 'Architectural',
        targetClass: 'Repository Classes',
        filePath: 'backend/src/repositories/',
        problem: 'Mixing SQL queries with business logic makes testing hard and causes code duplication.',
        solution: 'Encapsulate raw SQLite CRUD queries inside dedicated Data Access Objects (CollegeRepository, UserRepository, EventRepository, RegistrationRepository, NotificationRepository, ContactRequestRepository).',
        classesInvolved: [
          'CollegeRepository',
          'UserRepository',
          'EventRepository',
          'RegistrationRepository',
          'NotificationRepository',
          'ContactRequestRepository'
        ],
        codeSnippet: `export class EventRepository implements IEventRepository {
  public async findById(id: number) {
    return this.dbManager.getDb().get('SELECT * FROM EVENT WHERE eventId = ?', [id]);
  }
}`
      }
    ];

    const umlDiagrams = [
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
        UC7["Create & Publish Event"]
        UC8["Manage Event & Announcements"]
        UC9["View Participant List"]
        UC10["Manage Colleges & Users"]
        UC11["View Platform Governance Stats"]
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
    Organizer --> UC6

    Admin --> UC10
    Admin --> UC11
    Admin --> UC1`
      },
      {
        title: '2. Class Diagram',
        type: 'Structural',
        description: 'Complete static OOP structure of EventBridge components and design patterns.',
        mermaidCode: `classDiagram
    class DatabaseManager {
        -static instance: DatabaseManager
        +getInstance() DatabaseManager
        +getDb() CustomDatabase
    }

    class IEventRepository {
        <<interface>>
        +findById(id) Event
        +findAll() Event[]
    }

    class EventRepository {
        -dbManager: DatabaseManager
        +findById(id) Event
        +findAll() Event[]
    }

    class EventAccessProxy {
        -realRepository: EventRepository
        +findAllEligibleForUser(user) Event[]
    }

    class ValidationHandler {
        <<abstract>>
        -nextHandler: ValidationHandler
        +setNext(handler)
        +handle(context) Result
    }

    class RegistrationValidationChain {
        -head: ValidationHandler
        +validate(context) Result
    }

    class NotificationBridge {
        <<abstract>>
        #channel: NotificationChannel
        +dispatch(userId, eventId, title)
    }

    class NotificationChannel {
        <<interface>>
        +send(userId, eventId, type, msg)
    }

    IEventRepository <|.. EventRepository
    IEventRepository <|.. EventAccessProxy
    EventAccessProxy --> EventRepository
    NotificationBridge --> NotificationChannel
    RegistrationValidationChain --> ValidationHandler`
      },
      {
        title: '3. Sequence Diagram – Student Login',
        type: 'Behavioral',
        description: 'Sequential control flow during student authentication and JWT generation.',
        mermaidCode: `sequenceDiagram
    autonumber
    actor Student
    participant AuthController
    participant AuthService
    participant UserRepository
    participant DatabaseManager

    Student->>AuthController: POST /api/auth/login (username, password)
    AuthController->>AuthService: login(username, password)
    AuthService->>UserRepository: findByUsername(username)
    UserRepository->>DatabaseManager: getInstance().getDb().get(SQL)
    DatabaseManager-->>UserRepository: User Record
    UserRepository-->>AuthService: User Record
    AuthService->>AuthService: Verify bcrypt hash & generate JWT
    AuthService-->>AuthController: JWT Token + User Object
    AuthController-->>Student: 200 OK (Token, User)`
      },
      {
        title: '4. Sequence Diagram – Event Discovery',
        type: 'Behavioral',
        description: 'Query flow through EventAccessProxy enforcing college visibility rules.',
        mermaidCode: `sequenceDiagram
    autonumber
    actor Student
    participant EventController
    participant EventService
    participant EventAccessProxy
    participant EventRepository

    Student->>EventController: GET /api/events/eligible
    EventController->>EventService: getEligibleEventsForUser(studentUser)
    EventService->>EventAccessProxy: findAllEligibleForUser(studentUser)
    EventAccessProxy->>EventRepository: findAll()
    EventRepository-->>EventAccessProxy: All Events (INTRA & INTER)
    EventAccessProxy->>EventAccessProxy: Filter out other colleges' INTRA events
    EventAccessProxy-->>EventService: Eligible Event Feed
    EventService-->>EventController: Events List
    EventController-->>Student: 200 OK (Eligible Events)`
      },
      {
        title: '5. Sequence Diagram – Registration Workflow',
        type: 'Behavioral',
        description: 'Execution flow through the 7-stage Chain of Responsibility validation handlers.',
        mermaidCode: `sequenceDiagram
    autonumber
    actor Student
    participant RegistrationController
    participant RegistrationService
    participant ValidationChain
    participant RegistrationRepository
    participant NotificationBridge

    Student->>RegistrationController: POST /api/registrations/event/10
    RegistrationController->>RegistrationService: registerStudentForEvent(studentId, 10)
    RegistrationService->>ValidationChain: validate(context)
    Note over ValidationChain: Handlers:<br/>1. AuthCheck<br/>2. EventStatus<br/>3. VisibilityCheck<br/>4. CollegeEligibility<br/>5. DeadlineCheck<br/>6. CapacityCheck<br/>7. DuplicateRegistration
    ValidationChain-->>RegistrationService: Allowed: true
    RegistrationService->>RegistrationRepository: create(eventId, studentId)
    RegistrationService->>NotificationBridge: dispatch(studentId, eventId, title)
    NotificationBridge-->>RegistrationService: Notification Dispatched
    RegistrationService-->>RegistrationController: Registration Confirmed
    RegistrationController-->>Student: 201 Created`
      },
      {
        title: '6. Sequence Diagram – Event Update & Observer Pattern',
        type: 'Behavioral',
        description: 'Observer Pattern dispatch when an event venue, date, or cancellation changes.',
        mermaidCode: `sequenceDiagram
    autonumber
    actor Organizer
    participant EventService
    participant EventAccessProxy
    participant EventSubject
    participant RegisteredStudentsObserver
    participant NotificationBridge

    Organizer->>EventService: updateEvent(eventId, { venue: 'Hall 4' })
    EventService->>EventAccessProxy: update(eventId, updates)
    EventAccessProxy-->>EventService: Updated Event
    EventService->>EventSubject: notifyObservers(event, 'UPDATED', 'Venue changed to Hall 4')
    EventSubject->>RegisteredStudentsObserver: onEventChanged(event, 'UPDATED')
    RegisteredStudentsObserver->>NotificationBridge: dispatch(studentId, eventId, title)
    NotificationBridge-->>RegisteredStudentsObserver: Notifications Dispatched
    EventService-->>Organizer: Event Updated Successfully`
      },
      {
        title: '7. Activity Diagram – Registration Workflow',
        type: 'Activity',
        description: 'Decision flow through all validation checks in the validation chain.',
        mermaidCode: `flowchart TD
    Start([Student Clicks REGISTER]) --> AuthCheck{Is Student Logged In?}
    AuthCheck -- No --> FailAuth[Return Auth Fail: AuthCheckHandler]
    AuthCheck -- Yes --> StatusCheck{Is Event Published & Open?}
    StatusCheck -- No --> FailStatus[Return Status Fail: EventStatusHandler]
    StatusCheck -- Yes --> VisibilityCheck{Is Event Visible to Student?}
    VisibilityCheck -- No --> FailVis[Return Visibility Fail: VisibilityCheckHandler]
    VisibilityCheck -- Yes --> CollegeCheck{Does Student Match College Rule?}
    CollegeCheck -- No --> FailCollege[Return Ineligible: CollegeEligibilityHandler]
    CollegeCheck -- Yes --> DeadlineCheck{Has Deadline Passed?}
    DeadlineCheck -- Yes --> FailDeadline[Return Expired: DeadlineCheckHandler]
    DeadlineCheck -- No --> CapacityCheck{Is Event Full?}
    CapacityCheck -- Yes --> FailCap[Return Full: CapacityCheckHandler]
    CapacityCheck -- No --> DupCheck{Already Registered?}
    DupCheck -- Yes --> FailDup[Return Duplicate: DuplicateRegistrationHandler]
    DupCheck -- No --> Pass([Create Registration & Notify Bridge])`
      },
      {
        title: '8. State Diagram – Event Lifecycle',
        type: 'State Machine',
        description: 'State transitions for an Event object from creation to completion or cancellation.',
        mermaidCode: `stateDiagram-v2
    [*] --> DRAFT: Organizer Creates Draft
    DRAFT --> PUBLISHED: Organizer Publishes Event
    PUBLISHED --> REGISTRATION_OPEN: Registration Opens
    REGISTRATION_OPEN --> FULL: Capacity Reached
    FULL --> REGISTRATION_OPEN: Student Cancels Registration
    REGISTRATION_OPEN --> REGISTRATION_CLOSED: Deadline Passed
    REGISTRATION_CLOSED --> ONGOING: Event Start Time Reached
    ONGOING --> COMPLETED: Event End Time Reached
    PUBLISHED --> CANCELLED: Organizer Cancels Event
    REGISTRATION_OPEN --> CANCELLED: Organizer Cancels Event
    COMPLETED --> [*]
    CANCELLED --> [*]`
      },
      {
        title: '9. Component Diagram',
        type: 'Architecture',
        description: 'Layered component view: Presentation -> Controllers -> Services/Patterns -> Repositories -> Database.',
        mermaidCode: `graph TD
    subgraph Presentation Layer
        UI["React 18 + Vite Web Client"]
    end

    subgraph API Controller Layer
        AC["AuthController"]
        EC["EventController"]
        RC["RegistrationController"]
        ADC["AdminController"]
        PC["PatternInfoController"]
    end

    subgraph Service & Pattern Layer
        AS["AuthService"]
        ES["EventService"]
        RS["RegistrationService"]
        VC["ValidationChain (Chain of Resp)"]
        EF["EventFactory (Factory Method)"]
        AF["EventComponentFactory (Abstract Factory)"]
        EAP["EventAccessProxy (Proxy)"]
        NB["NotificationBridge (Bridge)"]
        ESUB["EventSubject (Observer)"]
    end

    subgraph Repository DAO Layer
        CR["CollegeRepository"]
        UR["UserRepository"]
        ER["EventRepository"]
        RR["RegistrationRepository"]
        NR["NotificationRepository"]
    end

    subgraph Database
        DB[("DatabaseManager (Singleton) / SQLite")]
    end

    UI --> AC
    UI --> EC
    UI --> RC
    UI --> ADC

    AC --> AS
    EC --> ES
    RC --> RS

    ES --> EAP
    ES --> EF
    ES --> AF
    ES --> ESUB
    RS --> VC
    RS --> NB

    AS --> UR
    EAP --> ER
    RS --> RR
    NB --> NR

    CR --> DB
    UR --> DB
    ER --> DB
    RR --> DB
    NR --> DB`
      },
      {
        title: '10. Deployment Diagram',
        type: 'Deployment',
        description: 'Physical deployment layout of Client Browser, Node Express Web Server, and SQLite Database.',
        mermaidCode: `graph LR
    subgraph Client Device
        Browser["Modern Web Browser (Chrome/Firefox/Edge)"]
    end

    subgraph Node.js Application Server
        Express["Express.js Server (Port 5000)"]
        Vite["Vite Dev Server (Port 3000)"]
    end

    subgraph Persistence
        DBFile["eventbridge.db (SQLite Database File)"]
    end

    Browser -- HTTP / REST API Calls --> Express
    Browser -- Serves React Web App --> Vite
    Express -- Synchronous Read/Write --> DBFile`
      }
    ];

    return res.json({ success: true, data: { patterns, umlDiagrams } });
  };
}
