import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { CreateEventModal } from "../components/CreateEventModal";
import { CreateEventWizardModal } from "../components/CreateEventWizardModal";
import { DuplicateEventModal } from "../components/DuplicateEventModal";
import { EventVersionModal } from "../components/EventVersionModal";
import { Plus, Users, Megaphone, Ban, Send, AlertTriangle, Copy, History } from "lucide-react";
export const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [duplicateEvent, setDuplicateEvent] = useState(null);
  const [editVersionEvent, setEditVersionEvent] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [announcementEventId, setAnnouncementEventId] = useState(null);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const loadOrganizerEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getOrganizerEvents();
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadOrganizerEvents();
  }, []);
  const handleViewParticipants = async (eventId) => {
    setSelectedEventId(eventId);
    try {
      const res = await api.getEventRegistrations(eventId);
      if (res.success) {
        setParticipants(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSubmitForReview = async (eventId) => {
    try {
      await api.submitForReview(eventId);
      alert("Event submitted for administrator review!");
      loadOrganizerEvents();
    } catch (err) {
      alert(err.message || "Failed to submit event for review.");
    }
  };
  const handleCancelEvent = async (eventId) => {
    const reason = window.prompt("Enter reason for cancelling event:");
    if (reason) {
      try {
        await api.cancelEvent(eventId, reason);
        alert("Event cancelled. Observer Pattern notified all registered students!");
        loadOrganizerEvents();
      } catch (err) {
        alert(err.message || "Failed to cancel event.");
      }
    }
  };
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementEventId || !announcementMsg) return;
    try {
      await api.sendAnnouncement(announcementEventId, announcementMsg);
      alert("Announcement sent to registered students via Notification Bridge Pattern!");
      setAnnouncementEventId(null);
      setAnnouncementMsg("");
    } catch (err) {
      alert(err.message || "Failed to send announcement.");
    }
  };
  const totalRegistrations = events.reduce((acc, e) => acc + e.currentRegistrations, 0);
  const getStatusBadge = (status) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="badge" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>PUBLISHED</span>;
      case "SUBMITTED":
        return <span className="badge" style={{ background: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" }}>UNDER REVIEW</span>;
      case "DRAFT":
        return <span className="badge" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}>DRAFT</span>;
      case "REJECTED":
        return <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}>REJECTED</span>;
      case "CANCELLED":
        return <span className="badge" style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #d1d5db" }}>CANCELLED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  return <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "1.5rem 1rem" }}>{
    /* Header */
  }<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}><div><h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em" }}>
            Event Organizer Management Desk
          </h1><p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.2rem" }}>
            College: {user?.collegeName || `College #${user?.collegeId}`} • Organizer: {user?.name}</p></div><div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}><button className="btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={17} />
            Create New Event
          </button></div></div>{
    /* Stats Cards */
  }<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total Organized Events</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>{events.length}</div></div><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Published Active Events</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", marginTop: "0.2rem" }}>{events.filter((e) => e.status === "PUBLISHED").length}</div></div><div className="glass-panel" style={{ padding: "1.25rem" }}><div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total Student Registrations</div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#06b6d4", marginTop: "0.2rem" }}>{totalRegistrations}</div></div></div>{
    /* Rejected Events Banner */
  }{events.filter((e) => e.status === "REJECTED").map((rej) => <div key={rej.eventId} style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: "1rem 1.25rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}><div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} /><div><strong style={{ color: "#991b1b" }}>Event Needs Attention: "{rej.title}" was Rejected</strong><p style={{ margin: "0.25rem 0 0 0", color: "#7f1d1d", fontSize: "0.88rem" }}><strong>Admin Feedback:</strong> {rej.rejectionReason || "Please review event guidelines and update before resubmitting."}</p></div></div><button className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => handleSubmitForReview(rej.eventId)}><Send size={14} /> Re-Submit for Review
          </button></div>)}{
    /* Events Table */
  }<div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}><h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          My Managed Events
        </h3>{loading ? <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading organized events...</div> : events.length === 0 ? <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            You haven't created any events yet. Click "Create New Event" above to publish your first event!
          </div> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}><thead><tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}><th style={{ padding: "0.75rem" }}>Event Title</th><th style={{ padding: "0.75rem" }}>Category</th><th style={{ padding: "0.75rem" }}>Type</th><th style={{ padding: "0.75rem" }}>Date</th><th style={{ padding: "0.75rem" }}>Attendance</th><th style={{ padding: "0.75rem" }}>Status</th><th style={{ padding: "0.75rem" }}>Actions</th></tr></thead><tbody>{events.map((event) => <tr key={event.eventId} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{event.title}</td><td style={{ padding: "0.75rem", color: "#a5b4fc" }}>{event.category}</td><td style={{ padding: "0.75rem" }}><span className={event.eventType === "INTRA_COLLEGE" ? "badge badge-intra" : "badge badge-inter"}>{event.eventType === "INTRA_COLLEGE" ? "Intra-College" : "Inter-College"}</span></td><td style={{ padding: "0.75rem", color: "#94a3b8" }}>{event.date}</td><td style={{ padding: "0.75rem", fontWeight: 700, color: "#06b6d4" }}>{event.currentRegistrations} / {event.capacity}{(event.waitlistCount || 0) > 0 && <span style={{ fontSize: "0.75rem", color: "#f59e0b", marginLeft: "6px", fontWeight: "normal" }}>
                          (+{event.waitlistCount} Waitlisted)
                        </span>}</td><td style={{ padding: "0.75rem" }}>{getStatusBadge(event.status)}</td><td style={{ padding: "0.75rem" }}><div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>{(event.status === "DRAFT" || event.status === "REJECTED") && <button
    className="btn-primary"
    style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem" }}
    onClick={() => handleSubmitForReview(event.eventId)}
  ><Send size={14} />
                            Submit
                          </button>}<button
    className="btn-secondary"
    style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem" }}
    onClick={() => handleViewParticipants(event.eventId)}
  ><Users size={14} />
                          Roster
                        </button>{
    /* Prototype Pattern: Clone Event */
  }<button
    className="btn-secondary"
    style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem", color: "#38bdf8", borderColor: "rgba(56,189,248,0.3)" }}
    title="Duplicate Event via Prototype Pattern (Deep Copy)"
    onClick={() => setDuplicateEvent(event)}
  ><Copy size={13} />
                          Clone
                        </button>{
    /* Memento Pattern: Edit & Undo History */
  }<button
    className="btn-secondary"
    style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem", color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)" }}
    title="Edit details with Memento Snapshot & Undo Safeguard"
    onClick={() => setEditVersionEvent(event)}
  ><History size={13} />
                          Edit / Undo
                        </button>{event.status === "PUBLISHED" && <button
    className="btn-secondary"
    style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem", color: "#a5b4fc" }}
    onClick={() => setAnnouncementEventId(event.eventId)}
  ><Megaphone size={14} />
                            Announce
                          </button>}{event.status !== "CANCELLED" && <button
    className="btn-danger"
    style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem" }}
    onClick={() => handleCancelEvent(event.eventId)}
  ><Ban size={14} />
                            Cancel
                          </button>}</div></td></tr>)}</tbody></table></div>}</div>{
    /* Participants & Waitlist Roster View */
  }{selectedEventId && <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}><h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              Participant & Waitlist Roster for Event #{selectedEventId}</h3><button className="btn-secondary" style={{ padding: "0.3rem 0.6rem" }} onClick={() => setSelectedEventId(null)}>Close Roster</button></div>{participants.length === 0 ? <div style={{ color: "#64748b", padding: "1rem" }}>No student registrations recorded yet for this event.</div> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}><thead><tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}><th style={{ padding: "0.5rem" }}>Status / Queue</th><th style={{ padding: "0.5rem" }}>Student Name</th><th style={{ padding: "0.5rem" }}>Email</th><th style={{ padding: "0.5rem" }}>Home Institution</th><th style={{ padding: "0.5rem" }}>Dept & Year</th><th style={{ padding: "0.5rem" }}>Registered At</th></tr></thead><tbody>{participants.map((p) => <tr key={p.registrationId} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "0.5rem" }}>{p.status === "CONFIRMED" ? <span className="badge badge-open">CONFIRMED</span> : p.status === "WAITLISTED" ? <span className="badge badge-closed">
                            WAITLIST #{p.queuePosition}</span> : <span className="badge">{p.status}</span>}</td><td style={{ padding: "0.5rem", fontWeight: 700, color: "#0f172a" }}>{p.studentName}</td><td style={{ padding: "0.5rem", color: "#64748b" }}>{p.studentEmail}</td><td style={{ padding: "0.5rem", color: "#4f46e5", fontWeight: 550 }}>{p.studentCollegeName}</td><td style={{ padding: "0.5rem", color: "#64748b" }}>{p.studentDepartment || "General"} (Year {p.studentYear || 1})</td><td style={{ padding: "0.5rem", color: "#64748b" }}>{new Date(p.registeredAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</div>}{
    /* Announcement Modal */
  }{announcementEventId && <div className="modal-overlay" onClick={() => setAnnouncementEventId(null)}><div className="glass-panel modal-content" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}><h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
              Broadcast Announcement to Enrolled Students
            </h3><p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Send an official update to all confirmed and waitlisted attendees.
            </p><form onSubmit={handleSendAnnouncement}><textarea
    className="search-input"
    style={{ width: "100%", minHeight: "100px", marginBottom: "1rem" }}
    required
    placeholder="Enter announcement details (e.g., Change of room, mandatory requirements, schedule shift)..."
    value={announcementMsg}
    onChange={(e) => setAnnouncementMsg(e.target.value)}
  /><div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}><button type="button" className="btn-secondary" onClick={() => setAnnouncementEventId(null)}>Cancel</button><button type="submit" className="btn-primary">Send Announcement</button></div></form></div></div>}{
    /* Create Event Modal (Standard) */
  }{showCreateModal && <CreateEventModal
    onClose={() => setShowCreateModal(false)}
    onSuccess={loadOrganizerEvents}
  />}{
    /* Create Event Wizard Modal (Builder Pattern) */
  }{showWizardModal && <CreateEventWizardModal
    onClose={() => setShowWizardModal(false)}
    onSuccess={loadOrganizerEvents}
  />}{
    /* Duplicate Event Modal (Prototype Pattern) */
  }{duplicateEvent && <DuplicateEventModal
    event={duplicateEvent}
    onClose={() => setDuplicateEvent(null)}
    onSuccess={loadOrganizerEvents}
  />}{
    /* Edit & Version History Modal (Memento Pattern) */
  }{editVersionEvent && <EventVersionModal
    event={editVersionEvent}
    onClose={() => setEditVersionEvent(null)}
    onSuccess={loadOrganizerEvents}
  />}</div>;
};
