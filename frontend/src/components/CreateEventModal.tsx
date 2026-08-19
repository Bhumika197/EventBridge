import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, MapPin, Tag, Users, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    eventType: 'INTER_COLLEGE',
    date: '2026-10-15',
    startTime: '09:00',
    endTime: '17:00',
    venue: '',
    registrationDeadline: '2026-10-10T23:59',
    capacity: 100,
    registrationFee: 0,
    eligibilityDescription: 'Open to all eligible students.'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.createEvent(formData);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to create event.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          <Sparkles size={18} />
          <span>Factory Method & Abstract Factory Instantiation</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
          Create New College Event
        </h2>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Event Title *</label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%' }}
              required
              placeholder="e.g. Inter-College Hackathon 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Category *</label>
              <select
                className="select-input"
                style={{ width: '100%' }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Literary">Literary</option>
                <option value="Arts">Arts</option>
                <option value="Management">Management</option>
                <option value="Workshop">Workshop</option>
                <option value="Social/Community">Social/Community</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Event Type *</label>
              <select
                className="select-input"
                style={{ width: '100%' }}
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
              >
                <option value="INTER_COLLEGE">INTER_COLLEGE (Open to multiple colleges)</option>
                <option value="INTRA_COLLEGE">INTRA_COLLEGE (Organizing College ONLY)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Event Description *</label>
            <textarea
              className="search-input"
              style={{ width: '100%', minHeight: '80px' }}
              required
              placeholder="Detailed schedule and rules..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Date *</label>
              <input
                type="date"
                className="search-input"
                style={{ width: '100%' }}
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Start Time *</label>
              <input
                type="time"
                className="search-input"
                style={{ width: '100%' }}
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>End Time *</label>
              <input
                type="time"
                className="search-input"
                style={{ width: '100%' }}
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Venue *</label>
              <input
                type="text"
                className="search-input"
                style={{ width: '100%' }}
                required
                placeholder="e.g. Auditorium Block A"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Registration Deadline *</label>
              <input
                type="datetime-local"
                className="search-input"
                style={{ width: '100%' }}
                required
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Capacity Limit *</label>
              <input
                type="number"
                className="search-input"
                style={{ width: '100%' }}
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Registration Fee ($)</label>
              <input
                type="number"
                className="search-input"
                style={{ width: '100%' }}
                min={0}
                value={formData.registrationFee}
                onChange={(e) => setFormData({ ...formData, registrationFee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
