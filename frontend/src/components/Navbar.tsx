import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, BookOpen, Calendar, Shield, User as UserIcon, LogOut, LogIn, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openLoginModal: () => void;
  toggleNotifDrawer: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openLoginModal,
  toggleNotifDrawer,
  unreadCount
}) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo-container" onClick={() => setActiveTab('explore')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles style={{ color: '#2563eb' }} size={22} />
          <span style={{ color: '#0f172a', fontWeight: 800 }}>EventBridge</span>
        </div>
      </div>

      <div className="nav-links">
        <button
          className={`nav-item ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          <Calendar size={16} />
          Explore Events
        </button>

        {user && user.role === 'STUDENT' && (
          <button
            className={`nav-item ${activeTab === 'my_registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('my_registrations')}
          >
            <UserIcon size={16} />
            My Registrations
          </button>
        )}

        {user && (user.role === 'EVENT_ORGANIZER' || user.role === 'PLATFORM_ADMIN') && (
          <button
            className={`nav-item ${activeTab === 'organizer_dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizer_dashboard')}
          >
            <Calendar size={16} />
            Organizer Desk
          </button>
        )}

        {user && user.role === 'PLATFORM_ADMIN' && (
          <button
            className={`nav-item ${activeTab === 'admin_dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin_dashboard')}
          >
            <Shield size={16} />
            Governance
          </button>
        )}

        <button
          className={`nav-item ${activeTab === 'pattern_explorer' ? 'active' : ''}`}
          style={{ color: '#2563eb', border: '1px solid #bfdbfe', background: '#eff6ff' }}
          onClick={() => setActiveTab('pattern_explorer')}
        >
          <BookOpen size={16} />
          Design Patterns & UML
        </button>

        {user && (
          <button className="nav-item" onClick={toggleNotifDrawer} style={{ position: 'relative', padding: '0.5rem' }}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ textAlign: 'right', maxWidth: '200px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.name}>
                {user.name}
              </div>
              <div
                style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={`${user.collegeName || `College #${user.collegeId}`} • ${user.role}`}
              >
                {user.collegeName ? (user.collegeName.length > 22 ? user.collegeName.substring(0, 20) + '...' : user.collegeName) : `College #${user.collegeId}`} • {user.role}
              </div>
            </div>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.82rem' }} onClick={logout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={openLoginModal} style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
            <LogIn size={16} />
            Login / Accounts
          </button>
        )}
      </div>
    </nav>
  );
};
