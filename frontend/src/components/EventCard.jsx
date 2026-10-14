import { useAuth } from "../context/AuthContext";
const formatDisplayDate = (dateStr) => {
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
        day: "numeric"
      });
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
export const EventCard = ({ event, onSelect }) => {
  const { user } = useAuth();
  const isFull = event.currentRegistrations >= event.capacity;
  const isCancelled = event.status === "CANCELLED";
  const isClosed = event.status === "REGISTRATION_CLOSED" || new Date(event.registrationDeadline).getTime() < Date.now();
  const isNotEligible = event.eventType === "INTRA_COLLEGE" && user && user.role === "STUDENT" && user.collegeId !== event.collegeId;
  const spotsLeft = Math.max(0, event.capacity - event.currentRegistrations);
  const percentFilled = Math.min(100, Math.round(event.currentRegistrations / Math.max(1, event.capacity) * 100));
  const readableDate = formatDisplayDate(event.date);
  return <div className="event-card" onClick={() => onSelect(event)} style={{ cursor: "pointer" }}><div>{
    /* Top Eyebrow: Category & Scope */
  }<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}><div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 650, letterSpacing: "0.04em", textTransform: "uppercase" }}><span style={{ color: "var(--palette-rich)" }}>{event.category}</span><span style={{ color: "var(--palette-border-hover)" }}>•</span><span style={{ color: "var(--text-dim)" }}>{event.eventType === "INTER_COLLEGE" ? "Inter-College" : "Host Campus Only"}</span></div>{
    /* Status badge when noteworthy */
  }{event.isRegistered ? <span className="badge badge-registered">Registered</span> : isCancelled ? <span className="badge badge-full">Cancelled</span> : isNotEligible ? <span className="badge badge-full">Intra Only</span> : isFull ? <span className="badge badge-closed">Waitlist Open</span> : null}</div>{
    /* Title */
  }<h3
    style={{
      fontSize: "1.15rem",
      fontWeight: 750,
      lineHeight: 1.35,
      marginBottom: "0.35rem",
      color: "var(--text-main)",
      letterSpacing: "-0.02em"
    }}
  >{event.title}</h3>{
    /* Host Institution */
  }<div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 550, marginBottom: "0.75rem" }}>{event.organizingCollegeName || `College #${event.collegeId}`}</div>{
    /* Description snippet */
  }<p
    style={{
      color: "var(--text-dim)",
      fontSize: "0.85rem",
      lineHeight: 1.5,
      marginBottom: "1rem",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    }}
  >{event.description}</p></div>{
    /* Meta Schedule & Details */
  }<div><div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.82rem", padding: "0.75rem 0", borderTop: "1px solid var(--border-color)" }}>{
    /* Formatted Date & Time */
  }<div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--text-main)", fontWeight: 600 }}><span>{readableDate}</span><span style={{ color: "var(--palette-border-hover)" }}>•</span><span style={{ color: "var(--text-dim)", fontWeight: 450 }}>{event.startTime}</span></div>{
    /* Venue */
  }<div style={{ color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.venue}</div>{
    /* Capacity status */
  }<div style={{ marginTop: "0.45rem" }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "0.3rem", fontWeight: 500 }}><span>{isFull ? "All seats filled (waitlist active)" : spotsLeft <= 10 ? `Only ${spotsLeft} spots left` : `${spotsLeft} spots available`}</span><span>{percentFilled}% filled</span></div><div className="capacity-track"><div
    className="capacity-fill"
    style={{
      width: `${percentFilled}%`,
      background: isFull ? "var(--danger)" : percentFilled > 80 ? "var(--warning)" : "var(--palette-deep)"
    }}
  /></div></div></div>{
    /* Pricing & CTA */
  }<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem", paddingTop: "0.65rem" }}><div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}><span
    style={{
      fontSize: "0.92rem",
      fontWeight: 750,
      color: event.registrationFee > 0 ? "var(--text-main)" : "var(--success)"
    }}
  >{event.registrationFee > 0 ? `\u20B9${event.registrationFee}` : "Free"}</span>{Boolean(event.prizePool && event.prizePool > 0) && <span
    style={{
      fontSize: "0.72rem",
      fontWeight: 600,
      color: "var(--palette-deep)",
      background: "var(--palette-subtle)",
      border: "1px solid var(--palette-border)",
      padding: "0.15rem 0.5rem",
      borderRadius: "9999px"
    }}
  >
                ₹{event.prizePool.toLocaleString()} prize
              </span>}</div><button
    className="btn-primary"
    style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem", borderRadius: "8px" }}
    onClick={(e) => {
      e.stopPropagation();
      onSelect(event);
    }}
  >
            View Event
          </button></div></div></div>;
};
