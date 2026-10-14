export const PATTERNS_DATA = {
  patterns: [
    {
      id: "singleton",
      name: "Singleton Pattern",
      category: "Creational",
      targetClass: "DatabaseManager",
      filePath: "backend-java/src/main/java/com/eventbridge/db/DatabaseManager.java",
      featurePower: "Guarantees a single synchronized SQLite connection manager and thread-safe connection distribution across virtual threads.",
      problem: "Multiple uncoordinated database instances cause memory leaks, thread contention, and conflicting locks on the SQLite file.",
      solution: "Encapsulate connection configuration within a private constructor and provide a synchronized getInstance() accessor returning the global singleton.",
      classesInvolved: ["DatabaseManager", "Connection", "DriverManager"],
      codeSnippet: `public class DatabaseManager {
    private static DatabaseManager instance;
    private final String dbUrl;

    private DatabaseManager() {
        this.dbUrl = "jdbc:sqlite:backend/data/eventbridge.db";
        createTables();
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl);
    }
}`
    },
    {
      id: "builder",
      name: "Builder Pattern",
      category: "Creational",
      targetClass: "EventBuilder",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/builder/EventBuilder.java",
      featurePower: "Assembles multifaceted event objects step-by-step with chained fluent setters and atomic validation rules.",
      problem: "Constructors with telescoping arguments (title, venue, date, capacity, prize pool, team size, speakers) are error-prone and hard to maintain.",
      solution: "Provide an EventBuilder with chained fluent methods that incrementally populate properties and validate constraints upon build().",
      classesInvolved: [
        "EventBuilder",
        "Event",
        "EventBuilderValidationResult"
      ],
      codeSnippet: `Event event = new EventBuilder()
    .setTitle("National AI Hackathon 2026")
    .setDate("2026-11-20")
    .setCollegeId(7)
    .setSchedule("09:00 AM", "06:00 PM")
    .setVenue("APJ Abdul Kalam Auditorium")
    .setCapacity(200)
    .setInterCollege(true)
    .setPrizePool("75,000")
    .setTeamSize(2, 4)
    .addSpeaker("Dr. Andrew Ng")
    .addSponsor("Google Cloud")
    .build();`
    },
    {
      id: "prototype",
      name: "Prototype Pattern",
      category: "Creational",
      targetClass: "EventPrototype",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/prototype/EventPrototype.java",
      featurePower: "Powers the 'Duplicate Event' feature with deep cloning of event configurations, arrays, and eligibility schemas.",
      problem: "Colleges regularly host recurring annual hackathons. Manually re-entering speakers, sponsors, and rules is tedious and error-prone.",
      solution: "Implement a clone() method on Event that creates an independent deep copy with reset attendance counters and DRAFT status.",
      classesInvolved: [
        "Cloneable",
        "Event",
        "EventRepository"
      ],
      codeSnippet: `public class Event implements Cloneable {
    @Override
    public Event clone() {
        Event copy = new Event();
        copy.setTitle(this.title + " (Copy)");
        copy.setDescription(this.description);
        copy.setCategory(this.category);
        copy.setEventType(this.eventType);
        copy.setCollegeId(this.collegeId);
        copy.setVenue(this.venue);
        copy.setDate(this.date);
        copy.setStatus("DRAFT");
        copy.setCurrentRegistrations(0);
        copy.setSpeakers(this.speakers);
        copy.setSponsors(this.sponsors);
        return copy;
    }
}`
    },
    {
      id: "factory_method",
      name: "Factory Method Pattern",
      category: "Creational",
      targetClass: "EventFactory",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/factory/EventFactoryProvider.java",
      featurePower: "Instantiates category-specific domain archetypes (Hackathons, Workshops, Cultural Fests) with appropriate defaults.",
      problem: "Direct constructor instantiation leads to fragmented domain defaults and inconsistent validation rules across categories.",
      solution: "Define an abstract EventFactory with polymorphic creator subclasses that assemble pre-configured default event models.",
      classesInvolved: [
        "EventFactory",
        "TechnicalEventFactory",
        "CulturalEventFactory",
        "EventFactoryProvider"
      ],
      codeSnippet: `public abstract class EventFactory {
    public abstract Event createDefaultEvent(int collegeId, int organizerId);
}

public class TechnicalEventFactory extends EventFactory {
    @Override
    public Event createDefaultEvent(int collegeId, int organizerId) {
        Event e = new Event();
        e.setCategory("Technical");
        e.setTitle("New Technical Symposium");
        e.setEligibilityDescription("Open to Engineering & Science Students");
        return e;
    }
}`
    },
    {
      id: "chain_of_responsibility",
      name: "Chain of Responsibility Pattern",
      category: "Behavioral",
      targetClass: "RegistrationValidationChain",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/chain/RegistrationValidationChain.java",
      featurePower: "Executes a 6-tier student registration gate pipeline (Auth -> Status -> Visibility -> College -> Deadline -> Capacity -> Duplicate).",
      problem: "Hardcoding nested validation checks in a single monolithic controller method creates rigid, untestable spaghetti code.",
      solution: "Chain independent Handler objects sequentially. Each handler checks a single business rule and either forwards or halts with a reason.",
      classesInvolved: [
        "ValidationHandler",
        "AuthCheckHandler",
        "EventStatusHandler",
        "VisibilityCheckHandler",
        "CollegeEligibilityHandler",
        "CapacityCheckHandler",
        "DuplicateRegistrationHandler",
        "RegistrationValidationChain"
      ],
      codeSnippet: `public class RegistrationValidationChain {
    private final ValidationHandler head;

    public RegistrationValidationChain() {
        ValidationHandler authCheck = new AuthCheckHandler();
        ValidationHandler statusCheck = new EventStatusHandler();
        ValidationHandler visibilityCheck = new VisibilityCheckHandler();
        ValidationHandler collegeCheck = new CollegeEligibilityHandler();
        ValidationHandler deadlineCheck = new DeadlineCheckHandler();
        ValidationHandler capacityCheck = new CapacityCheckHandler();
        ValidationHandler dupCheck = new DuplicateRegistrationHandler();

        authCheck.setNext(statusCheck)
                 .setNext(visibilityCheck)
                 .setNext(collegeCheck)
                 .setNext(deadlineCheck)
                 .setNext(capacityCheck)
                 .setNext(dupCheck);
        this.head = authCheck;
    }

    public ValidationResult validate(User user, Event event, boolean isDuplicate) {
        return head.handle(new ValidationContext(user, event, isDuplicate));
    }
}`
    },
    {
      id: "bridge",
      name: "Bridge Pattern",
      category: "Structural",
      targetClass: "NotificationBridge",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/bridge/NotificationBridge.java",
      featurePower: "Decouples notification business logic from concrete transmission channels (In-App, Email, SMS).",
      problem: "Binding event registration alerts directly to an email or messaging library causes tight coupling and prevents adding new channels.",
      solution: "Separate the notification abstraction hierarchy from the channel implementor interface, allowing runtime channel switching.",
      classesInvolved: [
        "NotificationBridge",
        "NotificationChannel",
        "RegistrationConfirmationNotification",
        "InAppChannel",
        "EmailChannel",
        "SMSChannel"
      ],
      codeSnippet: `public abstract class NotificationBridge {
    protected NotificationChannel channel;

    public NotificationBridge(NotificationChannel channel) {
        this.channel = channel != null ? channel : new InAppChannel();
    }

    public abstract NotificationRecord dispatch(int userId, Integer eventId, String title, String extra);
}

// Concrete Bridge Execution:
NotificationBridge bridge = new RegistrationConfirmationNotification(new InAppChannel());
bridge.dispatch(studentId, eventId, event.getTitle(), "Registration Confirmed");`
    },
    {
      id: "proxy",
      name: "Proxy Pattern",
      category: "Structural",
      targetClass: "EventAccessProxy",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/proxy/EventAccessProxy.java",
      featurePower: "Acts as a protective gatekeeper, filtering out private intra-college events before students view discovery feeds.",
      problem: "Direct access to raw SQL queries can leak internal events to unauthorized students from other colleges.",
      solution: "Provide an EventAccessProxy implementing IEventRepository that intercepts queries and validates inter-college eligibility policies.",
      classesInvolved: [
        "IEventRepository",
        "EventRepository",
        "EventAccessProxy"
      ],
      codeSnippet: `public class EventAccessProxy implements IEventRepository {
    private final EventRepository realRepo = new EventRepository();

    @Override
    public List<Event> findAllEligibleForUser(User user) {
        List<Event> all = realRepo.findAll();
        return all.stream()
            .filter(e -> "INTER_COLLEGE".equalsIgnoreCase(e.getEventType()) || 
                         e.getCollegeId() == user.getCollegeId())
            .toList();
    }
}`
    },
    {
      id: "observer",
      name: "Observer Pattern",
      category: "Behavioral",
      targetClass: "EventSubject",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/observer/EventSubject.java",
      featurePower: "Automatically pushes schedule shifts and urgent cancellations to all registered students.",
      problem: "Manually iterating and notifying attendees during last-minute room changes leads to missed updates and delayed alerts.",
      solution: "Maintain an observer list on the event subject and broadcast notifications to all registered observers whenever state changes.",
      classesInvolved: [
        "EventSubject",
        "EventObserver",
        "StudentObserver"
      ],
      codeSnippet: `public class EventSubject {
    private final List<EventObserver> observers = new ArrayList<>();

    public void attach(EventObserver observer) {
        observers.add(observer);
    }

    public void notifyAllObservers(String announcement) {
        for (EventObserver observer : observers) {
            observer.update(announcement);
        }
    }
}`
    },
    {
      id: "strategy",
      name: "Strategy Pattern",
      category: "Behavioral",
      targetClass: "PricingStrategy",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/strategy/PricingStrategy.java",
      featurePower: "Dynamically calculates registration fees (Early Bird 20% discount, Group Tier, Standard rate).",
      problem: "Hardcoded discount calculations across different event types produce tangled switch statements.",
      solution: "Encapsulate fee calculation algorithms in strategy classes implementing a common pricing interface.",
      classesInvolved: [
        "IPricingStrategy",
        "EarlyBirdStrategy",
        "GroupDiscountStrategy",
        "StandardPricingStrategy"
      ],
      codeSnippet: `public interface IPricingStrategy {
    double calculate(double baseFee, int teamSize);
}

public class EarlyBirdStrategy implements IPricingStrategy {
    @Override
    public double calculate(double baseFee, int teamSize) {
        return (baseFee * teamSize) * 0.80; // 20% discount
    }
}`
    },
    {
      id: "memento",
      name: "Memento Pattern",
      category: "Behavioral",
      targetClass: "EventMemento",
      filePath: "backend-java/src/main/java/com/eventbridge/patterns/memento/EventMemento.java",
      featurePower: "Provides 1-click Undo capability by restoring previous event snapshots from version history.",
      problem: "Accidental edits to venue or dates by organizers can disrupt thousands of attendees with no easy way to revert.",
      solution: "Capture state snapshots in immutable Memento objects stored in SQLite and restore state on demand.",
      classesInvolved: [
        "EventMemento",
        "EventCareTaker"
      ],
      codeSnippet: `public class EventMemento {
    private final int eventId;
    private final String stateJson;
    private final String timestamp;

    public EventMemento(int eventId, String stateJson) {
        this.eventId = eventId;
        this.stateJson = stateJson;
        this.timestamp = LocalDateTime.now().toString();
    }
    public String getStateJson() { return stateJson; }
}`
    },
    {
      id: "mvc",
      name: "Model-View-Controller (MVC) Pattern",
      category: "Architectural",
      targetClass: "EventBridgeServer",
      filePath: "Full Stack Architecture: backend-java/ (Model & Controller) + frontend/ (Views)",
      featurePower: "Enforces strict separation of UI Presentation (React), HTTP Request Orchestration (Java HttpServer), and Data Persistence (SQLite).",
      problem: "Coupling SQL queries with UI rendering or embedding business logic directly in HTML makes applications fragile and difficult to scale.",
      solution: "Separate concerns: Views handle UI rendering and user events; Controllers parse HTTP requests and orchestrate services; Models encapsulate data and ACID persistence.",
      classesInvolved: [
        "Model: Event, User, EventRepository",
        "View: EventCard, Navbar, Dashboard",
        "Controller: EventBridgeServer, AuthHandler"
      ],
      codeSnippet: `// 1. Controller: EventBridgeServer.java
if (path.equals("/api/events") && "GET".equals(method)) {
    List<Event> events = eventRepo.findAll();
    sendJson(exchange, 200, Map.of("success", true, "data", events));
}

// 2. View: EventCard.jsx
const EventCard = ({ event }) => (
    <div className="card"><h3>{event.title}</h3></div>
);`
    }
  ],
  umlDiagrams: [
    {
      title: "Complete Class Diagram: GoF Design Patterns Architecture",
      category: "Structural UML",
      description: "Comprehensive UML class model illustrating relationships between Creational, Structural, and Behavioral patterns.",
      type: "classDiagram",
      source: `classDiagram
    direction TB
    class DatabaseManager {
        -DatabaseManager instance
        -String dbUrl
        -DatabaseManager()
        +getInstance() DatabaseManager
        +getConnection() Connection
    }
    class IEventRepository {
        <<interface>>
        +findById(int id) Event
        +findAll() List~Event~
        +findAllEligibleForUser(User u) List~Event~
    }
    class EventRepository {
        +findById(int id) Event
        +findAll() List~Event~
        +create(Event e) Event
        +update(Event e) boolean
    }
    class EventAccessProxy {
        -EventRepository realRepo
        +findAllEligibleForUser(User u) List~Event~
    }
    IEventRepository <|.. EventRepository
    IEventRepository <|.. EventAccessProxy
    EventAccessProxy --> EventRepository : delegates
    
    class ValidationHandler {
        <<abstract>>
        #ValidationHandler next
        +setNext(ValidationHandler h) ValidationHandler
        +handle(ValidationContext ctx) ValidationResult
    }
    class AuthCheckHandler {
        +handle(ValidationContext ctx) ValidationResult
    }
    class CapacityCheckHandler {
        +handle(ValidationContext ctx) ValidationResult
    }
    class DuplicateRegistrationHandler {
        +handle(ValidationContext ctx) ValidationResult
    }
    ValidationHandler <|-- AuthCheckHandler
    ValidationHandler <|-- CapacityCheckHandler
    ValidationHandler <|-- DuplicateRegistrationHandler

    class NotificationBridge {
        <<abstract>>
        #NotificationChannel channel
        +dispatch(int userId, int eventId, String title) NotificationRecord
    }
    class NotificationChannel {
        <<interface>>
        +send(int userId, int eventId, String type, String msg) NotificationRecord
    }
    class InAppChannel {
        +send(int userId, int eventId, String type, String msg) NotificationRecord
    }
    NotificationBridge --> NotificationChannel : bridge
    NotificationChannel <|.. InAppChannel`
    },
    {
      title: "Sequence Diagram: Student Registration Flow (Chain of Responsibility)",
      category: "Behavioral UML",
      description: "Trace of student registration request passing through the validation chain, database persistence, and bridge notification.",
      type: "sequenceDiagram",
      source: `sequenceDiagram
    actor Student
    participant View as React View
    participant Server as Java EventBridgeServer
    participant Chain as RegistrationValidationChain
    participant Repo as RegistrationRepository
    participant Bridge as NotificationBridge
    participant DB as SQLite Database

    Student->>View: Click "Register for Event"
    View->>Server: POST /api/registrations/event/:id (Bearer JWT)
    Server->>Server: Authenticate JWT (dev@student.com)
    Server->>Chain: validate(student, event, isDuplicate)
    Chain->>Chain: AuthCheck -> StatusCheck -> Eligibility -> Capacity -> Duplicate
    Chain-->>Server: ValidationResult.ok()
    Server->>Repo: create(studentId, eventId)
    Repo->>DB: INSERT INTO REGISTRATION
    DB-->>Repo: registrationId = 42
    Server->>Bridge: dispatch(studentId, eventId, "Registration Confirmed")
    Bridge->>DB: INSERT INTO NOTIFICATION
    Server-->>View: HTTP 201 Created { status: "CONFIRMED" }
    View-->>Student: Update UI badge to "CONFIRMED"`
    }
  ]
};
