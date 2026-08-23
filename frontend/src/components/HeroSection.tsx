import React from 'react';
import { Compass, LogIn, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroSectionProps {
  onExploreClick: () => void;
  onLoginClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onLoginClick }) => {
  const { user } = useAuth();

  return (
    <section className="hero-section">
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.8rem',
          borderRadius: '9999px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}
      >
        <Award size={15} />
        Academic Software Engineering Architecture & Design Patterns
      </div>

      <h1 className="hero-title">
        Discover what's happening across campuses.
      </h1>

      <p className="hero-subtitle">
        Find, explore and participate in college events — all in one place. Discover intra-college activities and inter-college competitions with verified institutional eligibility.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={onExploreClick} style={{ padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}>
          <Compass size={18} />
          Explore Events
        </button>

        {!user && (
          <button className="btn-secondary" onClick={onLoginClick} style={{ padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}>
            <LogIn size={18} />
            Login / Access Accounts
          </button>
        )}
      </div>
    </section>
  );
};
