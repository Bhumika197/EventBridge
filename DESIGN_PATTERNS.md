# EventBridge – Academic Design Pattern Documentation

This document explains the technical implementation of the 8 design patterns implemented in the EventBridge platform architecture.

---

## 1. Singleton Pattern

### Problem
Opening multiple SQLite database handles across controllers causes memory leaks, transaction race conditions, and disk lock contention.

### Solution
`DatabaseManager` uses a private constructor and a static `getInstance()` method to guarantee that exactly one instance exists across the application runtime.

### Classes Involved
- `DatabaseManager`: Singleton database manager (`backend/src/db/DatabaseManager.ts`)

```typescript
export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private constructor() { ... }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
}
```

---

## 2. Chain of Responsibility Pattern

### Problem
Registration validation requires evaluating 7 distinct business rules (Authentication, Event Status, Visibility, Eligibility, Deadline, Capacity, Duplicate Registration). Hardcoding all checks in one service function creates rigid, untestable code.

### Solution
Requests are passed down a chain of handler objects extending abstract `ValidationHandler`. Each handler evaluates its rule and either returns a failure result with its handler name or passes control to the next handler.

### Classes Involved
- `ValidationHandler` (Abstract base handler)
- `AuthCheckHandler`
- `EventStatusHandler`
- `VisibilityCheckHandler`
- `CollegeEligibilityHandler`
- `DeadlineCheckHandler`
- `CapacityCheckHandler`
- `DuplicateRegistrationHandler`
- `RegistrationValidationChain` (Assembler)

```typescript
authCheck
  .setNext(eventStatus)
  .setNext(visibility)
  .setNext(collegeEligibility)
  .setNext(deadline)
  .setNext(capacity)
  .setNext(duplicate);
```

---

## 3. Factory Method Pattern

### Problem
Different event categories (Technical, Cultural, Sports, Literary, Workshops, etc.) require category defaults, eligibility rules, and contact information. Scattering `new TechnicalEvent()` calls across controllers creates tight coupling.

### Solution
`EventFactory` defines an abstract `createEvent()` method. Concrete factory subclasses (`TechnicalEventFactory`, `CulturalEventFactory`, `SportsEventFactory`, etc.) encapsulate category-specific instantiation logic.

### Classes Involved
- `EventFactory` (Abstract Creator)
- `TechnicalEventFactory`, `CulturalEventFactory`, `SportsEventFactory`, `LiteraryEventFactory`, `WorkshopEventFactory`, `ManagementEventFactory`, `SocialEventFactory`
- `EventFactoryProvider`

---

## 4. Abstract Factory Pattern

### Problem
Events require related families of components: an Event object, a Registration Policy (e.g. equipment or team rules), and an Eligibility Policy. Creating these components independently risks combining incompatible rules across categories.

### Solution
`EventComponentFactory` defines factory methods for creating families of related products (`createEvent()`, `createRegistrationPolicy()`, `createEligibilityPolicy()`).

### Classes Involved
- `EventComponentFactory` (Abstract Factory Interface)
- `TechnicalComponentFactory`, `CulturalComponentFactory`, `SportsComponentFactory`
- `IRegistrationPolicy`, `IEligibilityPolicy`

---

## 5. Proxy Pattern

### Problem
Students could bypass UI restrictions and query backend endpoints to view or register for restricted `INTRA_COLLEGE` events hosted by other colleges.

### Solution
`EventAccessProxy` wraps `EventRepository` and implements `IEventRepository`. It intercepts database requests to filter event feeds based on user authentication, college affiliation, and event type before delegating to the real repository.

### Classes Involved
- `IEventRepository` (Subject Interface)
- `EventRepository` (Real Subject)
- `EventAccessProxy` (Proxy)

---

## 6. Bridge Pattern

### Problem
EventBridge supports 7 notification types (`RegistrationConfirmation`, `EventUpdated`, `EventCancelled`, `OrganizerAnnouncement`, etc.) across 3 delivery channels (`InAppChannel`, `EmailChannel`, `SMSChannel`). Direct inheritance would generate $7 \times 3 = 21$ concrete subclasses.

### Solution
Decouple Notification Abstraction (`NotificationBridge`) from Delivery Channel Implementation (`NotificationChannel`).

### Classes Involved
- `NotificationBridge` (Abstraction)
- `RegistrationConfirmationNotification`, `EventUpdatedNotification`, `EventCancelledNotification`
- `NotificationChannel` (Implementor Interface)
- `InAppChannel`, `EmailChannel`, `SMSChannel`

---

## 7. Observer Pattern

### Problem
When an organizer changes event dates, venue, or status, manually notifying all registered students, organizers, and admins creates tight coupling.

### Solution
`EventSubject` maintains a list of `IEventObserver` instances (`RegisteredStudentsObserver`, `OrganizerObserver`, `AdminAuditObserver`). When an event changes, `notifyObservers()` automatically dispatches notifications to all subscribers.

### Classes Involved
- `EventSubject` (Subject)
- `IEventObserver` (Observer Interface)
- `RegisteredStudentsObserver`, `OrganizerObserver`, `AdminAuditObserver`

---

## 8. Database Connectivity / Repository DAO

### Problem
Embedding raw SQL queries within controllers or services mixes data access with business logic, making testing difficult.

### Solution
Encapsulate SQL CRUD queries inside dedicated Data Access Objects (`CollegeRepository`, `UserRepository`, `EventRepository`, `RegistrationRepository`, `NotificationRepository`, `ContactRequestRepository`).
