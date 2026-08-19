import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EventCard, EventCardData } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { CreateEventModal } from './components/CreateEventModal';
import { ContactOrganizerModal } from './components/ContactOrganizerModal';
import { LoginModal } from './components/LoginModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DesignPatternExplorer } from './components/DesignPatternExplorer';
import { StudentDashboard } from './pages/StudentDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { api } from './services/api';
import { Filter, Search } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('explore');
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [selectedCollegeId, setSelectedCollegeId] = useState('ALL');

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState<EventCardData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [contactEvent, setContactEvent] = useState<EventCardData | null>(null);

  const categories = ['Technical', 'Cultural', 'Sports', 'Literary', 'Workshop', 'Management', 'Social', 'Arts'];

  const loadEvents = async () => {
    try {
      const res = await api.getEligibleEvents();
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const loadColleges = async () => {
    try {
      const res = await api.getColleges();
      if (res.success) setColleges(res.data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    loadEvents();
    loadColleges();
    loadNotifications();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.organizingCollegeName && e.organizingCollegeName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesType = selectedEventType === 'ALL' || e.eventType === selectedEventType;
    const matchesCollege = selectedCollegeId === 'ALL' || e.collegeId === Number(selectedCollegeId);

    return matchesSearch && matchesCat && matchesType && matchesCollege;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLoginModal={() => setIsLoginModalOpen(true)}
        toggleNotifDrawer={() => {
          setIsNotifDrawerOpen(!isNotifDrawerOpen);
          if (!isNotifDrawerOpen) loadNotifications();
        }}
        unreadCount={unreadCount}
      />

      {isNotifDrawerOpen && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setIsNotifDrawerOpen(false)}
          onRefresh={loadNotifications}
        />
      )}

      <main style={{ flex: 1 }}>
        {activeTab === 'explore' && (
          <div>
            <HeroSection
              onExploreClick={() => {
                const el = document.getElementById('events-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onLoginClick={() => setIsLoginModalOpen(true)}
            />

            <div id="events-catalog" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                  Institutional Events Feed
                </h2>
                {user && (user.role === 'EVENT_ORGANIZER' || user.role === 'PLATFORM_ADMIN') && (
                  <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    + Create & Publish Event
                  </button>
                )}
              </div>

              {/* Filter Bar */}
              <div className="filter-bar">
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    className="search-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="Search by event title, keyword, or college..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="select-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  className="select-input"
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                >
                  <option value="ALL">All Event Types</option>
                  <option value="INTER_COLLEGE">Inter-College</option>
                  <option value="INTRA_COLLEGE">Intra-College (Restricted)</option>
                </select>

                <select
                  className="select-input"
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                >
                  <option value="ALL">All Colleges</option>
                  {colleges.map((c) => (
                    <option key={c.collegeId} value={c.collegeId}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Events Grid */}
              {filteredEvents.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <Filter size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p>No matching events found for selected filters.</p>
                </div>
              ) : (
                <div className="events-grid">
                  {filteredEvents.map((evt) => (
                    <EventCard key={evt.eventId} event={evt} onSelect={setSelectedEvent} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my_registrations' && <StudentDashboard />}
        {activeTab === 'organizer_dashboard' && <OrganizerDashboard />}
        {activeTab === 'admin_dashboard' && <AdminDashboard />}
        {activeTab === 'pattern_explorer' && <DesignPatternExplorer />}
      </main>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: 'auto' }}>
        EventBridge Inter-College Discovery & Registration Platform • Software Engineering Architecture Project 2026
      </footer>

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRefresh={loadEvents}
        onOpenContact={(e) => setContactEvent(e)}
        onOpenLogin={() => {
          setSelectedEvent(null);
          setIsLoginModalOpen(true);
        }}
      />

      {isCreateModalOpen && (
        <CreateEventModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            loadEvents();
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}

      {contactEvent && (
        <ContactOrganizerModal event={contactEvent} onClose={() => setContactEvent(null)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
