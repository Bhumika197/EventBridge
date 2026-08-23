# EventBridge — Design Patterns Architecture

This document details the software design patterns implemented in **EventBridge**. Each pattern was introduced to solve a concrete engineering problem in multi-college event discovery, access control, and registration processing.

---

## 🎯 Core Design Patterns

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           Core Design Patterns                          │
├──────────────────────────┬──────────────────────────────────────────────┤
│ 1. Factory Method        │ Category creation & domain defaults          │
│ 2. Chain of Responsibility│ 6-stage registration validation pipeline    │
│ 3. Proxy Pattern         │ College-based access control & draft defense │
│ 4. Observer Pattern      │ Decoupled notification dispatch on events    │
└──────────────────────────┴──────────────────────────────────────────────┘
```

---

## 1. Factory Method Pattern

### Problem
Different event categories (`Technical`, `Cultural`, `Sports`, `Workshop`, `Seminar`, `Hackathon`) require specific baseline configurations:
- Technical events need laptop requirements and programming eligibility notes.
- Cultural events need stage/performance guidelines and ID requirements.
- Sports events need fitness declarations and athletic wear notes.
- Workshops need hands-on prerequisite guidelines.

Hardcoding category branching logic across controllers results in repetitive boilerplate and fragile instantiation.

### Solution
`EventFactory` defines an abstract `createEvent()` method. Concrete factory classes (`TechnicalEventFactory`, `CulturalEventFactory`, `SportsEventFactory`, `WorkshopEventFactory`, `SeminarEventFactory`) encapsulate category-specific domain defaults and eligibility text.

### Source Files
- Base & Concrete Creators: [`backend/src/patterns/factory/EventFactory.ts`](backend/src/patterns/factory/EventFactory.ts)
- Service Integration: [`backend/src/services/EventService.ts`](backend/src/services/EventService.ts)

```typescript
export abstract class EventFactory {
  public abstract createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>;
}

export class TechnicalEventFactory extends EventFactory {
  public createEvent(data: EventCreationData) {
    return {
      ...data,
      category: 'Technical',
      eligibilityDescription: data.eligibilityDescription || 'Open to all students with interest in programming and engineering.',
      status: data.status || 'DRAFT'
    };
  }
}
```

---

## 2. Chain of Responsibility Pattern

### Problem
Student registration involves multiple independent validation rules:
1. Is the student authenticated with a valid `STUDENT` role?
2. Is the event in `PUBLISHED` state (not draft, submitted, or cancelled)?
3. If the event is `INTRA_COLLEGE`, is the student enrolled in the host college?
4. Does the student meet college affiliation eligibility?
5. Has the registration deadline expired?
6. Has the student already registered or joined the waitlist?

A single monolithic validation method is hard to read, difficult to unit test, and resistant to adding new checks.

### Solution
`RegistrationValidationChain` links standalone handler objects extending abstract `ValidationHandler`. Each handler performs its check and either halts the chain returning an explanatory message or passes execution to the next handler.

### Source Files
- Abstract Handler: [`backend/src/patterns/chain/ValidationHandler.ts`](backend/src/patterns/chain/ValidationHandler.ts)
- Concrete Handlers: [`backend/src/patterns/chain/ConcreteHandlers.ts`](backend/src/patterns/chain/ConcreteHandlers.ts)
- Chain Assembler: [`backend/src/patterns/chain/RegistrationValidationChain.ts`](backend/src/patterns/chain/RegistrationValidationChain.ts)

```typescript
// Chain Assembly Order:
authCheck
  .setNext(eventStatus)
  .setNext(visibility)
  .setNext(collegeEligibility)
  .setNext(deadline)
  .setNext(duplicate);
```

---

## 3. Proxy Pattern

### Problem
Without protection at the repository boundary, unauthorized students could bypass frontend UI filters to inspect or query private `INTRA_COLLEGE` events of other colleges or access unpublished `DRAFT` / `SUBMITTED` events.

### Solution
`EventAccessProxy` implements the `IEventRepository` interface. It intercepts queries and enforces:
- **`INTRA_COLLEGE` Isolation**: Verifies `user.collegeId === event.collegeId`.
- **Status Shielding**: Blocks non-organizer / student access to `DRAFT`, `SUBMITTED`, and `REJECTED` events.
- **Admin Governance**: Grants platform administrators unrestricted access for compliance auditing.

### Source Files
- Proxy Implementation: [`backend/src/patterns/proxy/EventAccessProxy.ts`](backend/src/patterns/proxy/EventAccessProxy.ts)
- Repository Interface: [`backend/src/repositories/EventRepository.ts`](backend/src/repositories/EventRepository.ts)

```typescript
export class EventAccessProxy implements IEventRepository {
  public async findByIdForUser(eventId: number, user?: User) {
    const event = await this.realRepository.findById(eventId);
    if (!event) return { restricted: false };

    // INTRA_COLLEGE Access Control
    if (event.eventType === 'INTRA_COLLEGE' && (!user || user.collegeId !== event.collegeId)) {
      return { restricted: true, reason: 'Access Restricted: INTRA_COLLEGE event.' };
    }
    return { event, restricted: false };
  }
}
```

---

## 4. Observer Pattern

### Problem
When an event schedule changes, an organizer posts an announcement, or a waitlisted student is auto-promoted upon cancellation, multiple notification side effects must occur without tightly coupling notification logic into the core registration service.

### Solution
`EventSubject` acts as the event publisher. Decoupled observers (`RegisteredStudentsObserver`, `OrganizerObserver`, `AdminAuditObserver`) listen for domain events (`UPDATED`, `CANCELLED`, `ANNOUNCEMENT`, `WAITLIST_PROMOTED`) and dispatch in-app and simulated email notifications.

> **Design Boundary Note**: `Observer` handles **notifications only**. The business logic of FIFO queue promotion lives strictly in `WaitlistService`.

### Source Files
- Subject & Observers: [`backend/src/patterns/observer/EventSubject.ts`](backend/src/patterns/observer/EventSubject.ts)
- Triggered by: [`backend/src/services/WaitlistService.ts`](backend/src/services/WaitlistService.ts), [`backend/src/services/EventService.ts`](backend/src/services/EventService.ts)

---

## 🔧 Infrastructure Patterns

### Singleton Pattern
- **Where**: [`backend/src/db/DatabaseManager.ts`](backend/src/db/DatabaseManager.ts), [`backend/src/patterns/observer/EventSubject.ts`](backend/src/patterns/observer/EventSubject.ts)
- **Why**: Ensures a single SQLite database connection handle and serialized operation queue across concurrent requests.

### Bridge Pattern
- **Where**: [`backend/src/patterns/bridge/NotificationBridge.ts`](backend/src/patterns/bridge/NotificationBridge.ts)
- **Why**: Decouples notification abstractions (types) from delivery platform implementations (channels).
