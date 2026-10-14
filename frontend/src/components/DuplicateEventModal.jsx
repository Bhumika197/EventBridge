import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { api } from "../services/api";
export const DuplicateEventModal = ({ event, onClose, onSuccess }) => {
  const [title, setTitle] = useState(`${event.title} (2026 Edition)`);
  const [date, setDate] = useState(event.date || "2026-11-20");
  const [venue, setVenue] = useState(event.venue || "Campus Auditorium");
  const [registrationDeadline, setRegistrationDeadline] = useState(event.registrationDeadline || "2026-11-15");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const speakers = Array.isArray(event.speakers) ? event.speakers : typeof event.speakers === "string" ? (() => {
    try {
      return JSON.parse(event.speakers);
    } catch {
      return [];
    }
  })() : [];
  const sponsors = Array.isArray(event.sponsors) ? event.sponsors : typeof event.sponsors === "string" ? (() => {
    try {
      return JSON.parse(event.sponsors);
    } catch {
      return [];
    }
  })() : [];
  const handleDuplicate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.cloneEvent(event.eventId, {
        title,
        date,
        venue,
        registrationDeadline
      });
      if (res.success) {
        alert(`Event duplicated successfully via Prototype Pattern! Deep-copied ${speakers.length} speakers and ${sponsors.length} sponsors.`);
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to duplicate event.");
      }
    } catch (err) {
      setError(err.message || "Server error while duplicating event.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="modal-overlay" onClick={onClose}><div
    className="glass-panel modal-content"
    style={{ maxWidth: "580px", width: "92%", background: "#ffffff", color: "#0f172a" }}
    onClick={(e) => e.stopPropagation()}
  ><button className="modal-close" onClick={onClose}><X size={24} style={{ color: "#0f172a" }} /></button><div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}><span className="badge badge-inter" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Copy size={13} />
            Duplicate Event
          </span><span style={{ fontSize: "0.8rem", color: "#64748b" }}>New Session Setup</span></div><h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Duplicate "{event.title}"
        </h2><p style={{ color: "#475569", fontSize: "0.88rem", lineHeight: "1.5", marginBottom: "1.25rem" }}>
          Rerun this event for a new academic semester. Copies all event details, eligibility criteria, and speakers while resetting attendee count to zero and saving as DRAFT.
        </p>{error && <div style={{ padding: "0.75rem 1rem", borderRadius: "6px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: "0.88rem", marginBottom: "1rem" }}>{error}</div>}<form onSubmit={handleDuplicate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
              Cloned Event Title *
            </label><input
    type="text"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                New Event Date *
              </label><input
    type="date"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={date}
    onChange={(e) => setDate(e.target.value)}
  /></div><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                New Registration Deadline *
              </label><input
    type="date"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={registrationDeadline}
    onChange={(e) => setRegistrationDeadline(e.target.value)}
  /></div></div><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
              New Venue & Hall *
            </label><input
    type="text"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={venue}
    onChange={(e) => setVenue(e.target.value)}
  /></div>{
    /* Deep-copied elements preview */
  }<div style={{ background: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.82rem" }}><div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}><Check size={14} color="#16a34a" /><span>Deep Copied Attributes from Prototype:</span></div><div style={{ color: "#475569" }}><div>• <strong>Speakers ({speakers.length}):</strong> {speakers.length > 0 ? speakers.join(", ") : "None configured"}</div><div>• <strong>Sponsors ({sponsors.length}):</strong> {sponsors.length > 0 ? sponsors.join(", ") : "None configured"}</div><div>• <strong>Category & Capacity:</strong> {event.category} • {event.capacity} seats</div><div>• <strong>Status Reset:</strong> Clean DRAFT (0 registered attendees)</div></div></div><div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}><button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button><button type="submit" className="btn-primary" disabled={loading}><Copy size={16} />{loading ? "Cloning Event..." : "Duplicate Event (Clone)"}</button></div></form></div></div>;
};
