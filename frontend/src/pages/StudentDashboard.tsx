import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EventCard, EventCardData } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { ContactOrganizerModal } from '../components/ContactOrganizerModal';
import { Search, Filter, Calendar, Sparkles, Building, CheckCircle, Clock } from 'lucide-react';

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
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      try {
        await api.cancelRegistration(regId);
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
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.12))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', color: '#a5b4fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} />
              Welcome back, {user.name}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              Student Portal – {user.collegeName || `College #${user.collegeId}`}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              Department: {user.department || 'General'} • Academic Year: {user.year || 1}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', padding: '0.75rem 1.25rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{myRegistrations.length}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Registrations</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${subTab === 'eligible' ? 'active' : ''}`}
          onClick={() => setSubTab('eligible')}
        >
          All Eligible Events ({events.length})
        </button>
        {user && (
          <button
            className={`tab-btn ${subTab === 'my_college' ? 'active' : ''}`}
            onClick={() => setSubTab('my_college')}
          >
            My College Events ({events.filter(e => e.collegeId === user.collegeId).length})
          </button>
        )}
        <button
          className={`tab-btn ${subTab === 'inter_college' ? 'active' : ''}`}
          onClick={() => setSubTab('inter_college')}
        >
          Inter-College Events ({events.filter(e => e.eventType === 'INTER_COLLEGE').length})
        </button>
        {user && (
          <button
            className={`tab-btn ${subTab === 'registered' ? 'active' : ''}`}
            onClick={() => setSubTab('registered')}
          >
            My Registered ({myRegistrations.length})
          </button>
        )}
        <button
          className={`tab-btn ${subTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setSubTab('upcoming')}
        >
          Upcoming Events
        </button>
      </div>

      {/* Search & Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
            placeholder="Search by event title, category, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        </div>

        <select
          className="select-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Literary">Literary</option>
          <option value="Arts">Arts</option>
          <option value="Management">Management</option>
          <option value="Workshop">Workshop</option>
          <option value="Social/Community">Social/Community</option>
        </select>

        <select
          className="select-input"
          value={collegeFilter}
          onChange={(e) => setCollegeFilter(e.target.value)}
        >
          <option value="ALL">All Colleges</option>
          {colleges.map((c) => (
            <option key={c.collegeId} value={c.collegeId}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="select-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Event Types</option>
          <option value="INTRA_COLLEGE">INTRA_COLLEGE</option>
          <option value="INTER_COLLEGE">INTER_COLLEGE</option>
        </select>
      </div>

      {/* Subtab Registered Table View */}
      {subTab === 'registered' ? (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            My Active Registrations
          </h3>
          {myRegistrations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              You have not registered for any events yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Event Title</th>
                    <th style={{ padding: '0.75rem' }}>Organizing Institution</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Event Date</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myRegistrations.map((reg) => (
                    <tr key={reg.registrationId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}>{reg.eventTitle}</td>
                      <td style={{ padding: '0.75rem', color: '#06b6d4' }}>{reg.organizingCollegeName}</td>
                      <td style={{ padding: '0.75rem', color: '#a5b4fc' }}>{reg.eventCategory}</td>
                      <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{reg.eventDate}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-registered">{reg.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {reg.status !== 'CANCELLED' && (
                          <button
                            className="btn-danger"
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
