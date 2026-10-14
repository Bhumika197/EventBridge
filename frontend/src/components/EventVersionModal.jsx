import { useState, useEffect } from "react";
import { X, RotateCcw, Save, History, AlertTriangle } from "lucide-react";
import { api } from "../services/api";
export const EventVersionModal = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: event.title || "",
    venue: event.venue || "",
    date: event.date || "",
    startTime: event.startTime || "09:00 AM",
    endTime: event.endTime || "05:00 PM",
    registrationDeadline: event.registrationDeadline || "",
    capacity: event.capacity || 100,
    registrationFee: event.registrationFee || 0,
    description: event.description || ""
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const loadHistory = async () => {
    try {
      const res = await api.getEventHistory(event.eventId);
      if (res && res.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.warn("Failed to load version history:", err);
    }
  };
  useEffect(() => {
    loadHistory();
  }, [event.eventId]);
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.updateEvent(event.eventId, formData);
      if (res && res.success) {
        setMessage({
          text: "Event updated! Memento Pattern recorded an immutable state snapshot to the history stack.",
          type: "success"
        });
        loadHistory();
        onSuccess();
      } else {
        setMessage({ text: res.message || "Update failed.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: err.message || "Server error while updating event.", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  const handleUndo = async () => {
    if (!window.confirm("Undo the most recent edit and restore the previous snapshot state?")) {
      return;
    }
    setUndoLoading(true);
    setMessage(null);
    try {
      const res = await api.undoEventEdit(event.eventId);
      if (res && res.success && res.data) {
        const restored = res.data;
        setFormData({
          title: restored.title || "",
          venue: restored.venue || "",
          date: restored.date || "",
          startTime: restored.startTime || "09:00 AM",
          endTime: restored.endTime || "05:00 PM",
          registrationDeadline: restored.registrationDeadline || "",
          capacity: restored.capacity || 100,
          registrationFee: restored.registrationFee || 0,
          description: restored.description || ""
        });
        setMessage({
          text: "Restored! Memento Pattern popped the previous snapshot from history and reinstated event parameters.",
          type: "success"
        });
        loadHistory();
        onSuccess();
      } else {
        setMessage({ text: res.message || "No previous snapshot found to undo.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: err.message || "Undo operation failed.", type: "error" });
    } finally {
      setUndoLoading(false);
    }
  };
  return <div className="modal-overlay" onClick={onClose}><div
    className="glass-panel modal-content"
    style={{ maxWidth: "720px", width: "92%", maxHeight: "90vh", overflowY: "auto", background: "#ffffff", color: "#0f172a" }}
    onClick={(e) => e.stopPropagation()}
  ><button className="modal-close" onClick={onClose}><X size={24} style={{ color: "#0f172a" }} /></button><div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}><span className="badge badge-inter" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><History size={13} />
            Memento Pattern: State History & Undo
          </span><span style={{ fontSize: "0.8rem", color: "#64748b" }}>Event #{event.eventId} Management</span></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}><h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Edit & Version History: "{event.title}"
          </h2>{
    /* Real Undo Button */
  }<button
    type="button"
    className="btn-secondary"
    disabled={undoLoading || history.length === 0}
    onClick={handleUndo}
    style={{
      borderColor: "#f59e0b",
      color: "#b45309",
      background: "#fffbeb",
      fontWeight: 700,
      padding: "0.4rem 0.85rem"
    }}
    title="Restore previous version snapshot via Memento Pattern"
  ><RotateCcw size={15} />{undoLoading ? "Restoring..." : `Undo Last Edit (${history.length} snapshots)`}</button></div>{
    /* Informational Banner */
  }<div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", borderLeft: "4px solid #f59e0b", marginBottom: "1.25rem", fontSize: "0.85rem", color: "#475569" }}><strong>Accidental Edit Safeguard:</strong> Every time you save changes, the <code>EventHistoryCaretaker</code> pushes an immutable snapshot onto the Memento stack. If you accidentally adjust the registration deadline or venue, click <strong>"Undo Last Edit"</strong> to immediately revert.
        </div>{message && <div
    style={{
      padding: "0.75rem 1rem",
      borderRadius: "6px",
      background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${message.type === "success" ? "#86efac" : "#fca5a5"}`,
      color: message.type === "success" ? "#166534" : "#991b1b",
      fontSize: "0.85rem",
      marginBottom: "1.25rem"
    }}
  >{message.text}</div>}<form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
              Event Title
            </label><input
    type="text"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
  /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Event Date
              </label><input
    type="date"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={formData.date}
    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
  /></div><div style={{ background: "#fef3c7", padding: "0.5rem", borderRadius: "6px", border: "1px solid #fde68a" }}><label style={{ fontSize: "0.84rem", fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.35rem" }}><AlertTriangle size={14} /> Registration Deadline (Critical Field)
              </label><input
    type="date"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #d97706", fontWeight: 600 }}
    required
    value={formData.registrationDeadline}
    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
  /></div></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Venue & Hall
              </label><input
    type="text"
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={formData.venue}
    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
  /></div><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Seat Capacity
              </label><input
    type="number"
    min={1}
    className="search-input"
    style={{ width: "100%", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={formData.capacity}
    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
  /></div></div><div><label style={{ fontSize: "0.84rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
              Event Description
            </label><textarea
    className="search-input"
    style={{ width: "100%", minHeight: "80px", background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
    required
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
  /></div>{
    /* Version History Stack List */
  }<div style={{ marginTop: "0.5rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}><h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}><History size={15} color="#2563eb" /><span>Memento Caretaker Version Stack ({history.length} snapshots stored)</span></h4>{history.length === 0 ? <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                No prior snapshots on stack yet. Your next save will create the initial baseline snapshot.
              </p> : <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "120px", overflowY: "auto" }}>{history.map((snap, idx) => <div
    key={snap.id || idx}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.35rem 0.65rem",
      background: "#ffffff",
      borderRadius: "4px",
      border: "1px solid #cbd5e1",
      fontSize: "0.78rem"
    }}
  ><span style={{ fontWeight: 600, color: "#334155" }}>
                      Snapshot #{history.length - idx}: {snap.description}</span><span style={{ color: "#64748b" }}>{new Date(snap.timestamp).toLocaleString()}</span></div>)}</div>}</div><div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}><button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button><button type="submit" className="btn-primary" disabled={loading}><Save size={16} />{loading ? "Saving Snapshot..." : "Save Changes (Push Memento)"}</button></div></form></div></div>;
};
