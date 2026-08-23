import React, { useState } from 'react';
import { EventCardData } from './EventCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Calendar, MapPin, Building, AlertTriangle, CheckCircle, Mail, Info, LogIn, Users, Clock } from 'lucide-react';

interface EventDetailModalProps {
  event: EventCardData | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenContact: (event: EventCardData) => void;
  onOpenLogin?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onRefresh,
  onOpenContact,
  onOpenLogin
}) => {
  const { user } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [validationError, setValidationError] = useState<{ message: string; handlerName?: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!event) return null;

  const isFull = event.currentRegistrations >= event.capacity;
  const isCancelled = event.status === 'CANCELLED';
  const isExpired = new Date(event.registrationDeadline).getTime() < Date.now();
  const isNotEligible = event.eventType === 'INTRA_COLLEGE' && user && user.role === 'STUDENT' && user.collegeId !== event.collegeId;

  const handleRegister = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }

    setRegistering(true);
    setValidationError(null);
    setSuccessMessage(null);

    try {
      const res = await api.registerForEvent(event.eventId);
      if (res.success) {
        if (res.status === 'WAITLISTED') {
          setSuccessMessage(`Capacity reached: You are on the waitlist at queue position #${res.queuePosition}. You will be auto-promoted and notified if a confirmed attendee cancels!`);
        } else {
          setSuccessMessage('Registration confirmed! Confirmation notification has been recorded.');
        }
        onRefresh();
      } else {
        setValidationError({
          message: res.reason || res.message || 'Registration rejected by validation chain.',
          handlerName: res.handlerName
        });
      }
    } catch (err: any) {
      setValidationError({
        message: err.message || 'Registration failed.'
      });
    } finally {
      setRegistering(false);
    }
  };

  const renderRegisterButton = () => {
    if (!user) {
      return (
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          onClick={() => { if (onOpenLogin) onOpenLogin(); }}
        >
          <LogIn size={18} />
          Sign In to Register
        </button>
      );
    }

    if (isCancelled) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.6, width: '100%' }}>EVENT CANCELLED</button>;
    }
    if (event.isRegistered) {
      return <button className="btn-secondary" disabled style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', width: '100%', fontWeight: 600 }}>CONFIRMED (REGISTERED)</button>;
    }
    if (isNotEligible) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.8, color: '#dc2626', background: '#fef2f2', width: '100%' }}>NOT ELIGIBLE (INTRA-COLLEGE RESTRICTED)</button>;
    }
    if (isExpired) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.8, color: '#854d0e', background: '#fef9c3', width: '100%' }}>REGISTRATION DEADLINE EXPIRED</button>;
    }

    if (isFull) {
      return (
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', background: '#d97706', borderColor: '#b45309' }}
          onClick={handleRegister}
          disabled={registering}
        >
          <Clock size={18} />
          {registering ? 'Joining Waitlist...' : `Event Full — Join Waitlist (Queue #${(event.waitlistCount || 0) + 1})`}
        </button>
      );
    }

    return (
      <button
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
        onClick={handleRegister}
        disabled={registering}
      >
        <CheckCircle size={18} />
        {registering ? 'Processing Registration...' : 'Register for Event'}
      </button>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge badge-${event.category.toLowerCase()}`}>{event.category}</span>
              <span className={`badge ${event.eventType === 'INTER_COLLEGE' ? 'badge-inter' : 'badge-intra'}`}>
                {event.eventType === 'INTER_COLLEGE' ? 'Inter-College' : 'Intra-College'}
              </span>
              <span className={`badge ${event.status === 'PUBLISHED' ? 'badge-confirmed' : 'badge-pending'}`}>
                {event.status}
              </span>
              {isFull && (
                <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                  Waitlist Active ({(event.waitlistCount || 0)} Queued)
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>{event.title}</h2>
          </div>
          <button className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Alerts */}
        {validationError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Registration Restricted</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{validationError.message}</p>
                {validationError.handlerName && (
                  <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                    Handler: {validationError.handlerName}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Success!</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Calendar size={18} color="var(--primary-color)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date & Time</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.date} | {event.startTime} - {event.endTime}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <MapPin size={18} color="var(--primary-color)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Venue</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.venue}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Building size={18} color="var(--primary-color)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Organizing College</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.organizingCollegeName || 'University'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Users size={18} color="var(--primary-color)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Capacity & Attendance</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {event.currentRegistrations} / {event.capacity} Filled
                {isFull && <span style={{ color: '#d97706', marginLeft: '6px' }}>(Waitlist Active)</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About This Event</h4>
          <p style={{ lineHeight: 1.6, color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-line' }}>{event.description}</p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eligibility & Requirements</h4>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
            {event.eligibilityDescription || 'Open to all enrolled students meeting standard academic guidelines.'}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registration Fee:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: event.registrationFee === 0 ? 'var(--success-color)' : 'var(--text-primary)' }}>
              {event.registrationFee === 0 ? 'FREE' : `₹${event.registrationFee}`}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registration Deadline:</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isExpired ? '#dc2626' : 'var(--text-primary)' }}>
              {event.registrationDeadline}
            </div>
          </div>

          <button
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => onOpenContact(event)}
          >
            <Mail size={16} /> Contact Organizer
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {renderRegisterButton()}
        </div>
      </div>
    </div>
  );
};
