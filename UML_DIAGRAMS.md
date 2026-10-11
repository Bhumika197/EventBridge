# EventBridge – Complete UML Diagram Specifications

This document provides formal Mermaid / PlantUML specifications for all 10 UML diagrams representing the EventBridge architecture.

---

## 1. Use Case Diagram

```mermaid
gantt
```
```mermaid
graph TD
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
    Admin --> UC1
```

---

## 2. Class Diagram

```mermaid
classDiagram
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

    class EventFactory {
        <<abstract>>
        +createEvent(data) Event
    }

    class TechnicalEventFactory {
        +createEvent(data) Event
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

    class InAppChannel {
        +send()
    }

    class EventSubject {
        -observers: IEventObserver[]
        +attach(obs)
        +notifyObservers(event, changeType, msg)
    }

    IEventRepository <|.. EventRepository
    IEventRepository <|.. EventAccessProxy
    EventAccessProxy --> EventRepository
    EventFactory <|-- TechnicalEventFactory
    NotificationBridge --> NotificationChannel
    NotificationChannel <|.. InAppChannel
    RegistrationValidationChain --> ValidationHandler
```

---

## 3. Sequence Diagram – Student Login

```mermaid
sequenceDiagram
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
    AuthService->>AuthService: Verify bcrypt password hash & generate JWT
    AuthService-->>AuthController: JWT Token + User Object
    AuthController-->>Student: 200 OK (Token, User)
```

---

## 4. Sequence Diagram – Event Discovery (Proxy Pattern)

```mermaid
sequenceDiagram
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
    EventAccessProxy->>EventAccessProxy: Filter out College B INTRA events
    EventAccessProxy-->>EventService: Eligible Event Feed
    EventService-->>EventController: Events List
    EventController-->>Student: 200 OK (Eligible Events)
```

---

## 5. Sequence Diagram – Registration Workflow (Chain of Responsibility)

```mermaid
sequenceDiagram
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
    Note over ValidationChain: Sequential Handlers:<br/>1. AuthCheck<br/>2. EventStatus<br/>3. VisibilityCheck<br/>4. CollegeEligibility<br/>5. DeadlineCheck<br/>6. CapacityCheck<br/>7. DuplicateRegistration
    ValidationChain-->>RegistrationService: Allowed: true
    RegistrationService->>RegistrationRepository: create(eventId, studentId)
    RegistrationService->>NotificationBridge: dispatch(studentId, eventId, title)
    NotificationBridge-->>RegistrationService: Notification Dispatched
    RegistrationService-->>RegistrationController: Registration Confirmed
    RegistrationController-->>Student: 201 Created
```

---

## 6. Sequence Diagram – Event Update & Observer Pattern

```mermaid
sequenceDiagram
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
    EventService-->>Organizer: Event Updated Successfully
```

---

## 7. Activity Diagram – Registration Workflow

```mermaid
flowchart TD
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
    DupCheck -- No --> Pass([Create Registration & Notify Bridge])
```

---

## 8. State Diagram – Event Lifecycle

```mermaid
stateDiagram-v2
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
    CANCELLED --> [*]
```

---

## 9. Component Diagram

```mermaid
graph TD
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
    UI --> PC

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
    NR --> DB
```

---

## 10. Deployment Diagram

```mermaid
graph LR
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
    Express -- Synchronous Read/Write --> DBFile
```

---

## 11. Builder Pattern Diagram (EventBuilder)

```mermaid
classDiagram
    class EventBuilder {
        -data: Partial<EventCreationData>
        +setTitle(title: string) EventBuilder
        +setDate(date: string) EventBuilder
        +setCollege(collegeId: number) EventBuilder
        +setSchedule(start: string, end: string) EventBuilder
        +setVenue(venue: string) EventBuilder
        +setCapacity(capacity: number) EventBuilder
        +setInterCollege(isInter: boolean) EventBuilder
        +setPrizePool(amount: number) EventBuilder
        +setTeamSize(min: number, max: number) EventBuilder
        +addSpeaker(speaker: string) EventBuilder
        +addSponsor(sponsor: string) EventBuilder
        +validate() EventBuilderValidationResult
        +build() EventCreationData
    }

    class EventBuilderValidationResult {
        +isValid: boolean
        +errors: string[]
    }

    class EventCreationData {
        +title: string
        +date: string
        +collegeId: number
        +venue: string
        +capacity: number
        +prizePool: number
        +speakers: string[]
        +sponsors: string[]
    }

    EventBuilder --> EventBuilderValidationResult : produces
    EventBuilder --> EventCreationData : builds
```

---

## 12. Prototype Pattern Diagram (EventPrototype)

```mermaid
classDiagram
    class Prototype~T~ {
        <<interface>>
        +clone(overrides) T
    }

    class EventPrototype {
        +title: string
        +date: string
        +venue: string
        +status: string
        +currentRegistrations: number
        +speakers: string[]
        +sponsors: string[]
        +clone(overrides) EventPrototype
    }

    Prototype <|.. EventPrototype : implements
```

---

## 13. Mediator Pattern Diagram (EventCoordinator)

```mermaid
classDiagram
    class Mediator {
        <<interface>>
        +notify(sender: Colleague, event: string, data: any) Promise
    }

    class Colleague {
        <<abstract>>
        #mediator: Mediator
        +setMediator(mediator: Mediator)
    }

    class EventCoordinator {
        -seatColleague: SeatColleague
        -paymentColleague: PaymentColleague
        -notificationColleague: NotificationColleague
        -dashboardColleague: DashboardColleague
        +coordinateRegistration(student, event) Promise
        +notify(sender, event, data) Promise
    }

    class SeatColleague {
        +checkAndReserveSeat(event) Promise
    }

    class PaymentColleague {
        +processPayment(amount, student) Promise
    }

    class NotificationColleague {
        +sendConfirmation(student, event, waitlisted) Promise
    }

    class DashboardColleague {
        +updateOrganizerDashboard(organizerId, eventId, status) Promise
    }

    Mediator <|.. EventCoordinator
    Colleague <|-- SeatColleague
    Colleague <|-- PaymentColleague
    Colleague <|-- NotificationColleague
    Colleague <|-- DashboardColleague

    EventCoordinator *-- SeatColleague
    EventCoordinator *-- PaymentColleague
    EventCoordinator *-- NotificationColleague
    EventCoordinator *-- DashboardColleague
```

---

## 14. Template Method Pattern Diagram (EventWorkflow)

```mermaid
classDiagram
    class EventWorkflow {
        <<abstract>>
        +run(event: Partial~Event~) Promise~WorkflowReport~
        #validate(event)* Promise
        #setupRegistration(event)* Promise
        #publish(event) Promise
        #executeEvent(event)* Promise
        #close(event) Promise
        #generateReport(event)* Promise
    }

    class HackathonWorkflow {
        #validate(event) Promise
        #setupRegistration(event) Promise
        #executeEvent(event) Promise
        #generateReport(event) Promise
    }

    class CulturalFestWorkflow {
        #validate(event) Promise
        #setupRegistration(event) Promise
        #executeEvent(event) Promise
        #generateReport(event) Promise
    }

    EventWorkflow <|-- HackathonWorkflow
    EventWorkflow <|-- CulturalFestWorkflow
```

---

## 15. Strategy Pattern Diagram (PricingStrategy)

```mermaid
classDiagram
    class PricingStrategy {
        <<interface>>
        +calculateFee(context: FeeCalculationContext) FeeBreakdown
    }

    class FeeCalculatorContext {
        -strategy: PricingStrategy
        +setStrategy(strategy: PricingStrategy)
        +calculate(context: FeeCalculationContext) FeeBreakdown
    }

    class FreeStrategy {
        +calculateFee(ctx) FeeBreakdown
    }

    class EarlyBirdStrategy {
        -discountPercent: number
        +calculateFee(ctx) FeeBreakdown
    }

    class InterCollegeFeeStrategy {
        -surchargeAmount: number
        +calculateFee(ctx) FeeBreakdown
    }

    class GroupDiscountStrategy {
        -discountPercent: number
        +calculateFee(ctx) FeeBreakdown
    }

    class StudentIdDiscountStrategy {
        -discountPercent: number
        +calculateFee(ctx) FeeBreakdown
    }

    PricingStrategy <|.. FreeStrategy
    PricingStrategy <|.. EarlyBirdStrategy
    PricingStrategy <|.. InterCollegeFeeStrategy
    PricingStrategy <|.. GroupDiscountStrategy
    PricingStrategy <|.. StudentIdDiscountStrategy

    FeeCalculatorContext o-- PricingStrategy
```

---

## 16. Memento Pattern Diagram (EventMemento)

```mermaid
classDiagram
    class EventMemento {
        -state: EventState
        -timestamp: string
        -note: string
        +getState() EventState
        +getTimestamp() string
        +getNote() string
    }

    class EventOriginator {
        -state: EventState
        +saveToMemento(note: string) EventMemento
        +restoreFromMemento(memento: EventMemento) EventState
        +getState() EventState
        +setState(state: EventState)
    }

    class EventHistoryCaretaker {
        -eventId: number
        -mementos: EventMemento[]
        +pushSnapshot(originator, note) Promise
        +undo(originator) Promise~EventState~
        +getHistory() Promise~EventMemento[]~
    }

    EventOriginator ..> EventMemento : creates & restores
    EventHistoryCaretaker o-- EventMemento : stores snapshots
```

---

## 17. Model-View-Controller (MVC) Full-Stack Diagram

```mermaid
graph TD
    subgraph View Layer ["View Layer (React Frontend)"]
        V1["EventCard"]
        V2["OrganizerDashboard"]
        V3["CreateEventWizardModal"]
        V4["DuplicateEventModal"]
        V5["EventVersionModal"]
        V6["DesignPatternExplorer"]
    end

    subgraph Controller Layer ["Controller Layer (Express & api.ts)"]
        C1["EventController"]
        C2["RegistrationController"]
        C3["AuthController"]
        C4["AdminController"]
        C5["frontend/src/services/api.ts Client"]
    end

    subgraph Model Layer ["Model Layer (Repositories, DB & Services)"]
        M1["EventRepository"]
        M2["RegistrationRepository"]
        M3["MementoRepository"]
        M4["UserRepository"]
        M5["DatabaseManager (SQLite WASM)"]
        M6["Domain Entities (Event, User, Registration)"]
    end

    View Layer -- User Interactions & HTTP Fetch --> Controller Layer
    Controller Layer -- Queries & Transaction Commands --> Model Layer
    Model Layer -- Typed Domain Entities & Data Sets --> Controller Layer
    Controller Layer -- JSON HTTP REST Responses --> View Layer
    View Layer -- DOM Virtual Tree Rerenders --> View Layer
```

