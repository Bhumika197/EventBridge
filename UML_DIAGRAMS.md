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
