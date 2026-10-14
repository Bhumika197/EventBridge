import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";
export const Navbar = ({
  activeTab,
  setActiveTab,
  openLoginModal,
  toggleNotifDrawer,
  unreadCount
}) => {
  const { user, logout } = useAuth();
  const getInitials = (name) => {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };
  return <nav className="navbar">{
    /* Main Logo */
  }<div className="logo-container" onClick={() => setActiveTab("explore")} title="EventBridge Home"><div className="logo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" /><path d="M4 14h16" /><path d="M9 19v-5a3 3 0 0 1 6 0v5" /></svg></div><span style={{ color: "var(--text-main)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.025em" }}>EventBridge</span></div><div className="nav-links"><button
    className={`nav-item ${activeTab === "explore" ? "active" : ""}`}
    onClick={() => setActiveTab("explore")}
  >
          Explore Events
        </button>{user && user.role === "STUDENT" && <button
    className={`nav-item ${activeTab === "my_registrations" ? "active" : ""}`}
    onClick={() => setActiveTab("my_registrations")}
  >
            My Registrations
          </button>}{user && (user.role === "EVENT_ORGANIZER" || user.role === "PLATFORM_ADMIN") && <button
    className={`nav-item ${activeTab === "organizer_dashboard" ? "active" : ""}`}
    onClick={() => setActiveTab("organizer_dashboard")}
  >
            Organizer Desk
          </button>}{user && user.role === "PLATFORM_ADMIN" && <button
    className={`nav-item ${activeTab === "admin_dashboard" ? "active" : ""}`}
    onClick={() => setActiveTab("admin_dashboard")}
  >
            Governance
          </button>}<button
    className={`nav-item ${activeTab === "pattern_explorer" ? "active" : ""}`}
    onClick={() => setActiveTab("pattern_explorer")}
  >
          Architecture & UML Specs
        </button>{user && <button
    className="nav-item"
    onClick={toggleNotifDrawer}
    style={{ position: "relative", padding: "0.45rem 0.6rem" }}
    title="Notifications"
  ><Bell size={17} />{unreadCount > 0 && <span
    style={{
      position: "absolute",
      top: "5px",
      right: "6px",
      background: "var(--danger)",
      color: "#ffffff",
      borderRadius: "50%",
      width: "15px",
      height: "15px",
      fontSize: "0.65rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700
    }}
  >{unreadCount}</span>}</button>}{user ? <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginLeft: "0.5rem" }}><div
    style={{
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "var(--palette-subtle)",
      color: "var(--palette-deep)",
      border: "1px solid var(--palette-border)",
      fontWeight: 700,
      fontSize: "0.78rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }}
    title={user.name}
  >{getInitials(user.name)}</div><div style={{ textAlign: "left", maxWidth: "170px" }}><div
    style={{
      fontSize: "0.84rem",
      fontWeight: 650,
      color: "var(--text-main)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: 1.2
    }}
    title={user.name}
  >{user.name}</div><div
    style={{
      fontSize: "0.72rem",
      color: "var(--text-dim)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: 1.2
    }}
    title={`${user.collegeName || `College #${user.collegeId}`} \u2022 ${user.role}`}
  >{user.collegeName ? user.collegeName.length > 20 ? user.collegeName.substring(0, 18) + "..." : user.collegeName : `College #${user.collegeId}`}</div></div><button
    className="btn-secondary"
    style={{ padding: "0.4rem 0.65rem", fontSize: "0.78rem", color: "#94a3b8" }}
    title="Delete Account"
    onClick={() => openLoginModal("delete")}
  >
              Delete
            </button><button
    className="btn-secondary"
    style={{ padding: "0.4rem 0.75rem", fontSize: "0.82rem" }}
    onClick={logout}
    title="Log out"
  >
              Sign Out
            </button></div> : <button
    className="btn-primary"
    onClick={() => openLoginModal("login")}
    style={{ padding: "0.5rem 1rem", fontSize: "0.86rem", marginLeft: "0.4rem" }}
  >
            Sign In / Demo
          </button>}</div></nav>;
};
