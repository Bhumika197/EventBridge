import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { X, AlertCircle } from "lucide-react";
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d2 = new Date(year, month, day);
      return d2.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
export const EventDetailModal = ({
  event,
  onClose,
  onRefresh,
  onOpenContact,
  onOpenLogin
}) => {
  const { user } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  if (!event) return null;
  const isFull = event.currentRegistrations >= event.capacity;
  const isCancelled = event.status === "CANCELLED";
  const isExpired = new Date(event.registrationDeadline).getTime() < Date.now();
  const isNotEligible = event.eventType === "INTRA_COLLEGE" && user && user.role === "STUDENT" && user.collegeId !== event.collegeId;
  const spotsLeft = Math.max(0, event.capacity - event.currentRegistrations);
  const handleRegister = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    setRegistering(true);
    setValidationError(null);
    setSuccessMessage(null);
    try {
      const res = await api.registerForEvent(event.eventId);
      if (res.success) {
        if (res.status === "WAITLISTED") {
          setSuccessMessage(`Capacity reached. You are on the waitlist at queue position #${res.queuePosition}. You will be auto-promoted and notified if a confirmed attendee cancels.`);
        } else {
          setSuccessMessage("Registration confirmed! A confirmation email and notification have been issued.");
        }
        onRefresh();
      } else {
        setValidationError({
          message: res.reason || res.message || "Registration rejected by validation rules.",
          handlerName: res.handlerName
        });
      }
    } catch (err) {
      setValidationError({
        message: err.message || "Registration failed."
      });
    } finally {
      setRegistering(false);
    }
  };
  const renderRegisterButton = () => {
    if (!user) {
      return <button
        className="btn-primary"
        style={{ padding: "0.65rem 1.4rem" }}
        onClick={() => {
          if (onOpenLogin) onOpenLogin();
        }}
      >
          Sign In to Register
        </button>;
    }
    if (isCancelled) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
          Event Cancelled
        </button>;
    }
    if (event.isRegistered) {
      return <button className="btn-secondary" disabled style={{ background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0", fontWeight: 600 }}>
          Confirmed (Registered)
        </button>;
    }
    if (isNotEligible) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.8, color: "#dc2626", background: "#fef2f2", borderColor: "#fecaca" }}>
          Restricted to Host Campus
        </button>;
    }
    if (isExpired) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.8, color: "#854d0e", background: "#fefce8", borderColor: "#fef08a" }}>
          Registration Closed
        </button>;
    }
    if (isFull) {
      return <button
        className="btn-primary"
        style={{ padding: "0.65rem 1.4rem" }}
        onClick={handleRegister}
        disabled={registering}
      >{registering ? "Joining Waitlist..." : `Join Waitlist (Queue #${(event.waitlistCount || 0) + 1})`}</button>;
    }
    return <button
      className="btn-primary"
      style={{ padding: "0.65rem 1.4rem" }}
      onClick={handleRegister}
      disabled={registering}
    >{registering ? "Confirming..." : "Register for Event"}</button>;
  };
  return <div className="modal-overlay" onClick={onClose}><div
    className="modal-content"
    style={{ maxWidth: "640px", width: "92%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}
    onClick={(e) => e.stopPropagation()}
  >{
    /* Close Button */
  }<button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>{
    /* Top Eyebrow: Category & Scope */
  }<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 650, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "0.6rem" }}><span style={{ color: "var(--palette-rich)" }}>{event.category}</span><span style={{ color: "var(--palette-border-hover)" }}>•</span><span style={{ color: "var(--text-dim)" }}>{event.eventType === "INTER_COLLEGE" ? "Inter-College" : "Host Campus Only"}</span>{event.isRegistered ? <><span style={{ color: "var(--palette-border-hover)" }}>•</span><span style={{ color: "var(--success)", fontWeight: 700 }}>Registered</span></> : isFull ? <><span style={{ color: "var(--palette-border-hover)" }}>•</span><span style={{ color: "var(--warning)", fontWeight: 600 }}>Waitlist Active ({event.waitlistCount || 0} queued)</span></> : null}</div>{
    /* Title & Host */
  }<h2 style={{ fontSize: "1.45rem", fontWeight: 750, color: "var(--text-main)", margin: "0 0 0.3rem 0", letterSpacing: "-0.02em", lineHeight: 1.3, paddingRight: "2rem" }}>{event.title}</h2><div style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontWeight: 550, marginBottom: "1.35rem" }}>{event.organizingCollegeName || `College #${event.collegeId}`}</div>{
    /* Dynamic Alerts */
  }{validationError && <div style={{ background: "var(--danger-light)", border: "1px solid #fecaca", color: "#991b1b", padding: "0.85rem 1rem", borderRadius: "8px", marginBottom: "1.25rem" }}><div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}><AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} /><div><strong style={{ fontSize: "0.88rem" }}>Registration Restricted</strong><p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", lineHeight: 1.45 }}>{validationError.message}</p>{validationError.handlerName && <span style={{ display: "inline-block", marginTop: "0.4rem", fontSize: "0.72rem", background: "#fee2e2", padding: "2px 8px", borderRadius: "4px", color: "#7f1d1d" }}>
                    Rule: {validationError.handlerName}</span>}</div></div></div>}{successMessage && <div style={{ background: "var(--success-light)", border: "1px solid #bbf7d0", color: "#166534", padding: "0.85rem 1rem", borderRadius: "8px", marginBottom: "1.25rem" }}><strong style={{ fontSize: "0.88rem", display: "block", marginBottom: "0.2rem" }}>Registration Successful</strong><p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.45 }}>{successMessage}</p></div>}{
    /* Schedule & Logistics Grid */
  }<div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "1rem",
      background: "var(--palette-surface)",
      border: "1px solid var(--palette-border)",
      padding: "1.1rem 1.25rem",
      borderRadius: "10px",
      marginBottom: "1.35rem"
    }}
  ><div><div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-dim)", fontWeight: 650, marginBottom: "0.25rem" }}>
              Date & Time
            </div><div style={{ fontSize: "0.9rem", fontWeight: 650, color: "var(--text-main)" }}>{formatDisplayDate(event.date)}</div><div style={{ fontSize: "0.82rem", color: "var(--text-dim)", marginTop: "0.15rem" }}>{event.startTime} – {event.endTime}</div></div><div><div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-dim)", fontWeight: 650, marginBottom: "0.25rem" }}>
              Venue
            </div><div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", lineHeight: 1.4 }}>{event.venue}</div></div><div><div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-dim)", fontWeight: 650, marginBottom: "0.25rem" }}>
              Attendance
            </div><div style={{ fontSize: "0.9rem", fontWeight: 650, color: "var(--text-main)" }}>{event.currentRegistrations} of {event.capacity} seats filled
            </div><div style={{ fontSize: "0.82rem", color: isFull ? "var(--warning)" : "var(--success)", marginTop: "0.15rem", fontWeight: 550 }}>{isFull ? "Waitlist open" : `${spotsLeft} spots available`}</div></div><div><div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-dim)", fontWeight: 650, marginBottom: "0.25rem" }}>
              Registration Deadline
            </div><div style={{ fontSize: "0.9rem", fontWeight: 650, color: isExpired ? "var(--danger)" : "var(--text-main)" }}>{formatDisplayDate(event.registrationDeadline)}</div><div style={{ fontSize: "0.82rem", color: isExpired ? "var(--danger)" : "var(--text-dim)", marginTop: "0.15rem" }}>{isExpired ? "Closed" : "Accepting registrations"}</div></div></div>{
    /* Prize Pool & Team Size */
  }{(Boolean(event.prizePool && event.prizePool > 0) || Boolean(event.minTeamSize)) && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem", marginBottom: "1.35rem" }}>{Boolean(event.prizePool && event.prizePool > 0) && <div style={{ background: "#ffffff", border: "1px solid var(--palette-border)", borderRadius: "8px", padding: "0.85rem 1rem" }}><span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--palette-rich)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Prize Pool</span><div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--palette-deep)", marginTop: "0.2rem", letterSpacing: "-0.02em" }}>
                  ₹{event.prizePool.toLocaleString()}</div></div>}{event.minTeamSize && <div style={{ background: "#ffffff", border: "1px solid var(--palette-border)", borderRadius: "8px", padding: "0.85rem 1rem" }}><span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--palette-rich)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Team Participation</span><div style={{ fontSize: "1.15rem", fontWeight: 750, color: "var(--palette-deep)", marginTop: "0.2rem" }}>{event.minTeamSize === event.maxTeamSize ? `${event.minTeamSize} member` : `${event.minTeamSize} \u2013 ${event.maxTeamSize} members`}</div></div>}</div>}{
    /* About Event */
  }<div style={{ marginBottom: "1.35rem" }}><h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.45rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            About This Event
          </h4><p style={{ lineHeight: 1.6, color: "var(--text-main)", margin: 0, fontSize: "0.92rem", whiteSpace: "pre-line" }}>{event.description}</p></div>{
    /* Eligibility */
  }<div style={{ marginBottom: "1.35rem" }}><h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.45rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            Eligibility & Requirements
          </h4><div style={{ background: "var(--palette-surface)", border: "1px solid var(--palette-border)", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{event.eligibilityDescription || "Open to all enrolled students meeting standard academic guidelines."}</div></div>{
    /* Speakers List */
  }{event.speakers && event.speakers.length > 0 && <div style={{ marginBottom: "1.35rem" }}><h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
              Distinguished Speakers & Guests
            </h4><div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>{event.speakers.map((spk, idx) => <span key={idx} style={{ background: "var(--palette-subtle)", color: "var(--palette-deep)", fontSize: "0.82rem", padding: "0.35rem 0.75rem", borderRadius: "6px", border: "1px solid var(--palette-border)", fontWeight: 600 }}>{spk}</span>)}</div></div>}{
    /* Sponsors List */
  }{event.sponsors && event.sponsors.length > 0 && <div style={{ marginBottom: "1.5rem" }}><h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
              Official Sponsors & Partners
            </h4><div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>{event.sponsors.map((sps, idx) => <span key={idx} style={{ background: "var(--palette-subtle)", color: "var(--text-muted)", fontSize: "0.82rem", padding: "0.35rem 0.75rem", borderRadius: "6px", border: "1px solid var(--palette-border)", fontWeight: 550 }}>{sps}</span>)}</div></div>}{
    /* Footer Actions */
  }<div
    style={{
      marginTop: "1.75rem",
      paddingTop: "1.25rem",
      borderTop: "1px solid var(--palette-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem"
    }}
  ><div><div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-dim)", fontWeight: 650 }}>
              Registration Fee
            </div><div style={{ fontSize: "1.25rem", fontWeight: 800, color: event.registrationFee === 0 ? "var(--success)" : "var(--palette-deep)" }}>{event.registrationFee === 0 ? "Free" : `\u20B9${event.registrationFee}`}</div></div><div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><button
    className="btn-secondary"
    onClick={() => onOpenContact(event)}
    style={{ padding: "0.65rem 1.15rem" }}
  >
              Contact Organizer
            </button>{renderRegisterButton()}</div></div></div></div>;
};
