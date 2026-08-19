import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreateEventModal } from '../components/CreateEventModal';
import { Calendar, Plus, Users, Megaphone, AlertCircle, Edit, Ban, CheckCircle, Eye } from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Selected event for participant view
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  // Announcement state
  const [announcementEventId, setAnnouncementEventId] = useState<number | null>(null);
  const [announcementMsg, setAnnouncementMsg] = useState('');

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

  const handleViewParticipants = async (eventId: number) => {
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

  const handleCancelEvent = async (eventId: number) => {
    const reason = window.prompt('Enter reason for cancelling event:');
    if (reason) {
      try {
        await api.cancelEvent(eventId, reason);
        alert('Event cancelled. Observer Pattern notified all registered students!');
        loadOrganizerEvents();
      } catch (err: any) {
        alert(err.message || 'Failed to cancel event.');
      }
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementEventId || !announcementMsg) return;
    try {
      await api.sendAnnouncement(announcementEventId, announcementMsg);
      alert('Announcement sent to registered students via Bridge Notification Pattern!');
      setAnnouncementEventId(null);
      setAnnouncementMsg('');
    } catch (err: any) {
      alert(err.message || 'Failed to send announcement.');
    }
  };

  const totalRegistrations = events.reduce((acc, e) => acc + e.currentRegistrations, 0);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            Event Organizer Management Desk
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            College: {user?.collegeName || `College #${user?.collegeId}`} • Organizer: {user?.name}
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          Create New Event
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Organized Events</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>{events.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Active Published Events</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {events.filter(e => e.status !== 'CANCELLED' && e.status !== 'COMPLETED').length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Student Registrations</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.2rem' }}>{totalRegistrations}</div>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
          My Managed Events
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading organized events...</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            You haven't created any events yet. Click "Create New Event" above to publish your first event!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>Event Title</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Type</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Enrolled</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.eventId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}>{event.title}</td>
                    <td style={{ padding: '0.75rem', color: '#a5b4fc' }}>{event.category}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={event.eventType === 'INTRA_COLLEGE' ? 'badge badge-intra' : 'badge badge-inter'}>
                        {event.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{event.date}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#06b6d4' }}>
                      {event.currentRegistrations} / {event.capacity}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={event.status === 'CANCELLED' ? 'badge badge-full' : 'badge badge-open'}>
                        {event.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                          onClick={() => handleViewParticipants(event.eventId)}
                        >
                          <Users size={14} />
                          Participants
                        </button>

                        <button
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: '#a5b4fc' }}
                          onClick={() => setAnnouncementEventId(event.eventId)}
                        >
                          <Megaphone size={14} />
                          Announce
                        </button>

                        {event.status !== 'CANCELLED' && (
                          <button
                            className="btn-danger"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                            onClick={() => handleCancelEvent(event.eventId)}
                          >
                            <Ban size={14} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Participants List View */}
      {selectedEventId && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              Enrolled Participant Roster for Event #{selectedEventId}
            </h3>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }} onClick={() => setSelectedEventId(null)}>Close Roster</button>
          </div>

          {participants.length === 0 ? (
            <div style={{ color: '#64748b', padding: '1rem' }}>No student registrations recorded yet for this event.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.5rem' }}>Student Name</th>
                    <th style={{ padding: '0.5rem' }}>Email</th>
                    <th style={{ padding: '0.5rem' }}>Home Institution</th>
                    <th style={{ padding: '0.5rem' }}>Dept & Year</th>
                    <th style={{ padding: '0.5rem' }}>Registration Date</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.registrationId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: '#fff' }}>{p.studentName}</td>
                      <td style={{ padding: '0.5rem', color: '#94a3b8' }}>{p.studentEmail}</td>
                      <td style={{ padding: '0.5rem', color: '#06b6d4' }}>{p.studentCollegeName}</td>
                      <td style={{ padding: '0.5rem', color: '#94a3b8' }}>{p.studentDepartment || 'General'} (Year {p.studentYear || 1})</td>
                      <td style={{ padding: '0.5rem', color: '#64748b' }}>{new Date(p.registeredAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span className="badge badge-registered">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Announcement Modal */}
      {announcementEventId && (
        <div className="modal-overlay" onClick={() => setAnnouncementEventId(null)}>
          <div className="glass-panel modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
              Broadcast Announcement to Enrolled Students
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
              This will trigger Observer Pattern notification dispatch across all registered student channels.
            </p>

            <form onSubmit={handleSendAnnouncement}>
              <textarea
                className="search-input"
                style={{ width: '100%', minHeight: '100px', marginBottom: '1rem' }}
                required
                placeholder="Enter announcement details (e.g., Change of room, mandatory requirements, schedule shift)..."
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setAnnouncementEventId(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Send Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadOrganizerEvents}
        />
      )}
    </div>
  );
};
