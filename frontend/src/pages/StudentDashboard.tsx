import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EventCard, EventCardData } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { ContactOrganizerModal } from '../components/ContactOrganizerModal';
import { Search, Filter, Calendar, Sparkles, Building, CheckCircle, Clock, Ban } from 'lucide-react';

interface StudentDashboardProps {
  initialTab?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ initialTab = 'eligible' }) => {
  const { user, colleges } = useAuth();
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active subtab
  const [subTab, setSubTab] = useState<string>(initialTab);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<EventCardData | null>(null);
  const [contactEvent, setContactEvent] = useState<EventCardData | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const resEvents = await api.getEligibleEvents();
      let myRegsRes = { data: [] };
      if (user && user.role === 'STUDENT') {
        myRegsRes = await api.getMyRegistrations();
      }

      if (resEvents.success) {
        const registeredEventIds = new Set((myRegsRes.data || []).map((r: any) => r.eventId));
        const formatted = resEvents.data.map((e: any) => ({
          ...e,
          isRegistered: registeredEventIds.has(e.eventId)
        }));
        setEvents(formatted);
        setMyRegistrations(myRegsRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancelReg = async (regId: number) => {
    if (window.confirm('Are you sure you want to cancel this registration? If a waitlisted student is queued, they will be automatically promoted.')) {
      try {
        const res = await api.cancelRegistration(regId);
        if (res.promotedWaitlistedStudent) {
          alert('Registration cancelled. The next waitlisted student has been automatically promoted to CONFIRMED!');
        } else {
          alert('Registration cancelled successfully.');
        }
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to cancel registration');
      }
    }
  };

  // Filtering Logic
  const filteredEvents = events.filter((e) => {
    // Tab filters
    if (subTab === 'my_college' && user && e.collegeId !== user.collegeId) return false;
    if (subTab === 'inter_college' && e.eventType !== 'INTER_COLLEGE') return false;
    if (subTab === 'registered' && !e.isRegistered) return false;
    if (subTab === 'upcoming' && new Date(e.date).getTime() < Date.now()) return false;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(term);
      const matchCategory = e.category.toLowerCase().includes(term);
      const matchCollege = (e.organizingCollegeName || '').toLowerCase().includes(term);
      if (!matchTitle && !matchCategory && !matchCollege) return false;
    }

    // Dropdown filters
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    if (collegeFilter !== 'ALL' && e.collegeId !== Number(collegeFilter)) return false;
    if (typeFilter !== 'ALL' && e.eventType !== typeFilter) return false;

    return true;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Welcome Banner for logged-in user */}
      {user && (
        <div style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#a5b4fc', fontWeight: 600 }}>
              Authenticated Student Portal
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
              Welcome back, {user.name} 👋
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#94a3b8', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>Institution: <strong style={{ color: '#06b6d4' }}>{user.collegeName || `College #${user.collegeId}`}</strong></span>
              {user.department && <span>Department: <strong>{user.department} (Year {user.year || 1})</strong></span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                {myRegistrations.filter(r => r.status === 'CONFIRMED').length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Confirmed</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                {myRegistrations.filter(r => r.status === 'WAITLISTED').length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Waitlisted</div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Search & Filters Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', paddingLeft: '2.4rem' }}
              placeholder="Search events, keywords, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="select-input"
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Management">Management</option>
              <option value="Literary">Literary</option>
              <option value="Arts">Arts</option>
            </select>
          </div>

          <div>
            <select
              className="select-input"
              style={{ width: '100%' }}
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
            >
              <option value="ALL">All Organizing Colleges</option>
              {colleges.map((c) => (
                <option key={c.collegeId} value={c.collegeId}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="select-input"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Event Scopes</option>
              <option value="INTER_COLLEGE">Inter-College (Open to all)</option>
              <option value="INTRA_COLLEGE">Intra-College (Host college only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <button
          className={`tab-btn ${subTab === 'eligible' ? 'active' : ''}`}
          onClick={() => setSubTab('eligible')}
        >
          All Available Events ({events.length})
        </button>

        {user && (
          <button
            className={`tab-btn ${subTab === 'my_college' ? 'active' : ''}`}
            onClick={() => setSubTab('my_college')}
          >
            My College Events
          </button>
        )}

        <button
          className={`tab-btn ${subTab === 'inter_college' ? 'active' : ''}`}
          onClick={() => setSubTab('inter_college')}
        >
          Inter-College Events
        </button>

        {user && user.role === 'STUDENT' && (
          <button
            className={`tab-btn ${subTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setSubTab('registrations')}
          >
            My Registrations & Waitlist ({myRegistrations.filter(r => r.status !== 'CANCELLED').length})
          </button>
        )}
      </div>

      {/* Main View Area */}
      {subTab === 'registrations' ? (
        /* My Registrations & Waitlist Tab */
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            My Enrolled Events & Waitlist Queue
          </h3>

          {myRegistrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              You have not registered for any events yet. Explore available events to join!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Status / Queue</th>
                    <th style={{ padding: '0.75rem' }}>Event Title</th>
                    <th style={{ padding: '0.75rem' }}>Organizing Institution</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Event Date</th>
                    <th style={{ padding: '0.75rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myRegistrations.map((reg) => (
                    <tr key={reg.registrationId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        {reg.status === 'CONFIRMED' ? (
                          <span className="badge" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                            CONFIRMED
                          </span>
                        ) : reg.status === 'WAITLISTED' ? (
                          <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                            WAITLIST #{reg.queuePosition || 1}
                          </span>
                        ) : (
                          <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                            {reg.status}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}>{reg.eventTitle}</td>
                      <td style={{ padding: '0.75rem', color: '#06b6d4' }}>{reg.organizingCollegeName}</td>
                      <td style={{ padding: '0.75rem', color: '#a5b4fc' }}>{reg.eventCategory}</td>
                      <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{reg.eventDate}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {reg.status !== 'CANCELLED' && (
                          <button
                            className="btn-danger"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => handleCancelReg(reg.registrationId)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Event Cards Grid */
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              Loading events via EventAccessProxy...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No events found matching your filter criteria.
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.eventId}
                  event={event}
                  onSelect={(e) => setSelectedEvent(e)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRefresh={loadData}
        onOpenContact={(e) => {
          setSelectedEvent(null);
          setContactEvent(e);
        }}
      />

      {/* Contact Organizer Modal */}
      <ContactOrganizerModal
        event={contactEvent}
        onClose={() => setContactEvent(null)}
      />
    </div>
  );
};
