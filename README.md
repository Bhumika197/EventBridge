# EventBridge — University Event Discovery & Registration Platform

EventBridge is a full-stack web application designed to solve the fragmented event discovery and registration process across collegiate campuses. It provides institutional isolation, granular access control, registration validation, and automated FIFO waitlist management.

---

## Live Deployment & Demo

🚀 **Production Web App:** [https://event-bridge-beta.vercel.app/](https://event-bridge-beta.vercel.app/)

The application is deployed on **Vercel** with full client-side React routing and serverless backend API endpoints powered by an in-memory/disk-synchronized SQLite WASM database (`sql.js`).

---

## Demo Accounts

All demo accounts share the password: `password123` (Admin: `admin123`).

| Role | Username | Affiliation | Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `bhumika_rbu` | Ramdeobaba University (RBU) | Discover and register for RBU intra events and inter-college events |
| **Student** | `aarav_rcoem` | RCOEM Nagpur | Discover and register for RCOEM intra events and inter-college events |
| **Student** | `student1` ... `student93` | Multiple Institutions | Test waitlisting, concurrent registration, and automated queue promotions |
| **Organizer** | `org_rbu` | RBU Tech Cell | Create draft events, submit for review, broadcast announcements, view rosters |
| **Organizer** | `org_rcoem` | RCOEM Cultural Club | Manage cultural events and inspect waitlists |
| **Admin** | `admin` | Platform Wide | System governance, event moderation review desk (Approve / Reject), college registration |

---

## 🎯 The Problem Solved

In collegiate ecosystems, campus event discovery and attendance management suffer from three core issues:
1. **Scattered Information**: Announcements are scattered across WhatsApp groups, email blasts, and physical posters, causing low visibility and missed registration deadlines.
2. **Access Control Leakage**: Organizers struggle to enforce institutional boundaries (e.g. restricting an internal workshop strictly to host-college students while opening hackathons to other universities).
3. **Overbooking & Manual Waitlisting**: When high-demand events hit capacity, manual waitlist tracking leads to confusion, double registrations, and empty seats when confirmed students drop out last minute.

**EventBridge** addresses these challenges through a unified platform featuring college-based visibility isolation, a sequential 6-stage validation pipeline, and an atomic FIFO waitlist with automatic promotion upon cancellation.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │     Frontend (React)     │
                    │  Vite + TypeScript + UI │
                    └────────────┬────────────┘
                                 │ HTTP / REST
                    ┌────────────▼────────────┐
                    │   Express Controllers   │
                    │  (Req/Res, Status Codes)│
                    └────────────┬────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │           Service Layer             │
              │  EventService    RegistrationService│
              │  WaitlistService NotificationService│
              └─────────────┬───────────┬───────────┘
                            │           │
              ┌─────────────▼──┐    ┌───▼───────────┐
              │   Repositories │    │Design Patterns│
              │ (DAOs, Queries)│    │• Factory      │
              └─────────────┬──┘    │• Chain of Resp│
                            │       │• Proxy        │
                            │       │• Observer     │
                            │       └───────────────┘
              ┌─────────────▼───────────┐
              │     Database Layer      │
              │ SQLite (Atomic / WASM)  │
              └─────────────────────────┘
```

<div align="center">
  <img src="docs/system_architecture.jpg" alt="EventBridge Complete System Architecture Diagram" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); margin: 20px 0;" />
</div>

---

## Core Features & Workflows

### 1. Waitlist & Automatic FIFO Promotion 
When an event reaches capacity limit (`currentRegistrations >= capacity`):
- Additional registrants are automatically placed on a FIFO waitlist (`status = 'WAITLISTED'`) and assigned a real-time queue position (`queuePosition = 1, 2, 3...`).
- When a confirmed attendee cancels their registration, `WaitlistService` immediately and atomically promotes the student at the front of the queue (`queuePosition = 1`) to `CONFIRMED`.
- The `Observer Pattern` dispatches high-priority in-app and simulated email notifications to the promoted student.
- Remaining waitlisted candidates have their queue positions shifted forward automatically.

```mermaid
sequenceDiagram
    autonumber
    actor Student A as Confirmed Student
    actor Student B as Waitlisted Student (#1)
    participant RS as RegistrationService
    participant WS as WaitlistService
    participant DB as SQLite DB
    participant Obs as EventSubject (Observer)

    Student A->>RS: cancelRegistration(regId)
    RS->>DB: UPDATE REGISTRATION SET status = 'CANCELLED'
    RS->>DB: UPDATE EVENT SET currentRegistrations = currentRegistrations - 1
    RS->>WS: promoteNextInQueue(eventId)
    WS->>DB: SELECT * FROM REGISTRATION WHERE status = 'WAITLISTED' ORDER BY queuePosition LIMIT 1
    WS->>DB: UPDATE REGISTRATION SET status = 'CONFIRMED', queuePosition = NULL
    WS->>DB: UPDATE EVENT SET currentRegistrations = currentRegistrations + 1
    WS->>DB: UPDATE REGISTRATION SET queuePosition = queuePosition - 1 WHERE status = 'WAITLISTED'
    WS->>Obs: notifyObservers(event, 'WAITLIST_PROMOTED', studentId=B)
    Obs-->>Student B: In-App & Email Alert ("Spot Confirmed for Event!")
    RS-->>Student A: Cancellation Confirmed (Auto-Promoted Next Student)
```

---

### 2. Event Lifecycle & Administrative Review State Machine
Events follow a disciplined lifecycle with moderation governance:

```text
DRAFT ──────────────► SUBMITTED ──────────────► APPROVED ──────────────► PUBLISHED ──────────────► COMPLETED / CANCELLED
                            ▲                         │
                            │                         ▼
                            └─── Organizer Edits ◄── REJECTED (with rejectionReason)
```

- **Organizer Drafts**: Organizers create events in `DRAFT` status and can refine schedules and venue requirements before submitting.
- **Moderation Desk**: Platform Admins review `SUBMITTED` events. Admins can either Approve (instantly publishes to the live feed) or Reject with specific feedback (`rejectionReason`).
- **Resubmission Flow**: If rejected, organizers view admin feedback on their dashboard, update the event details, and re-submit for review.

---

### 3. 6-Stage Registration Validation Chain (Chain of Responsibility)
When a student attempts registration, the request traverses 6 sequential handlers. If any check fails, the pipeline halts immediately and returns a user-friendly explanation:

```text
1. AuthCheckHandler         ──► Verifies valid student JWT and STUDENT role
           │ Pass
2. EventStatusHandler       ──► Ensures event is in PUBLISHED state
           │ Pass
3. VisibilityCheckHandler   ──► Blocks students from other colleges if INTRA_COLLEGE
           │ Pass
4. CollegeEligibilityHandler──► Enforces institutional affiliation requirements
           │ Pass
5. DeadlineCheckHandler     ──► Validates current timestamp against registrationDeadline
           │ Pass
6. DuplicateRegistration    ──► Prevents double-registration (returns HTTP 409)
           │ Pass
     Atomic Capacity & Waitlist Router
```

---

### 4. College-Based Access Control & Event Visibility (Proxy Pattern)
The `EventAccessProxy` intercepts all data-layer repository queries:
- **`INTRA_COLLEGE` Events**: Visible strictly to enrolled students of the host institution and platform admins. Hidden from external students and unauthenticated guests.
- **`INTER_COLLEGE` Events**: Visible to all verified students across participating colleges.
- **Draft Shielding**: `DRAFT`, `SUBMITTED`, and `REJECTED` events are shielded from students and only accessible by the creating organizer and platform admins.

---

## 🏛️ Design Patterns Architecture & Feature Mapping

EventBridge is engineered around classic Gang of Four (GoF) object-oriented design patterns and the Model-View-Controller (MVC) architecture. Every pattern directly powers a tangible, visible platform feature:

| Pattern Name | Category | Primary Source File(s) | UML Diagram Reference | Core Feature Powered |
| :--- | :--- | :--- | :--- | :--- |
| **Builder** | Creational | [`backend/src/patterns/builder/EventBuilder.ts`](file:///backend/src/patterns/builder/EventBuilder.ts)<br/>[`frontend/src/components/CreateEventWizardModal.tsx`](file:///frontend/src/components/CreateEventWizardModal.tsx) | Class & Sequence Diagram #11 | **"Create Event" Multi-Step Wizard**: Chained assembly of required fields (title, date, college) and optional fields (prize pool, team sizing, speakers, sponsors, inter-college flag) with atomic validation in `build()`. |
| **Prototype** | Creational | [`backend/src/patterns/prototype/EventPrototype.ts`](file:///backend/src/patterns/prototype/EventPrototype.ts)<br/>[`frontend/src/components/DuplicateEventModal.tsx`](file:///frontend/src/components/DuplicateEventModal.tsx) | Class & Sequence Diagram #12 | **"Duplicate Event" (Clone) Button**: Clones recurring annual college fests with true deep-copying of arrays (`speakers`, `sponsors`), status reset to `DRAFT`, and custom date/venue overrides. |
| **Factory Method** | Creational | [`backend/src/patterns/factory/EventFactory.ts`](file:///backend/src/patterns/factory/EventFactory.ts) | Class Diagram #2 | **Category Domain Configuration**: Automatically configures category-specific eligibility guidelines, laptop rules, and athletic requirements. |
| **Abstract Factory** | Creational | [`backend/src/patterns/abstractFactory/EventComponentFactory.ts`](file:///backend/src/patterns/abstractFactory/EventComponentFactory.ts) | Component Diagram #9 | **Cohesive Component Families**: Creates matched product families (Event Data, Registration Policies, Eligibility Rules) per department. |
| **Singleton** | Creational | [`backend/src/db/DatabaseManager.ts`](file:///backend/src/db/DatabaseManager.ts)<br/>[`backend/src/patterns/observer/EventSubject.ts`](file:///backend/src/patterns/observer/EventSubject.ts) | Class Diagram #2 | **Database & Event Bus Instance**: Guarantees a single shared connection and serialized transaction lock for the SQLite WASM database. |
| **Proxy** | Structural | [`backend/src/patterns/proxy/EventAccessProxy.ts`](file:///backend/src/patterns/proxy/EventAccessProxy.ts) | Sequence Diagram #4 | **College-Based Access Control**: Enforces institutional isolation (`INTRA_COLLEGE` vs `INTER_COLLEGE`) and shields unapproved drafts at repository boundaries. |
| **Bridge** | Structural | [`backend/src/patterns/bridge/NotificationBridge.ts`](file:///backend/src/patterns/bridge/NotificationBridge.ts) | Class Diagram #2 | **Multi-Channel Alert Dispatch**: Decouples notification abstractions (Confirmations, Updates, Cancellations) from delivery channels (In-App, Email, SMS). |
| **Chain of Responsibility** | Behavioral | [`backend/src/patterns/chain/RegistrationValidationChain.ts`](file:///backend/src/patterns/chain/RegistrationValidationChain.ts) | Sequence Diagram #5 & Activity Diagram #7 | **6-Stage Registration Validation Pipeline**: Traverses sequential handlers (Auth, Status, Visibility, Eligibility, Deadline, Capacity, Duplicate) with early abortion and human-friendly reasons. |
| **Mediator** | Behavioral | [`backend/src/patterns/mediator/RegistrationMediator.ts`](file:///backend/src/patterns/mediator/RegistrationMediator.ts) | Sequence Diagram #13 | **Decoupled Registration Workflow**: `EventCoordinator` coordinates Seat Check, Fee Payment, Confirmation Email, and Live Dashboard Refresh without any direct coupling between modules. |
| **Template Method** | Behavioral | [`backend/src/patterns/template/EventWorkflow.ts`](file:///backend/src/patterns/template/EventWorkflow.ts) | Sequence Diagram #14 | **Event Lifecycle Automation**: `EventWorkflow.run()` skeleton sequence (`validate` → `setupRegistration` → `publish` → `executeEvent` → `close` → `report`) customized by `HackathonWorkflow` and `CulturalFestWorkflow`. |
| **Strategy** | Behavioral | [`backend/src/patterns/strategy/FeeStrategy.ts`](file:///backend/src/patterns/strategy/FeeStrategy.ts) | Sequence Diagram #15 | **Dynamic Pricing & Fee Calculation**: `FeeCalculatorContext` selects runtime strategies: `FreeStrategy`, `EarlyBirdStrategy`, `InterCollegeFeeStrategy`, `GroupDiscountStrategy`, and `StudentIdDiscountStrategy`. |
| **Memento** | Behavioral | [`backend/src/patterns/memento/EventMemento.ts`](file:///backend/src/patterns/memento/EventMemento.ts)<br/>[`frontend/src/components/EventVersionModal.tsx`](file:///frontend/src/components/EventVersionModal.tsx) | Sequence Diagram #16 | **"Undo Last Edit" & Version History**: Restores previous event states using immutable `EventMemento` snapshots managed by `EventHistoryCaretaker`, specifically protecting against accidental deadline shifts. |
| **Observer** | Behavioral | [`backend/src/patterns/observer/EventSubject.ts`](file:///backend/src/patterns/observer/EventSubject.ts) | Sequence Diagram #6 | **Decoupled Notification Broadcast**: Broadcasts event updates and automated waitlist promotions to `RegisteredStudentsObserver`, `OrganizerObserver`, and `AdminAuditObserver`. |
| **MVC** | Architectural | `backend/src/` (Models & Controllers)<br/>`frontend/src/` (Views & Components) | MVC Diagram #17 | **Model-View-Controller App Architecture**: Clean separation where Views never touch raw SQL, Models never touch the DOM, and Express Controllers orchestrate REST transactions. |

---

### Where Each Pattern Fits (Deep Dive)

#### 1. Builder + Prototype: Event Creation (Organizer Side)
- **"Create Event" Wizard (`EventBuilder`)**: Organizers create events using a multi-step guided wizard. Required fields are `title`, `date`, and `college`. Optional fields include `prizePool`, `minTeamSize`/`maxTeamSize`, `speakers`, `sponsors`, and `isInterCollege`. Chained steps assemble the event and validate all constraints in `build()` before persistence.
- **"Duplicate Event" Button (`EventPrototype`)**: Colleges rerun the same annual symposiums and fests. The clone button produces a clean deep-copy of the event where array properties like `speakers` and `sponsors` are fully cloned to prevent memory reference leaks. The organizer quickly sets the new year's date and venue while draft status resets to `DRAFT`.

#### 2. Mediator + Template Method: Registration and Event Lifecycle
- **Registration Flow (`EventCoordinator`)**: When a student clicks register, the `EventCoordinator` mediator triggers four isolated colleagues in order:
  1. `SeatColleague`: Verifies capacity and allocates seat or waitlist spot.
  2. `PaymentColleague`: Deducts/clears the calculated registration fee.
  3. `NotificationColleague`: Sends official confirmation email with ticket details.
  4. `DashboardColleague`: Increments the organizer's live attendee dashboard roster.
  *None of these colleagues communicate directly; all requests flow through the mediator.*
- **Event Publishing Workflow (`EventWorkflow`)**: The abstract `EventWorkflow.run()` template method enforces the invariant lifecycle: `validate()` → `setupRegistration()` → `publish()` → `executeEvent()` → `close()` → `generateReport()`. Specialized subclasses override only the steps that differ:
  - `HackathonWorkflow`: Enforces GitHub repository links, team formations, and judge rubric setup.
  - `CulturalFestWorkflow`: Enforces solo/group performance slots, stage acoustics, and ticketing gates.

#### 3. Strategy + Memento: Fees and Edit History
- **Fee Calculation (`PricingStrategy`)**: Rather than nested conditional statements, the fee engine uses interchangeable pricing strategies resolved at runtime based on event settings:
  - `FreeStrategy`: Zero-cost entry for open campus workshops.
  - `EarlyBirdStrategy`: 25% discount for early registrants.
  - `InterCollegeFeeStrategy`: Flat institutional surcharge for external guests.
  - `GroupDiscountStrategy`: 20% discount for hackathon teams of 3 or more.
  - `StudentIdDiscountStrategy`: 15% discount for verified student cardholders.
- **Undo for Event Edits (`EventMemento`)**: Organizers frequently tweak schedules, venue locations, and registration cutoffs. Accidental deadline shifts can lock students out prematurely. Prior to committing any update, an immutable `EventMemento` snapshot is pushed onto the `EventHistoryCaretaker` stack and saved to SQLite `EVENT_MEMENTO`. An **"Undo"** button pops the last snapshot and immediately restores the prior state.

#### 4. MVC Architecture & Pattern Explorer
- **Strict Separation of Concerns**:
  - `models/`: Database schemas, DAOs (`EventRepository`, `MementoRepository`), and `DatabaseManager`.
  - `views/`: React components and pages (`EventCard`, `OrganizerDashboard`, `StudentDashboard`).
  - `controllers/`: Express handlers (`EventController`, `RegistrationController`, `AuthController`) and frontend `api.ts` service client.
- **Pattern Demo Explorer**: The sidebar includes the Design Pattern Explorer with a live interactive sandbox for each pattern (`BuilderDemo`, `PrototypeDemo`, `MediatorDemo`, `TemplateMethodDemo`, `StrategyDemo`, `MementoDemo`, `MVCDemo`), allowing users to run live simulations and view data flow in real time.

---

## ⚡ Technical Challenges & Solutions

### 1. Preventing Race Conditions in Concurrent Registrations & Waitlist Promotion
- **Problem**: When an event has 1 remaining seat (`99/100`) and two concurrent registration requests arrive simultaneously, a naive check-then-insert pattern could result in overbooking (`101/100`).
- **Solution**: SQLite operations serialize through an asynchronous promise queue and transaction lock in `DatabaseManager`. All capacity checks and waitlist queue insertions execute within atomic transactions.

### 2. Derived Registration Status
- **Problem**: Storing a boolean `isRegistrationOpen` flag in the database creates stale data when registration deadlines expire without a background worker actively mutating the table.
- **Solution**: `isRegistrationOpen` is dynamically derived at the service layer:
  $$\text{isRegistrationOpen} = (\text{status} = \text{'PUBLISHED'}) \land (\text{now} \ge \text{registrationStartTime}) \land (\text{now} \le \text{registrationDeadline})$$

### 3. Serverless SQLite WASM Persistence
- **Problem**: Running SQLite on serverless platforms (like Vercel) lacks native file persistence.
- **Solution**: `DatabaseManager` loads `sql.js` WASM binaries dynamically with in-memory execution and writes snapshots to `/tmp/eventbridge.db` on disk updates.

---

## 🧪 Automated Test Suite

EventBridge includes 6 modular, independent test suites in `backend/tests/`:

```text
backend/tests/
├── event.test.ts          # Event creation, category defaults, validation
├── lifecycle.test.ts      # Draft -> Submitted -> Approved/Rejected -> Published flow
├── authorization.test.ts  # Proxy isolation & RBAC enforcement
├── registration.test.ts   # Validation chain, duplicate prevention, deadline checks
├── waitlist.test.ts       # Capacity limits, waitlist queuing, and cancellation auto-promotion
└── newPatterns.test.ts    # Builder, Prototype, Mediator, Template, Strategy, Memento verification
```

### Running Tests Locally:

```bash
cd backend
npm test
```

### Test Suite Execution Output:
```text
====================================================
🚀 EVENTBRIDGE AUTOMATED TEST RUNNER
====================================================

[INFO] Starting EventBridge Database Seeding...
[INFO] Database seeding completed successfully.

🧪 Running Suite: Event Factory & Creation Tests...
✅ Event Factory & Creation Tests Passed!

🧪 Running Suite: Event Lifecycle & Approval State Machine Tests...
✅ Event Lifecycle & Approval State Machine Tests Passed!

🧪 Running Suite: Proxy Pattern & College Isolation Authorization Tests...
✅ Proxy Pattern & College Isolation Authorization Tests Passed!

🧪 Running Suite: Registration Validation Chain & Duplicate Protection Tests...
✅ Registration Validation Chain & Duplicate Protection Tests Passed!

🧪 Running Suite: Waitlist Management & Auto-Promotion Tests...
✅ Waitlist Management & Auto-Promotion Tests Passed!

🧪 Running Suite: Advanced Gang of Four Patterns (Builder, Prototype, Mediator, Template, Strategy, Memento)...
✅ Builder Pattern: Required fields validated, optional fields assembled, build() enforced
✅ Prototype Pattern: Deep cloning created isolated copy, array mutation protected
✅ Mediator Pattern: EventCoordinator successfully coordinated 4 colleagues
✅ Template Method: HackathonWorkflow and CulturalFestWorkflow executed skeleton algorithms
✅ Strategy Pattern: FeeCalculatorContext dynamically evaluated all 5 pricing strategies
✅ Memento Pattern: State snapshot captured, pushed, popped, and restored accurately
✅ Advanced Gang of Four Patterns Passed!

====================================================
🎉 ALL 6 TEST SUITES PASSED SUCCESSFULLY (100% GREEN)
====================================================
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install
```bash
git clone https://github.com/Bhumika197/EventBridge.git
cd EventBridge
npm run install:all    # Installs root, backend, and frontend dependencies
```

### 2. Launch (One Command)
```bash
npm start              # Or 'npm run dev' — starts backend (:5000) & frontend (:3000) together
```

> **Optional Individual Commands:**
> - `npm run dev:backend` — Run only backend server (`http://localhost:5000`)
> - `npm run dev:frontend` — Run only Vite frontend (`http://localhost:3000`)
> - `npm run seed` — Re-seed the database
> - `npm test` — Run backend design pattern and registration test suite

---

## 📡 REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates user and returns JWT token |
| `/api/auth/register` | `POST` | Public | Student account registration with institutional domain check |
| `/api/auth/me` | `GET` | Authenticated | Fetches current user profile and role |
| `/api/events` | `GET` | Public / Auth | Returns paginated events with search and category filters |
| `/api/events/eligible` | `GET` | Public / Auth | Returns events filtered by user eligibility via `EventAccessProxy` |
| `/api/events/pending-reviews` | `GET` | Platform Admin | Fetches submitted events awaiting moderation |
| `/api/events` | `POST` | Organizer / Admin | Creates a new event (defaults to `DRAFT`) |
| `/api/events/:id/submit` | `POST` | Organizer | Submits draft or rejected event for admin review |
| `/api/events/:id/review` | `POST` | Platform Admin | Approves (`PUBLISHED`) or Rejects (with reason) an event |
| `/api/events/:id/cancel` | `POST` | Organizer / Admin | Cancels an event and notifies registered students |
| `/api/registrations/event/:id` | `POST` | Student | Registers for event or joins waitlist if capacity is reached |
| `/api/registrations/:id` | `DELETE` | Student | Cancels registration and triggers auto-promotion of next waitlisted student |
| `/api/registrations/my-registrations` | `GET` | Student | Returns student's confirmed and waitlisted events |
| `/api/registrations/notifications` | `GET` | Authenticated | Returns in-app notifications and announcements |
| `/api/admin/stats` | `GET` | Platform Admin | Returns platform metrics and enrollment statistics |

---

## 🔮 Future Improvements

- **QR Code Attendance Verification**: Generate dynamic cryptographic QR codes for fast mobile check-ins at event entrances.
- **Webhook Integrations**: Enable organizers to receive instant Discord/Slack notifications when event registrations hit milestones.
- **Team / Group Registrations**: Support multi-student hackathon and sports squad registrations under a single team captain.
