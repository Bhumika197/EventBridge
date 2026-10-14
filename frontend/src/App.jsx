import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { EventCard } from "./components/EventCard";
import { EventDetailModal } from "./components/EventDetailModal";
import { CreateEventModal } from "./components/CreateEventModal";
import { ContactOrganizerModal } from "./components/ContactOrganizerModal";
import { LoginModal } from "./components/LoginModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { RevealOnScroll } from "./components/RevealOnScroll";
import { DesignPatternExplorer } from "./components/DesignPatternExplorer";
import { StudentDashboard } from "./pages/StudentDashboard";
import { OrganizerDashboard } from "./pages/OrganizerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { api } from "./services/api";
import { DEFAULT_EVENTS } from "./data/defaultEvents";
import { Search, X, RotateCcw, Calendar } from "lucide-react";
const MainApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("explore");
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [colleges, setColleges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedEventType, setSelectedEventType] = useState("ALL");
  const [selectedCollegeId, setSelectedCollegeId] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState("login");
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [contactEvent, setContactEvent] = useState(null);
  const categories = ["Technical", "Cultural", "Sports", "Workshop", "Management", "Social", "Arts"];
  const loadEvents = async () => {
    try {
      const res = await api.getEligibleEvents();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
      }
    } catch (err) {
      console.warn("Using offline/fallback events:", err?.message || err);
    }
  };
  const loadColleges = async () => {
    try {
      const res = await api.getColleges();
      if (res.success) setColleges(res.data);
    } catch (err) {
      console.error("Error fetching colleges:", err);
    }
  };
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };
  useEffect(() => {
    loadEvents();
    loadColleges();
    loadNotifications();
  }, [user]);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;
  const isFiltered = searchQuery.trim() !== "" || selectedCategory !== "ALL" || selectedEventType !== "ALL" || selectedCollegeId !== "ALL";
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedEventType("ALL");
    setSelectedCollegeId("ALL");
  };
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase()) || e.organizingCollegeName && e.organizingCollegeName.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || e.category === selectedCategory;
    const matchesType = selectedEventType === "ALL" || e.eventType === selectedEventType;
    const matchesCollege = selectedCollegeId === "ALL" || e.collegeId === Number(selectedCollegeId);
    return matchesSearch && matchesCat && matchesType && matchesCollege;
  });
  return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}><Navbar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    openLoginModal={(mode = "login") => {
      setLoginModalMode(mode);
      setIsLoginModalOpen(true);
    }}
    toggleNotifDrawer={() => {
      setIsNotifDrawerOpen(!isNotifDrawerOpen);
      if (!isNotifDrawerOpen) loadNotifications();
    }}
    unreadCount={unreadCount}
  />{isNotifDrawerOpen && <NotificationDrawer
    notifications={notifications}
    onClose={() => setIsNotifDrawerOpen(false)}
    onRefresh={loadNotifications}
  />}<main style={{ flex: 1 }}>{activeTab === "explore" && <div><HeroSection
    onExploreClick={() => {
      const el = document.getElementById("events-catalog");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }}
    onLoginClick={() => setIsLoginModalOpen(true)}
  /><div id="events-catalog" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem 4rem 1.5rem" }}>{
    /* Section Header */
  }<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}><div><h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.025em" }}>
                    Upcoming Campus Events
                  </h2><p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
                    Showing {filteredEvents.length} events across {colleges.length} institutions
                  </p></div><div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>{isFiltered && <button
    className="btn-secondary"
    onClick={resetFilters}
    style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem", gap: "0.35rem" }}
  ><RotateCcw size={13} />
                      Reset Filters
                    </button>}{user && (user.role === "EVENT_ORGANIZER" || user.role === "PLATFORM_ADMIN") && <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                      + Create Event
                    </button>}</div></div>{
    /* Category Pills */
  }<div className="category-pills"><button
    className={`cat-pill ${selectedCategory === "ALL" ? "active" : ""}`}
    onClick={() => setSelectedCategory("ALL")}
  >
                  All Events
                </button>{categories.map((cat) => <button
    key={cat}
    className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
    onClick={() => setSelectedCategory(cat)}
  >{cat}</button>)}</div>{
    /* Control Bar: Search & Select Dropdowns */
  }<div className="control-bar"><div style={{ position: "relative", flex: 1, minWidth: "260px" }}><Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} /><input
    type="text"
    className="search-input"
    style={{ paddingLeft: "2.4rem", paddingRight: searchQuery ? "2rem" : "0.9rem", width: "100%" }}
    placeholder="Search events by title, topics, or venues..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />{searchQuery && <button
    onClick={() => setSearchQuery("")}
    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", color: "#94a3b8", display: "flex" }}
  ><X size={15} /></button>}</div><select
    className="select-input"
    value={selectedEventType}
    onChange={(e) => setSelectedEventType(e.target.value)}
    style={{ minWidth: "160px" }}
  ><option value="ALL">All Event Types</option><option value="INTER_COLLEGE">Inter-College (Open)</option><option value="INTRA_COLLEGE">Host Campus Only</option></select><select
    className="select-input"
    value={selectedCollegeId}
    onChange={(e) => setSelectedCollegeId(e.target.value)}
    style={{ minWidth: "190px" }}
  ><option value="ALL">All Colleges</option>{colleges.map((c) => <option key={c.collegeId} value={c.collegeId}>{c.name} ({c.code})
                    </option>)}</select></div>{
    /* Events Grid */
  }{filteredEvents.length === 0 ? <div className="glass-panel" style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "#64748b" }}><Calendar size={36} style={{ marginBottom: "0.75rem", opacity: 0.35, color: "#4f46e5" }} /><h3 style={{ fontSize: "1.1rem", fontWeight: 650, color: "#0f172a", marginBottom: "0.35rem" }}>
                    No events match your criteria
                  </h3><p style={{ fontSize: "0.88rem", marginBottom: "1.25rem" }}>
                    Try clearing your search query or selecting a different category.
                  </p><button className="btn-secondary" onClick={resetFilters}>
                    Clear All Filters
                  </button></div> : <div className="events-grid">{filteredEvents.map((evt, idx) => <RevealOnScroll key={evt.eventId} delay={idx % 3 * 80}><EventCard event={evt} onSelect={setSelectedEvent} /></RevealOnScroll>)}</div>}</div></div>}{activeTab === "my_registrations" && <StudentDashboard />}{activeTab === "organizer_dashboard" && <OrganizerDashboard />}{activeTab === "admin_dashboard" && <AdminDashboard />}{activeTab === "pattern_explorer" && <DesignPatternExplorer />}</main>{
    /* Clean Modern Footer */
  }<footer
    style={{
      background: "#ffffff",
      borderTop: "1px solid var(--border-color)",
      padding: "2.5rem 2rem 2rem 2rem",
      fontSize: "0.85rem",
      color: "var(--text-muted)",
      marginTop: "auto"
    }}
  ><div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.25rem" }}><div><div style={{ fontWeight: 750, color: "var(--text-main)", fontSize: "1rem", letterSpacing: "-0.02em", marginBottom: "0.2rem" }}>
              EventBridge
            </div><p style={{ color: "var(--text-subtle)", fontSize: "0.8rem" }}>
              Collegiate discovery and automated FIFO waitlist platform.
            </p></div><div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}><button
    onClick={() => {
      setActiveTab("explore");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
    style={{ background: "transparent", color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 500 }}
  >
              Browse Events
            </button><button
    onClick={() => setActiveTab("pattern_explorer")}
    style={{
      background: "transparent",
      color: "var(--palette-rich)",
      fontSize: "0.82rem",
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35rem"
    }}
  >
              Architecture & UML Specs
            </button><span style={{ color: "var(--palette-border-hover)" }}>•</span><span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>© 2026 EventBridge</span></div></div></footer>{
    /* Modals */
  }<EventDetailModal
    event={selectedEvent}
    onClose={() => setSelectedEvent(null)}
    onRefresh={loadEvents}
    onOpenContact={(e) => setContactEvent(e)}
    onOpenLogin={() => {
      setSelectedEvent(null);
      setIsLoginModalOpen(true);
    }}
  />{isCreateModalOpen && <CreateEventModal
    onClose={() => setIsCreateModalOpen(false)}
    onSuccess={() => {
      loadEvents();
      setIsCreateModalOpen(false);
    }}
  />}{isLoginModalOpen && <LoginModal
    initialMode={loginModalMode}
    onClose={() => setIsLoginModalOpen(false)}
  />}{contactEvent && <ContactOrganizerModal event={contactEvent} onClose={() => setContactEvent(null)} />}</div>;
};
export default function App() {
  return <AuthProvider><MainApp /></AuthProvider>;
}
