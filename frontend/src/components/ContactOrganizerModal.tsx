import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle } from 'lucide-react';
import { EventCardData } from './EventCard';
import { api } from '../services/api';

interface ContactOrganizerModalProps {
  event: EventCardData | null;
  onClose: () => void;
}

export const ContactOrganizerModal: React.FC<ContactOrganizerModalProps> = ({ event, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.contactOrganizer(event.eventId, { subject, message });
      if (res.success) {
        setSent(true);
      } else {
        setError(res.message || 'Failed to send inquiry.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
          <Mail size={18} />
          <span>Organizer Direct Channel</span>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          Contact Event Organizer
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Event: <strong style={{ color: '#fff' }}>{event.title}</strong> ({event.organizingCollegeName})
        </p>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Inquiry Sent Successfully!</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              The organizer will receive your notification and respond via your registered student email.
            </p>
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: '6px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Subject *</label>
              <input
                type="text"
                className="search-input"
                style={{ width: '100%' }}
                required
                placeholder="e.g. Question about team size or prerequisite requirements"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Message / Inquiry *</label>
              <textarea
                className="search-input"
                style={{ width: '100%', minHeight: '110px' }}
                required
                placeholder="Write your query clearly..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
