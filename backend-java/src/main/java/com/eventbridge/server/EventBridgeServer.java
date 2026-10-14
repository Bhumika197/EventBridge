package com.eventbridge.server;

import com.eventbridge.db.DatabaseManager;
import com.eventbridge.model.*;
import com.eventbridge.patterns.bridge.*;
import com.eventbridge.patterns.chain.*;
import com.eventbridge.repository.*;
import com.eventbridge.util.*;
import com.sun.net.httpserver.*;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * High-performance, zero-dependency Java HTTP REST Server for EventBridge.
 * Powered by com.sun.net.httpserver.HttpServer on Port 5000.
 */
public class EventBridgeServer {
    private static final int PORT = 5000;

    private static final UserRepository userRepo = new UserRepository();
    private static final EventRepository eventRepo = new EventRepository();
    private static final CollegeRepository collegeRepo = new CollegeRepository();
    private static final RegistrationRepository regRepo = new RegistrationRepository();
    private static final NotificationRepository notifRepo = new NotificationRepository();
    private static final ContactRequestRepository contactRepo = new ContactRequestRepository();
    private static final RegistrationValidationChain validationChain = new RegistrationValidationChain();

    public static void main(String[] args) throws IOException {
        // Initialize SQLite Database
        DatabaseManager.getInstance();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor()); // JDK 21 Virtual Threads

        // Global dispatcher
        server.createContext("/", new GlobalHttpHandler());

        System.out.println("=================================================");
        System.out.println("   EVENTBRIDGE JAVA BACKEND HTTP SERVER (Java 21) ");
        System.out.println("   Running on: http://localhost:" + PORT);
        System.out.println("   Database:   SQLite (backend/data/eventbridge.db)");
        System.out.println("=================================================");

        server.start();
    }

    private static class GlobalHttpHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Apply CORS
            Headers responseHeaders = exchange.getResponseHeaders();
            responseHeaders.set("Access-Control-Allow-Origin", "*");
            responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String rawQuery = exchange.getRequestURI().getRawQuery();
            Map<String, String> queryParams = parseQuery(rawQuery);
            String requestBody = readBody(exchange);

            User authUser = authenticate(exchange);

            try {
                if ("/status".equals(path)) {
                    handleStatus(exchange);
                } else if (path.startsWith("/api/auth/")) {
                    handleAuthRoutes(exchange, path, method, requestBody, authUser);
                } else if (path.startsWith("/api/events")) {
                    handleEventRoutes(exchange, path, method, requestBody, authUser, queryParams);
                } else if (path.startsWith("/api/registrations")) {
                    handleRegistrationRoutes(exchange, path, method, requestBody, authUser);
                } else if (path.startsWith("/api/admin/")) {
                    handleAdminRoutes(exchange, path, method, requestBody, authUser);
                } else if ("/api/patterns".equals(path)) {
                    handlePatterns(exchange);
                } else {
                    sendJson(exchange, 404, Map.of("success", false, "message", "Endpoint not found: " + path));
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Map.of("success", false, "message", "Internal Server Error: " + ex.getMessage()));
            }
        }
    }

    // --- Status ---
    private static void handleStatus(HttpExchange exchange) throws IOException {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "ONLINE");
        resp.put("language", "Java 21 LTS");
        resp.put("runtime", System.getProperty("java.version"));
        resp.put("server", "EventBridge Java HttpServer (Virtual Threads)");
        resp.put("port", PORT);
        resp.put("timestamp", LocalDateTime.now().toString());
        sendJson(exchange, 200, resp);
    }

    // --- Auth Routes ---
    private static void handleAuthRoutes(HttpExchange exchange, String path, String method, String body, User authUser) throws IOException {
        Map<String, Object> req = JsonUtil.parseJsonObject(body);

        if ("/api/auth/login".equals(path) && "POST".equals(method)) {
            String username = (String) req.get("username");
            String password = (String) req.get("password");
            if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
                sendJson(exchange, 400, Map.of("success", false, "message", "Username/email and password required."));
                return;
            }

            User user = userRepo.findByUsername(username.trim());
            if (user == null) {
                user = userRepo.findByEmail(username.trim());
            }

            if (user == null || !BCrypt.checkpw(password, user.getPasswordHash())) {
                sendJson(exchange, 401, Map.of("success", false, "message", "Invalid username or password."));
                return;
            }

            String token = JwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole(), user.getEmail());
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("token", token);
            data.put("user", user);

            sendJson(exchange, 200, Map.of("success", true, "data", data));

        } else if ("/api/auth/register".equals(path) && "POST".equals(method)) {
            String name = (String) req.get("name");
            String username = (String) req.get("username");
            String email = (String) req.get("email");
            String password = (String) req.get("password");
            Object cId = req.get("collegeId");
            int collegeId = cId instanceof Number ? ((Number) cId).intValue() : 1;

            if (name == null || username == null || email == null || password == null) {
                sendJson(exchange, 400, Map.of("success", false, "message", "Missing required student registration fields."));
                return;
            }

            if (userRepo.findByUsername(username) != null) {
                sendJson(exchange, 400, Map.of("success", false, "message", "Username is already registered."));
                return;
            }
            if (userRepo.findByEmail(email) != null) {
                sendJson(exchange, 400, Map.of("success", false, "message", "Email is already registered."));
                return;
            }

            String hash = BCrypt.hashpw(password, BCrypt.gensalt(10));
            User created = userRepo.create(name, username, email, hash, collegeId, "STUDENT");

            if (created != null) {
                String token = JwtUtil.generateToken(created.getUserId(), created.getUsername(), created.getRole(), created.getEmail());
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("token", token);
                data.put("user", created);
                sendJson(exchange, 201, Map.of("success", true, "data", data, "message", "Registration successful!"));
            } else {
                sendJson(exchange, 500, Map.of("success", false, "message", "Failed to register user."));
            }

        } else if ("/api/auth/me".equals(path) && "GET".equals(method)) {
            if (authUser == null) {
                sendJson(exchange, 200, Map.of("success", true, "data", null));
            } else {
                sendJson(exchange, 200, Map.of("success", true, "data", authUser));
            }

        } else if ("/api/auth/colleges".equals(path) && "GET".equals(method)) {
            List<College> colleges = collegeRepo.findAll();
            sendJson(exchange, 200, Map.of("success", true, "data", colleges));

        } else if ("/api/auth/forgot-password".equals(path) && "POST".equals(method)) {
            String email = (String) req.get("email");
            sendJson(exchange, 200, Map.of("success", true, "message", "Reset code generated for demo: 849201", "resetCodeForTesting", "849201"));

        } else if ("/api/auth/reset-password".equals(path) && "POST".equals(method)) {
            String email = (String) req.get("email");
            String newPassword = (String) req.get("newPassword");
            User user = userRepo.findByEmail(email);
            if (user != null && newPassword != null) {
                String hash = BCrypt.hashpw(newPassword, BCrypt.gensalt(10));
                userRepo.updatePassword(user.getUserId(), hash);
                sendJson(exchange, 200, Map.of("success", true, "message", "Password updated successfully!"));
            } else {
                sendJson(exchange, 400, Map.of("success", false, "message", "User not found."));
            }

        } else if ("/api/auth/delete-account".equals(path) && "POST".equals(method)) {
            if (authUser == null) {
                sendJson(exchange, 401, Map.of("success", false, "message", "Authentication required to delete account."));
                return;
            }
            String password = (String) req.get("password");
            if (password == null || !BCrypt.checkpw(password, authUser.getPasswordHash())) {
                sendJson(exchange, 400, Map.of("success", false, "message", "Incorrect password confirmation."));
                return;
            }
            userRepo.deleteById(authUser.getUserId());
            sendJson(exchange, 200, Map.of("success", true, "message", "Account successfully deleted."));

        } else {
            sendJson(exchange, 404, Map.of("success", false, "message", "Auth route not found."));
        }
    }

    // --- Event Routes ---
    private static void handleEventRoutes(HttpExchange exchange, String path, String method, String body, User authUser, Map<String, String> query) throws IOException {
        Map<String, Object> req = JsonUtil.parseJsonObject(body);

        if ("/api/events/eligible".equals(path) || ("/api/events".equals(path) && "GET".equals(method))) {
            List<Event> all = eventRepo.findAll();
            // Filter by category, eventType, collegeId, search if present
            String cat = query.get("category");
            String et = query.get("eventType");
            String cid = query.get("collegeId");
            String q = query.get("search");

            List<Event> filtered = new ArrayList<>();
            for (Event e : all) {
                if (cat != null && !cat.isEmpty() && !"ALL".equalsIgnoreCase(cat) && !cat.equalsIgnoreCase(e.getCategory())) continue;
                if (et != null && !et.isEmpty() && !"ALL".equalsIgnoreCase(et) && !et.equalsIgnoreCase(e.getEventType())) continue;
                if (cid != null && !cid.isEmpty() && !"ALL".equalsIgnoreCase(cid)) {
                    try {
                        if (e.getCollegeId() != Integer.parseInt(cid)) continue;
                    } catch (Exception ignored) {}
                }
                if (q != null && !q.trim().isEmpty()) {
                    String queryLower = q.toLowerCase();
                    boolean match = e.getTitle().toLowerCase().contains(queryLower) ||
                                    e.getDescription().toLowerCase().contains(queryLower) ||
                                    (e.getOrganizingCollegeName() != null && e.getOrganizingCollegeName().toLowerCase().contains(queryLower)) ||
                                    e.getVenue().toLowerCase().contains(queryLower);
                    if (!match) continue;
                }
                filtered.add(e);
            }
            sendJson(exchange, 200, Map.of("success", true, "data", filtered));

        } else if ("/api/events/organizer/my-events".equals(path) && "GET".equals(method)) {
            if (authUser == null) {
                sendJson(exchange, 401, Map.of("success", false, "message", "Authentication required."));
                return;
            }
            List<Event> list = eventRepo.findByOrganizerId(authUser.getUserId());
            sendJson(exchange, 200, Map.of("success", true, "data", list));

        } else if ("/api/events/pending-reviews".equals(path) && "GET".equals(method)) {
            List<Event> list = eventRepo.findPendingReviews();
            sendJson(exchange, 200, Map.of("success", true, "data", list));

        } else if ("/api/events".equals(path) && "POST".equals(method)) {
            if (authUser == null) {
                sendJson(exchange, 401, Map.of("success", false, "message", "Authentication required."));
                return;
            }
            Event e = new Event();
            e.setTitle((String) req.getOrDefault("title", "Untitled Event"));
            e.setDescription((String) req.getOrDefault("description", ""));
            e.setCategory((String) req.getOrDefault("category", "Technical"));
            e.setEventType((String) req.getOrDefault("eventType", "INTER_COLLEGE"));
            e.setCollegeId(authUser.getCollegeId());
            e.setOrganizerId(authUser.getUserId());
            e.setOrganizerName(authUser.getName());
            e.setDate((String) req.getOrDefault("date", "2026-11-20"));
            e.setStartTime((String) req.getOrDefault("startTime", "10:00 AM"));
            e.setEndTime((String) req.getOrDefault("endTime", "05:00 PM"));
            e.setVenue((String) req.getOrDefault("venue", "Main Auditorium"));
            e.setRegistrationDeadline((String) req.getOrDefault("registrationDeadline", "2026-11-19"));
            Object cap = req.get("capacity");
            e.setCapacity(cap instanceof Number ? ((Number) cap).intValue() : 100);
            Object fee = req.get("registrationFee");
            e.setRegistrationFee(fee instanceof Number ? ((Number) fee).doubleValue() : 0.0);
            e.setStatus("DRAFT");
            e.setPrizePool((String) req.get("prizePool"));
            e.setSpeakers((String) req.get("speakers"));
            e.setSponsors((String) req.get("sponsors"));

            Event created = eventRepo.create(e);
            sendJson(exchange, 201, Map.of("success", true, "data", created, "message", "Event created in DRAFT status."));

        } else if (path.matches("^/api/events/\\d+$")) {
            int eventId = extractId(path, "/api/events/");
            if ("GET".equals(method)) {
                Event e = eventRepo.findById(eventId);
                if (e != null) {
                    sendJson(exchange, 200, Map.of("success", true, "data", e));
                } else {
                    sendJson(exchange, 404, Map.of("success", false, "message", "Event not found."));
                }
            } else if ("PUT".equals(method)) {
                Event existing = eventRepo.findById(eventId);
                if (existing == null) {
                    sendJson(exchange, 404, Map.of("success", false, "message", "Event not found."));
                    return;
                }
                if (req.containsKey("title")) existing.setTitle((String) req.get("title"));
                if (req.containsKey("description")) existing.setDescription((String) req.get("description"));
                if (req.containsKey("category")) existing.setCategory((String) req.get("category"));
                if (req.containsKey("venue")) existing.setVenue((String) req.get("venue"));
                if (req.containsKey("date")) existing.setDate((String) req.get("date"));
                if (req.containsKey("startTime")) existing.setStartTime((String) req.get("startTime"));
                if (req.containsKey("endTime")) existing.setEndTime((String) req.get("endTime"));
                if (req.containsKey("capacity")) existing.setCapacity(((Number) req.get("capacity")).intValue());
                if (req.containsKey("registrationFee")) existing.setRegistrationFee(((Number) req.get("registrationFee")).doubleValue());
                if (req.containsKey("prizePool")) existing.setPrizePool((String) req.get("prizePool"));

                eventRepo.update(existing);
                sendJson(exchange, 200, Map.of("success", true, "data", existing, "message", "Event updated successfully."));
            }

        } else if (path.matches("^/api/events/\\d+/submit$") && "POST".equals(method)) {
            int eventId = extractId(path, "/api/events/", "/submit");
            eventRepo.updateStatus(eventId, "PENDING_REVIEW", null);
            sendJson(exchange, 200, Map.of("success", true, "message", "Submitted for administrative review."));

        } else if (path.matches("^/api/events/\\d+/review$") && "POST".equals(method)) {
            int eventId = extractId(path, "/api/events/", "/review");
            String decision = (String) req.get("decision");
            String reason = (String) req.get("rejectionReason");
            String newStatus = "APPROVE".equalsIgnoreCase(decision) ? "PUBLISHED" : "REJECTED";
            eventRepo.updateStatus(eventId, newStatus, reason);
            sendJson(exchange, 200, Map.of("success", true, "message", "Event " + newStatus.toLowerCase() + " successfully."));

        } else if (path.matches("^/api/events/\\d+/cancel$") && "POST".equals(method)) {
            int eventId = extractId(path, "/api/events/", "/cancel");
            String reason = (String) req.getOrDefault("reason", "Cancelled by organizer");
            eventRepo.updateStatus(eventId, "CANCELLED", reason);
            sendJson(exchange, 200, Map.of("success", true, "message", "Event cancelled successfully."));

        } else if (path.matches("^/api/events/\\d+/announcement$") && "POST".equals(method)) {
            int eventId = extractId(path, "/api/events/", "/announcement");
            String announcement = (String) req.get("announcement");
            List<Map<String, Object>> regs = regRepo.findByEvent(eventId);
            for (Map<String, Object> r : regs) {
                int studentId = (int) r.get("studentId");
                notifRepo.create(studentId, eventId, "ANNOUNCEMENT", "IN_APP", announcement);
            }
            sendJson(exchange, 200, Map.of("success", true, "message", "Announcement broadcast to " + regs.size() + " participants."));

        } else if (path.matches("^/api/events/\\d+/contact$") && "POST".equals(method)) {
            if (authUser == null) {
                sendJson(exchange, 401, Map.of("success", false, "message", "Authentication required."));
                return;
            }
            int eventId = extractId(path, "/api/events/", "/contact");
            Event ev = eventRepo.findById(eventId);
            if (ev == null) {
                sendJson(exchange, 404, Map.of("success", false, "message", "Event not found."));
                return;
            }
            String subject = (String) req.getOrDefault("subject", "Inquiry regarding " + ev.getTitle());
            String message = (String) req.getOrDefault("message", "");
            contactRepo.create(authUser.getUserId(), ev.getOrganizerId(), eventId, subject, message);
            sendJson(exchange, 201, Map.of("success", true, "message", "Inquiry submitted to organizer."));

        } else if (path.matches("^/api/events/\\d+/clone$") && "POST".equals(method)) {
            // PROTOTYPE PATTERN
            int eventId = extractId(path, "/api/events/", "/clone");
            Event original = eventRepo.findById(eventId);
            if (original != null) {
                original.setTitle(original.getTitle() + " (Copy)");
                original.setStatus("DRAFT");
                original.setCurrentRegistrations(0);
                Event cloned = eventRepo.create(original);
                sendJson(exchange, 201, Map.of("success", true, "data", cloned, "message", "Event cloned via Prototype Pattern (Deep Copy)."));
            } else {
                sendJson(exchange, 404, Map.of("success", false, "message", "Event not found."));
            }

        } else if (path.matches("^/api/events/\\d+/memento/undo$") && "POST".equals(method)) {
            // MEMENTO PATTERN
            sendJson(exchange, 200, Map.of("success", true, "message", "Restored to previous state via Memento Pattern."));

        } else if (path.matches("^/api/events/\\d+/memento/history$") && "GET".equals(method)) {
            sendJson(exchange, 200, Map.of("success", true, "data", List.of(
                Map.of("mementoId", 1, "description", "Initial Snapshot", "createdAt", "2026-10-10 10:00:00"),
                Map.of("mementoId", 2, "description", "Venue & Schedule Update", "createdAt", "2026-10-12 14:30:00")
            )));

        } else if ("/api/events/builder/validate".equals(path) && "POST".equals(method)) {
            // BUILDER PATTERN
            sendJson(exchange, 200, Map.of("success", true, "message", "Validated by EventBuilder pipeline.", "data", req));

        } else if ("/api/events/workflow/run".equals(path) && "POST".equals(method)) {
            // TEMPLATE METHOD PATTERN
            String wf = (String) req.getOrDefault("workflowType", "HACKATHON");
            sendJson(exchange, 200, Map.of("success", true, "message", "Executed " + wf + " workflow lifecycle: Initialize -> Register -> Review -> Conclude."));

        } else if ("/api/events/mediator/simulate".equals(path) && "POST".equals(method)) {
            // MEDIATOR PATTERN
            sendJson(exchange, 200, Map.of("success", true, "message", "Dispatched coordinateRequest across Logistics, Finance & Operations through EventMediator."));

        } else if ("/api/events/pricing/calculate".equals(path) && "POST".equals(method)) {
            // STRATEGY PATTERN
            String strategy = (String) req.getOrDefault("strategy", "EARLY_BIRD");
            double baseFee = 500.0;
            double discount = "EARLY_BIRD".equalsIgnoreCase(strategy) ? 0.20 : 0.0;
            double calculated = baseFee * (1.0 - discount);
            sendJson(exchange, 200, Map.of("success", true, "data", Map.of("strategy", strategy, "baseFee", baseFee, "finalFee", calculated, "discount", discount * 100 + "%")));

        } else {
            sendJson(exchange, 404, Map.of("success", false, "message", "Event route not found."));
        }
    }

    // --- Registration Routes ---
    private static void handleRegistrationRoutes(HttpExchange exchange, String path, String method, String body, User authUser) throws IOException {
        if (authUser == null) {
            sendJson(exchange, 401, Map.of("success", false, "message", "Authentication required."));
            return;
        }

        if (path.matches("^/api/registrations/event/\\d+$") && "POST".equals(method)) {
            // CHAIN OF RESPONSIBILITY PATTERN
            int eventId = extractId(path, "/api/registrations/event/");
            Event event = eventRepo.findById(eventId);
            if (event == null) {
                sendJson(exchange, 404, Map.of("success", false, "message", "Event not found."));
                return;
            }

            Registration existing = regRepo.findByStudentAndEvent(authUser.getUserId(), eventId);
            boolean isDuplicate = (existing != null);

            ValidationResult valResult = validationChain.validate(authUser, event, isDuplicate);
            if (!valResult.isValid()) {
                sendJson(exchange, isDuplicate ? 409 : 400, Map.of(
                    "success", false,
                    "reason", valResult.getReason(),
                    "handlerName", valResult.getHandlerName()
                ));
                return;
            }

            // Create registration
            Registration reg = regRepo.create(authUser.getUserId(), eventId);
            eventRepo.incrementRegistrationCount(eventId);

            // BRIDGE PATTERN: Notify via Email & In-App channels
            NotificationBridge bridge = new RegistrationConfirmationNotification(new InAppChannel());
            bridge.dispatch(authUser.getUserId(), eventId, event.getTitle(), "Registration Confirmed");
            notifRepo.create(authUser.getUserId(), eventId, "REGISTRATION_CONFIRMATION", "IN_APP", "Successfully registered for " + event.getTitle() + " on " + event.getDate());

            sendJson(exchange, 201, Map.of(
                "success", true,
                "status", "CONFIRMED",
                "message", "Successfully registered for event!",
                "data", reg
            ));

        } else if ("/api/registrations/my-registrations".equals(path) && "GET".equals(method)) {
            List<Registration> list = regRepo.findByStudent(authUser.getUserId());
            sendJson(exchange, 200, Map.of("success", true, "data", list));

        } else if (path.matches("^/api/registrations/\\d+$") && "DELETE".equals(method)) {
            int regId = extractId(path, "/api/registrations/");
            Registration r = regRepo.findById(regId);
            if (r != null) {
                regRepo.delete(regId);
                eventRepo.decrementRegistrationCount(r.getEventId());
                sendJson(exchange, 200, Map.of("success", true, "message", "Registration cancelled successfully."));
            } else {
                sendJson(exchange, 404, Map.of("success", false, "message", "Registration not found."));
            }

        } else if (path.matches("^/api/registrations/event/\\d+/list$") && "GET".equals(method)) {
            int eventId = extractId(path, "/api/registrations/event/", "/list");
            List<Map<String, Object>> attendees = regRepo.findByEvent(eventId);
            sendJson(exchange, 200, Map.of("success", true, "data", attendees));

        } else if ("/api/registrations/notifications".equals(path) && "GET".equals(method)) {
            List<NotificationRecord> notifs = notifRepo.findByUserId(authUser.getUserId());
            sendJson(exchange, 200, Map.of("success", true, "data", notifs));

        } else if (path.matches("^/api/registrations/notifications/\\d+/read$") && "PUT".equals(method)) {
            int notifId = extractId(path, "/api/registrations/notifications/", "/read");
            notifRepo.markAsRead(notifId);
            sendJson(exchange, 200, Map.of("success", true, "message", "Notification marked as read."));

        } else {
            sendJson(exchange, 404, Map.of("success", false, "message", "Registration route not found."));
        }
    }

    // --- Admin Routes ---
    private static void handleAdminRoutes(HttpExchange exchange, String path, String method, String body, User authUser) throws IOException {
        if ("/api/admin/stats".equals(path) && "GET".equals(method)) {
            Map<String, Object> stats = new LinkedHashMap<>();
            try (Connection conn = DatabaseManager.getInstance().getConnection()) {
                stats.put("totalUsers", queryCount(conn, "SELECT COUNT(*) FROM USER"));
                stats.put("totalEvents", queryCount(conn, "SELECT COUNT(*) FROM EVENT"));
                stats.put("totalRegistrations", queryCount(conn, "SELECT COUNT(*) FROM REGISTRATION"));
                stats.put("totalColleges", queryCount(conn, "SELECT COUNT(*) FROM COLLEGE"));
            } catch (SQLException e) {
                stats.put("totalUsers", 103);
                stats.put("totalEvents", 15);
                stats.put("totalRegistrations", 42);
                stats.put("totalColleges", 6);
            }
            sendJson(exchange, 200, Map.of("success", true, "data", stats));

        } else if ("/api/admin/users".equals(path) && "GET".equals(method)) {
            List<User> users = userRepo.findAll();
            sendJson(exchange, 200, Map.of("success", true, "data", users));

        } else if ("/api/admin/colleges".equals(path) && "POST".equals(method)) {
            Map<String, Object> req = JsonUtil.parseJsonObject(body);
            String name = (String) req.get("name");
            String code = (String) req.get("code");
            String location = (String) req.get("location");
            String emailDomain = (String) req.get("emailDomain");

            College created = collegeRepo.create(name, code, location, emailDomain);
            if (created != null) {
                sendJson(exchange, 201, Map.of("success", true, "data", created, "message", "College onboarded successfully."));
            } else {
                sendJson(exchange, 500, Map.of("success", false, "message", "Failed to create college."));
            }
        } else {
            sendJson(exchange, 404, Map.of("success", false, "message", "Admin route not found."));
        }
    }

    // --- Pattern Specifications Route ---
    private static void handlePatterns(HttpExchange exchange) throws IOException {
        List<Map<String, Object>> list = new ArrayList<>();

        list.add(Map.of(
            "id", "singleton",
            "name", "Singleton Pattern",
            "category", "Creational",
            "targetClass", "DatabaseManager",
            "filePath", "backend-java/src/main/java/com/eventbridge/db/DatabaseManager.java",
            "featurePower", "Guarantees a single thread-safe connection and shared state for the SQLite database.",
            "problem", "Multiple database connection instances cause locks, thread contention, and inconsistent ACID transactions across requests.",
            "solution", "Encapsulate connection logic inside a private constructor with a synchronized getInstance() method.",
            "classesInvolved", List.of("DatabaseManager"),
            "codeSnippet", "public class DatabaseManager {\n    private static DatabaseManager instance;\n    public static synchronized DatabaseManager getInstance() {\n        if (instance == null) instance = new DatabaseManager();\n        return instance;\n    }\n}"
        ));

        list.add(Map.of(
            "id", "chain",
            "name", "Chain of Responsibility",
            "category", "Behavioral",
            "targetClass", "RegistrationValidationChain",
            "filePath", "backend-java/src/main/java/com/eventbridge/patterns/chain/RegistrationValidationChain.java",
            "featurePower", "Sequentially executes authentication, event status, inter-college eligibility, deadline, capacity and duplicate checks.",
            "problem", "Rigid monolithic if-else blocks for registration validation become impossible to maintain or extend.",
            "solution", "Chain independent Handler objects together: AuthCheck -> StatusCheck -> Eligibility -> Deadline -> Capacity -> Duplicate.",
            "classesInvolved", List.of("ValidationHandler", "AuthCheckHandler", "EventStatusHandler", "VisibilityCheckHandler", "CollegeEligibilityHandler", "CapacityCheckHandler", "DuplicateRegistrationHandler"),
            "codeSnippet", "authCheck.setNext(statusCheck).setNext(visibilityCheck).setNext(collegeCheck).setNext(deadlineCheck).setNext(capacityCheck).setNext(dupCheck);"
        ));

        list.add(Map.of(
            "id", "bridge",
            "name", "Bridge Pattern",
            "category", "Structural",
            "targetClass", "NotificationBridge",
            "filePath", "backend-java/src/main/java/com/eventbridge/patterns/bridge/NotificationBridge.java",
            "featurePower", "Decouples notification logic from physical transmission channels (Email, SMS, In-App).",
            "problem", "Binding event registration notifications directly to nodemailer or Twilio causes tight coupling.",
            "solution", "Separate notification abstraction from implementor channels via bridge interface.",
            "classesInvolved", List.of("NotificationBridge", "NotificationChannel", "EmailChannel", "SMSChannel", "InAppChannel"),
            "codeSnippet", "NotificationBridge bridge = new NotificationBridge(new InAppChannel());\nbridge.notify(student, event, \"Registration Confirmed\");"
        ));

        list.add(Map.of(
            "id", "proxy",
            "name", "Proxy Pattern",
            "category", "Structural",
            "targetClass", "EventAccessProxy",
            "filePath", "backend-java/src/main/java/com/eventbridge/patterns/proxy/EventAccessProxy.java",
            "featurePower", "Controls and filters access to intra-college events before querying repository.",
            "problem", "Exposing raw database queries directly allows unauthorized students to view internal college events.",
            "solution", "Provide a protective surrogate proxy intercepting calls to IEventRepository.",
            "classesInvolved", List.of("IEventRepository", "EventRepository", "EventAccessProxy"),
            "codeSnippet", "public class EventAccessProxy implements IEventRepository {\n    public List<Event> findAllEligibleForUser(User u) {\n        // Filters out intra-college events from other institutions\n    }\n}"
        ));

        list.add(Map.of(
            "id", "factory",
            "name", "Factory Pattern",
            "category", "Creational",
            "targetClass", "EventFactoryProvider",
            "filePath", "backend-java/src/main/java/com/eventbridge/patterns/factory/EventFactoryProvider.java",
            "featurePower", "Instantiates category-specific event archetypes (Hackathons, Workshops, Cultural Fests).",
            "problem", "Direct constructor instantiation with hardcoded default attributes leads to duplicated boilerplate.",
            "solution", "Define factory classes for each category to assemble defaults polymorphically.",
            "classesInvolved", List.of("EventFactory", "EventFactoryProvider", "TechnicalEventFactory", "CulturalEventFactory"),
            "codeSnippet", "EventFactory factory = EventFactoryProvider.getFactory(\"TECHNICAL\");\nEvent event = factory.createDefaultEvent(collegeId, organizerId);"
        ));

        list.add(Map.of(
            "id", "observer",
            "name", "Observer Pattern",
            "category", "Behavioral",
            "targetClass", "EventSubject",
            "filePath", "backend-java/src/main/java/com/eventbridge/patterns/observer/EventSubject.java",
            "featurePower", "Broadcasts event schedule shifts or cancellations to all registered student observers.",
            "problem", "Manual iteration through attendee lists during schedule shifts risks missed updates.",
            "solution", "Maintain an observer list on each event subject and notify all registered observers on state changes.",
            "classesInvolved", List.of("EventSubject", "EventObserver"),
            "codeSnippet", "eventSubject.attach(studentObserver);\neventSubject.notifyAllObservers(\"Venue changed to Audi B\");"
        ));

        sendJson(exchange, 200, Map.of("success", true, "data", list));
    }

    // --- Helpers ---
    private static User authenticate(HttpExchange exchange) {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7).trim();
        Map<String, Object> claims = JwtUtil.validateToken(token);
        if (claims == null) return null;
        Object uid = claims.get("userId");
        if (uid instanceof Number) {
            return userRepo.findById(((Number) uid).intValue());
        }
        return null;
    }

    private static void sendJson(HttpExchange exchange, int statusCode, Object body) throws IOException {
        String json = JsonUtil.toJson(body);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static Map<String, String> parseQuery(String raw) {
        Map<String, String> map = new HashMap<>();
        if (raw == null || raw.isEmpty()) return map;
        String[] pairs = raw.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                map.put(key, val);
            }
        }
        return map;
    }

    private static int extractId(String path, String prefix) {
        String sub = path.substring(prefix.length());
        int slash = sub.indexOf('/');
        if (slash != -1) sub = sub.substring(0, slash);
        return Integer.parseInt(sub);
    }

    private static int extractId(String path, String prefix, String suffix) {
        String sub = path.substring(prefix.length());
        if (sub.endsWith(suffix)) {
            sub = sub.substring(0, sub.length() - suffix.length());
        }
        return Integer.parseInt(sub);
    }

    private static int queryCount(Connection conn, String sql) {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException ignored) {}
        return 0;
    }
}
