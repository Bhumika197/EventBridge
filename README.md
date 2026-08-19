# EventBridge – College-Integrated Inter-College Event Discovery & Registration Platform

EventBridge is a centralized, full-stack web platform for college students, organizers, and platform administrators to discover, manage, and register for campus events across multiple institutions.

> **Academic Project Note**: Designed for Software Engineering & Design Pattern evaluation, enforcing clean Object-Oriented Architecture and explicit design patterns (Singleton, Chain of Responsibility, Factory Method, Proxy, Abstract Factory, Bridge, Observer, Database Connectivity).

---

## Key Features

- **College-Integrated Event Visibility**:
  - **INTRA_COLLEGE**: Restricted strictly to students of the organizing institution. Excluded from default eligible feeds of students from other colleges.
  - **INTER_COLLEGE**: Open to students across all registered institutions, subject to eligibility criteria.
- **7-Stage Validation Chain (Chain of Responsibility)**:
  - Sequential validation when clicking REGISTER: `AuthCheckHandler` → `EventStatusHandler` → `VisibilityCheckHandler` → `CollegeEligibilityHandler` → `DeadlineCheckHandler` → `CapacityCheckHandler` → `DuplicateRegistrationHandler`.
- **Dynamic Category Factories (Factory Method & Abstract Factory)**:
  - Instantializes events and category-specific policy components (Technical, Cultural, Sports, Literary, Arts, Management, Workshops, Social/Community).
- **Access Control Proxy (Proxy Pattern)**:
  - Wraps repository queries to filter restricted intra-college events and enforce role permissions.
- **Decoupled Notifications (Bridge & Observer Patterns)**:
  - Observer notifies registered students on event changes; Bridge decouples notification types (`RegistrationConfirmation`, `EventUpdated`, `EventCancelled`, `OrganizerAnnouncement`) from delivery channels (`InAppChannel`, `EmailChannel`, `SMSChannel`).
- **Interactive Design Pattern & UML Explorer**:
  - Built-in UI tab displaying pattern problem-solution breakdowns, source file links, code snippets, and all 10 UML diagram specifications.

---

## Sample Demo Accounts

All sample passwords are: `password123` (Admin: `admin123`).

| Role | Username | College | Description |
| :--- | :--- | :--- | :--- |
| **Student** | `student_nvu` | North Valley University | Student eligible for NVU Intra & Inter events |
| **Student** | `student_git` | Greenfield Institute of Tech | Student eligible for GIT Intra & Inter events |
| **Student** | `student_cac` | City Arts College | Fine Arts Student eligible for CAC & Inter events |
| **Organizer** | `org_nvu` | North Valley University | Tech Event Organizer |
| **Organizer** | `org_git` | Greenfield Institute of Tech | Robotics & Hackathon Organizer |
| **Admin** | `admin` | Platform Wide | System Administrator (Manage colleges & users) |

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch

1. **Clone / Navigate to Project Directory**:
   ```bash
   cd EventBridge
   ```

2. **Start Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend server runs on `http://localhost:5000`.

3. **Start Frontend Client**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   The frontend application runs on `http://localhost:3000`.

---

## Design Pattern Architecture Overview

| Pattern | Implementation Class | Location | Description |
| :--- | :--- | :--- | :--- |
| **1. Singleton** | `DatabaseManager` | `backend/src/db/DatabaseManager.ts` | Encapsulates single SQLite database connection |
| **2. Chain of Responsibility** | `RegistrationValidationChain` | `backend/src/patterns/chain/` | Sequential 7-step registration validation chain |
| **3. Factory Method** | `EventFactory` | `backend/src/patterns/factory/EventFactory.ts` | Encapsulates category-specific event creation |
| **4. Proxy** | `EventAccessProxy` | `backend/src/patterns/proxy/EventAccessProxy.ts` | Enforces college-based visibility and access rules |
| **5. Abstract Factory** | `EventComponentFactory` | `backend/src/patterns/abstractFactory/` | Creates related families (Event, RegPolicy, EligPolicy) |
| **6. Bridge** | `NotificationBridge` | `backend/src/patterns/bridge/NotificationBridge.ts` | Decouples notification types from channels (InApp, Email, SMS) |
| **7. Observer** | `EventSubject` | `backend/src/patterns/observer/EventSubject.ts` | Dispatches event change alerts to registered students |
| **8. Database Connectivity** | `Repository Classes` | `backend/src/repositories/` | Decoupled Data Access Objects for database persistence |

---

## API Documentation

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration
- `GET /api/events/eligible` - Fetch user-eligible events (filtered by Proxy)
- `GET /api/events/:id` - Fetch detailed event metadata
- `POST /api/events` - Create event (Organizer only)
- `POST /api/registrations/event/:eventId` - Register student (Runs Chain of Responsibility)
- `GET /api/registrations/my-registrations` - Student's active registrations
- `POST /api/events/:id/announcement` - Broadcast organizer announcement (Observer + Bridge)
- `GET /api/patterns` - Metadata for Design Pattern & UML Explorer
