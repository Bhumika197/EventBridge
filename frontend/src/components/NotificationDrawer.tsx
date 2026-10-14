import React from 'react';
import { Bell, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export interface NotificationRecord {
  notificationId: number;
  userId: number;
  eventId?: number;
  type: string;
  channel: string;
  message: string;
  readStatus: number;
  createdAt: string;
  eventTitle?: string;
}

interface NotificationDrawerProps {
  notifications: NotificationRecord[];
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ notifications, onClose, onRefresh }) => {
  const markRead = async (id: number) => {
    await api.markNotificationRead(id);
    onRefresh();
  };

  return (
    <div className="glass-panel notif-drawer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
          <Bell size={18} style={{ color: '#6366f1' }} />
          <span>In-App Notifications</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', color: '#94a3b8' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Sparkles size={14} />
        Dispatched via Bridge & Observer Pattern
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0', fontSize: '0.85rem' }}>
          No notifications yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map((n) => (
            <div
              key={n.notificationId}
              className={`notif-item ${n.readStatus === 0 ? 'unread' : ''}`}
              style={{ borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>{n.type}</span>
                <span style={{ fontSize: '0.7rem', color: '#06b6d4', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(6,182,212,0.12)' }}>
                  {n.channel}
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.4' }}>{n.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {n.readStatus === 0 && (
                  <button
                    onClick={() => markRead(n.notificationId)}
                    style={{ background: 'transparent', color: '#10b981', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <Check size={12} />
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
