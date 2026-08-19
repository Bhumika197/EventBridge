# EventBridge – Academic Java Design Patterns Implementation Guide

This document details the exact **Java Object-Oriented Design Patterns** implemented in the `EventBridge` platform (`com.eventbridge`).

---

## 1. Singleton Pattern
- **Java Class**: [`DatabaseManager.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/db/DatabaseManager.java)
- **Package**: `com.eventbridge.db`
- **Purpose**: Guarantees a single, thread-safe SQLite database connection instance across the application lifecycle.

```java
public class DatabaseManager {
    private static DatabaseManager instance;
    private Connection connection;

    private DatabaseManager() {
        // Private constructor initialization
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }
}
```

---

## 2. Chain of Responsibility Pattern
- **Java Package**: `com.eventbridge.patterns.chain`
- **Main Classes**: [`ValidationHandler.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/patterns/chain/ValidationHandler.java), [`RegistrationValidationChain.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/patterns/chain/RegistrationValidationChain.java)
- **Purpose**: Processes event registrations through a sequential chain of 7 rule handlers:
  1. `AuthCheckHandler`
  2. `EventStatusHandler`
  3. `VisibilityCheckHandler`
  4. `CollegeEligibilityHandler`
  5. `DeadlineCheckHandler`
  6. `CapacityCheckHandler`
  7. `DuplicateRegistrationHandler`

```java
public abstract class ValidationHandler {
    protected ValidationHandler next;

    public ValidationHandler setNext(ValidationHandler next) {
        this.next = next;
        return next;
    }

    public abstract ValidationResult handle(ValidationContext context);
}
```

---

## 3. Factory Method Pattern
- **Java Package**: `com.eventbridge.patterns.factory`
- **Main Classes**: [`EventFactory.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/patterns/factory/EventFactory.java), `TechnicalEventFactory`, `CulturalEventFactory`, `SportsEventFactory`
- **Purpose**: Encapsulates creation logic for category-specific event objects.

```java
public abstract class EventFactory {
    public abstract Event createEvent(String title, String description, String eventType, ...);
}
```

---

## 4. Abstract Factory Pattern
- **Java Package**: `com.eventbridge.patterns.abstractfactory`
- **Purpose**: Creates families of related event objects (Event, Registration Policy, Eligibility Policy) for specific categories.

---

## 5. Proxy Pattern
- **Java Package**: `com.eventbridge.patterns.proxy`
- **Main Classes**: [`IEventRepository.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/patterns/proxy/IEventRepository.java), [`EventAccessProxy.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/patterns/proxy/EventAccessProxy.java)
- **Purpose**: Enforces institutional security and `INTRA_COLLEGE` visibility rules before delegating to the real repository.

```java
public class EventAccessProxy implements IEventRepository {
    private final EventRepository realRepository = new EventRepository();

    @Override
    public List<Event> findAllEligibleForUser(User user) {
        // Enforce INTRA_COLLEGE visibility filtering
    }
}
```

---

## 6. Bridge Pattern
- **Java Package**: `com.eventbridge.patterns.bridge`
- **Main Classes**: [`NotificationBridge.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/patterns/bridge/NotificationBridge.java), `InAppChannel`, `EmailChannel`, `SMSChannel`
- **Purpose**: Decouples Notification Abstractions (RegistrationConfirmation, PasswordReset) from Delivery Implementations.

```java
public abstract class NotificationBridge {
    protected NotificationChannel channel;
    public NotificationBridge(NotificationChannel channel) {
        this.channel = channel;
    }
}
```

---

## 7. Observer Pattern
- **Java Package**: `com.eventbridge.patterns.observer`
- **Main Classes**: [`EventSubject.java`](file:///C:/Users/HP/OneDrive/Desktop/IOT/EventBridge/backend-java/src/main/java/com/eventbridge/patterns/observer/EventSubject.java)
- **Observers**: `RegisteredStudentsObserver`, `OrganizerObserver`, `AdminAuditObserver`
- **Purpose**: Automatically notifies subscribers when an event state, date, venue, or cancellation occurs.

---

## 8. Database Connectivity (DAO Pattern)
- **Java Package**: `com.eventbridge.repository`
- **Main Classes**: `CollegeRepository.java`, `UserRepository.java`, `EventRepository.java`, `RegistrationRepository.java`, `NotificationRepository.java`
- **Purpose**: Encapsulates raw JDBC SQL statements inside Data Access Objects.
