import React from 'react';
import { Calendar, Clock, MapPin, Building, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface EventCardData {
  eventId: number;
  title: string;
  description: string;
  category: string;
  eventType: 'INTRA_COLLEGE' | 'INTER_COLLEGE';
  collegeId: number;
  organizingCollegeName?: string;
  organizerName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  registrationDeadline: string;
  capacity: number;
  currentRegistrations: number;
  registrationFee: number;
  status: string;
  isRegistered?: boolean;
}

interface EventCardProps {
  event: EventCardData;
  onSelect: (event: EventCardData) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const { user } = useAuth();

  const isFull = event.currentRegistrations >= event.capacity;
  const isCancelled = event.status === 'CANCELLED';
  const isClosed = event.status === 'REGISTRATION_CLOSED' || new Date(event.registrationDeadline).getTime() < Date.now();
  const isNotEligible = event.eventType === 'INTRA_COLLEGE' && user && user.role === 'STUDENT' && user.collegeId !== event.collegeId;

  const getStatusBadge = () => {
    if (isCancelled) return <span className="badge badge-full">CANCELLED</span>;
    if (event.isRegistered) return <span className="badge badge-registered">REGISTERED</span>;
    if (isNotEligible) return <span className="badge badge-full">NOT ELIGIBLE</span>;
    if (isFull) return <span className="badge badge-full">EVENT FULL</span>;
    if (isClosed) return <span className="badge badge-closed">REGISTRATION CLOSED</span>;
    return <span className="badge badge-open">OPEN</span>;
  };

  return (
    <div className="glass-panel event-card">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              textTransform: 'uppercase'
            }}
          >
            {event.category}
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <span className={event.eventType === 'INTRA_COLLEGE' ? 'badge badge-intra' : 'badge badge-inter'}>
              {event.eventType === 'INTRA_COLLEGE' ? 'INTRA COLLEGE' : 'INTER COLLEGE'}
            </span>
            {getStatusBadge()}
          </div>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
          {event.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0891b2', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Building size={14} />
          <span>{event.organizingCollegeName || `College #${event.collegeId}`}</span>
        </div>

        <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#475569', padding: '0.75rem 0', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} style={{ color: '#2563eb' }} />
            <span>{event.date} ({event.startTime} - {event.endTime})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={14} style={{ color: '#d97706' }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.venue}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <Users size={14} />
              {event.currentRegistrations} / {event.capacity} Filled
            </span>
            <span style={{ fontWeight: 700, color: event.registrationFee > 0 ? '#d97706' : '#16a34a' }}>
              {event.registrationFee > 0 ? `$${event.registrationFee}` : 'FREE'}
            </span>
          </div>
        </div>

        <button
          className="btn-secondary"
          style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
          onClick={() => onSelect(event)}
        >
          View Details & Register
        </button>
      </div>
    </div>
  );
};
