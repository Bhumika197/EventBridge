import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Shield, Plus, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export const AdminDashboard = () => {
  const { colleges, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [collegeData, setCollegeData] = useState({
    name: "",
    code: "",
    location: "",
    emailDomain: ""
  });
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [resStats, resUsers, resPending] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers(),
        api.getPendingReviews()
      ]);
      if (resStats.success) setStats(resStats.data);
      if (resUsers.success) setUsersList(resUsers.data);
      if (resPending.success) setPendingEvents(resPending.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAdminData();
  }, []);
  const handleApprove = async (eventId) => {
    try {
      await api.reviewEvent(eventId, "APPROVE");
      alert("Event approved and published!");
      loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to approve event.");
    }
  };
  const handleReject = async (eventId) => {
    const reason = window.prompt("Enter rejection feedback for the organizer:");
    if (reason) {
      try {
        await api.reviewEvent(eventId, "REJECT", reason);
        alert("Event rejected with feedback.");
        loadAdminData();
      } catch (err) {
        alert(err.message || "Failed to reject event.");
      }
    }
  };
  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCollege(collegeData);
      if (res.success) {
        alert("College institution added successfully to EventBridge ecosystem!");
        setCollegeData({ name: "", code: "", location: "", emailDomain: "" });
        setShowAddCollege(false);
        loadAdminData();
        refreshUser();
      }
    } catch (err) {
      alert(err.message || "Failed to create college.");
    }
  };
  return <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "1.5rem 1rem" }}>{
    /* Header */
  }<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}><div><div style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}><Shield size={16} />
            System Governance Desk
          </div><h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", marginTop: "0.2rem" }}>
            Platform Administrator Dashboard
          </h1></div><button className="btn-primary" onClick={() => setShowAddCollege(true)}><Plus size={17} />
          Register New College
        </button></div>{
    /* Stats Overview */
  }{stats && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total Colleges</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#4f46e5", marginTop: "0.2rem" }}>{stats.totalColleges}</div></div><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total Students</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#0284c7", marginTop: "0.2rem" }}>{stats.totalStudents}</div></div><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Approved Organizers</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#d946ef", marginTop: "0.2rem" }}>{stats.totalOrganizers}</div></div><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Pending Reviews</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>{pendingEvents.length}</div></div><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Active Registrations</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", marginTop: "0.2rem" }}>{stats.confirmedRegistrations}</div></div></div>}{
    /* Event Moderation & Review Queue */
  }<div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}><div><h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Event Moderation & Review Desk
            </h3><p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
              Events submitted by organizers requiring administrative compliance review before publishing.
            </p></div><span className="badge" style={{ background: pendingEvents.length > 0 ? "#fef3c7" : "#dcfce7", color: pendingEvents.length > 0 ? "#92400e" : "#15803d" }}>{pendingEvents.length} Pending
          </span></div>{pendingEvents.length === 0 ? <div style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>
            No submitted events currently awaiting moderation review.
          </div> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}><thead><tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}><th style={{ padding: "0.75rem" }}>Event Title</th><th style={{ padding: "0.75rem" }}>Organizer</th><th style={{ padding: "0.75rem" }}>Category & Type</th><th style={{ padding: "0.75rem" }}>Scheduled Date</th><th style={{ padding: "0.75rem" }}>Capacity</th><th style={{ padding: "0.75rem" }}>Actions</th></tr></thead><tbody>{pendingEvents.map((event) => <tr key={event.eventId} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "0.75rem" }}><div style={{ fontWeight: 700, color: "#0f172a" }}>{event.title}</div><div style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.description}</div></td><td style={{ padding: "0.75rem", color: "#4f46e5", fontWeight: 550 }}><div>{event.organizerName}</div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>{event.organizingCollegeName}</div></td><td style={{ padding: "0.75rem" }}><span className="badge badge-technical" style={{ marginRight: "4px" }}>{event.category}</span><span className={event.eventType === "INTRA_COLLEGE" ? "badge badge-intra" : "badge badge-inter"}>{event.eventType === "INTRA_COLLEGE" ? "Intra" : "Inter"}</span></td><td style={{ padding: "0.75rem", color: "#64748b" }}>{event.date} ({event.startTime})</td><td style={{ padding: "0.75rem", color: "#0f172a", fontWeight: 700 }}>{event.capacity} seats</td><td style={{ padding: "0.75rem" }}><div style={{ display: "flex", gap: "0.5rem" }}><button
    className="btn-primary"
    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", background: "#10b981", borderColor: "#059669" }}
    onClick={() => handleApprove(event.eventId)}
  ><Check size={14} /> Approve & Publish
                        </button><button
    className="btn-danger"
    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
    onClick={() => handleReject(event.eventId)}
  ><X size={14} /> Reject
                        </button></div></td></tr>)}</tbody></table></div>}</div>{
    /* Colleges Management */
  }<div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}><h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          Registered Institutional Colleges
        </h3><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}><thead><tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}><th style={{ padding: "0.75rem" }}>Code</th><th style={{ padding: "0.75rem" }}>Institution Name</th><th style={{ padding: "0.75rem" }}>Campus Location</th><th style={{ padding: "0.75rem" }}>Domain Verification</th><th style={{ padding: "0.75rem" }}>Status</th></tr></thead><tbody>{colleges.map((col) => <tr key={col.collegeId} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "0.75rem", fontWeight: 700, color: "#4f46e5" }}>{col.code}</td><td style={{ padding: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{col.name}</td><td style={{ padding: "0.75rem", color: "#64748b" }}>{col.location}</td><td style={{ padding: "0.75rem", color: "#059669", fontFamily: "monospace" }}>@{col.emailDomain}</td><td style={{ padding: "0.75rem" }}><span className="badge badge-open">{col.status}</span></td></tr>)}</tbody></table></div></div>{
    /* Users Directory */
  }<div className="glass-panel" style={{ padding: "1.5rem" }}><h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          Platform User Accounts Directory ({usersList.length} Seeded Accounts)
        </h3><div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}><thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 1 }}><tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}><th style={{ padding: "0.6rem" }}>User ID</th><th style={{ padding: "0.6rem" }}>Name</th><th style={{ padding: "0.6rem" }}>Username</th><th style={{ padding: "0.6rem" }}>Email</th><th style={{ padding: "0.6rem" }}>Role</th><th style={{ padding: "0.6rem" }}>College</th></tr></thead><tbody>{usersList.map((u) => <tr key={u.userId} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "0.6rem", color: "#64748b" }}>#{u.userId}</td><td style={{ padding: "0.6rem", fontWeight: 700, color: "#0f172a" }}>{u.name}</td><td style={{ padding: "0.6rem", color: "#4f46e5" }}>{u.username}</td><td style={{ padding: "0.6rem", color: "#64748b" }}>{u.email}</td><td style={{ padding: "0.6rem" }}><span className="badge badge-open">{u.role}</span></td><td style={{ padding: "0.6rem", color: "#0f172a" }}>{u.collegeName || `College #${u.collegeId}`}</td></tr>)}</tbody></table></div></div>{
    /* Modal: Add College */
  }{showAddCollege && <div className="modal-overlay" onClick={() => setShowAddCollege(false)}><div className="glass-panel modal-content" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}><h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
              Register Institutional College
            </h3><form onSubmit={handleCreateCollege}><div style={{ marginBottom: "1rem" }}><label className="form-label">College Full Name</label><input
    type="text"
    required
    className="search-input"
    style={{ width: "100%" }}
    placeholder="e.g. Indian Institute of Technology Bombay"
    value={collegeData.name}
    onChange={(e) => setCollegeData({ ...collegeData, name: e.target.value })}
  /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}><div><label className="form-label">Code / Acronym</label><input
    type="text"
    required
    className="search-input"
    style={{ width: "100%" }}
    placeholder="e.g. IITB"
    value={collegeData.code}
    onChange={(e) => setCollegeData({ ...collegeData, code: e.target.value })}
  /></div><div><label className="form-label">Email Domain</label><input
    type="text"
    required
    className="search-input"
    style={{ width: "100%" }}
    placeholder="e.g. iitb.ac.in"
    value={collegeData.emailDomain}
    onChange={(e) => setCollegeData({ ...collegeData, emailDomain: e.target.value })}
  /></div></div><div style={{ marginBottom: "1.5rem" }}><label className="form-label">Location</label><input
    type="text"
    required
    className="search-input"
    style={{ width: "100%" }}
    placeholder="e.g. Powai, Mumbai"
    value={collegeData.location}
    onChange={(e) => setCollegeData({ ...collegeData, location: e.target.value })}
  /></div><div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}><button type="button" className="btn-secondary" onClick={() => setShowAddCollege(false)}>Cancel</button><button type="submit" className="btn-primary">Register College</button></div></form></div></div>}</div>;
};
