import { Bell, Check, X } from "lucide-react";
import { api } from "../services/api";
export const NotificationDrawer = ({ notifications, onClose, onRefresh }) => {
  const markRead = async (id) => {
    await api.markNotificationRead(id);
    onRefresh();
  };
  return <div className="notif-drawer"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #e2e8f0" }}><div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}><Bell size={16} style={{ color: "#4f46e5" }} /><span>Notifications</span></div><button onClick={onClose} style={{ background: "transparent", color: "#94a3b8", display: "flex", alignItems: "center" }}><X size={16} /></button></div>{notifications.length === 0 ? <div style={{ textAlign: "center", color: "#94a3b8", padding: "2.5rem 1rem", fontSize: "0.85rem" }}>
          No new notifications.
        </div> : <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>{notifications.map((n) => <div
    key={n.notificationId}
    className={`notif-item ${n.readStatus === 0 ? "unread" : ""}`}
  ><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}><span style={{ fontWeight: 650, color: "#0f172a", fontSize: "0.82rem" }}>{n.type}</span><span style={{ fontSize: "0.68rem", color: "#4f46e5", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "#eef2ff", fontWeight: 600 }}>{n.channel}</span></div><p style={{ color: "#475569", fontSize: "0.82rem", lineHeight: "1.4" }}>{n.message}</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.45rem" }}><span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>{n.readStatus === 0 && <button
    onClick={() => markRead(n.notificationId)}
    style={{ background: "transparent", color: "#059669", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: 600 }}
  ><Check size={12} />
                    Mark Read
                  </button>}</div></div>)}</div>}</div>;
};
