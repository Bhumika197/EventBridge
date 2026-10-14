import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { api } from "../services/api";
export const ContactOrganizerModal = ({ event, onClose }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  if (!event) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.contactOrganizer(event.eventId, { subject, message });
      if (res.success) {
        setSent(true);
      } else {
        setError(res.message || "Failed to send inquiry.");
      }
    } catch (err) {
      setError(err.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="modal-overlay" onClick={onClose}><div
    className="modal-content"
    style={{ maxWidth: "520px", width: "92%", position: "relative" }}
    onClick={(e) => e.stopPropagation()}
  ><button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button><div style={{ fontSize: "0.75rem", fontWeight: 650, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--palette-rich)", marginBottom: "0.4rem" }}>
          Direct Inquiry
        </div><h3 style={{ fontSize: "1.35rem", fontWeight: 750, color: "var(--text-main)", margin: "0 0 0.35rem 0", letterSpacing: "-0.02em", paddingRight: "2rem" }}>
          Contact Event Organizer
        </h3><p style={{ color: "var(--text-dim)", fontSize: "0.88rem", margin: "0 0 1.25rem 0", lineHeight: 1.45 }}>
          Inquiry regarding <strong style={{ color: "var(--text-main)", fontWeight: 600 }}>{event.title}</strong> ({event.organizingCollegeName})
        </p>{sent ? <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}><CheckCircle size={44} style={{ color: "var(--success)", margin: "0 auto 0.75rem auto" }} /><h4 style={{ color: "var(--text-main)", fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              Inquiry Sent Successfully
            </h4><p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              The event organizer has been notified and will reply to your registered email address.
            </p><button className="btn-secondary" onClick={onClose} style={{ padding: "0.55rem 1.25rem" }}>
              Close
            </button></div> : <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{error && <div style={{ padding: "0.75rem", background: "var(--danger-light)", border: "1px solid #fecaca", color: "#991b1b", borderRadius: "6px", fontSize: "0.85rem" }}>{error}</div>}<div><label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                Subject
              </label><input
    type="text"
    className="search-input"
    style={{ width: "100%", borderRadius: "6px" }}
    required
    placeholder="e.g. Query regarding team eligibility or agenda details"
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
  /></div><div><label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                Message
              </label><textarea
    className="search-input"
    style={{ width: "100%", minHeight: "120px", borderRadius: "6px", resize: "vertical" }}
    required
    placeholder="State your question or inquiry clearly..."
    value={message}
    onChange={(e) => setMessage(e.target.value)}
  /></div><div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}><button type="button" className="btn-secondary" onClick={onClose} style={{ padding: "0.55rem 1.15rem" }}>
                Cancel
              </button><button type="submit" className="btn-primary" disabled={loading} style={{ padding: "0.55rem 1.25rem" }}>{loading ? "Sending..." : "Send Inquiry"}</button></div></form>}</div></div>;
};
