import React, { useState } from 'react';
import { EventCardData } from './EventCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Calendar, MapPin, Building, AlertTriangle, CheckCircle, Mail, Info, LogIn } from 'lucide-react';

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
  const isClosed = event.status === 'REGISTRATION_CLOSED' || new Date(event.registrationDeadline).getTime() < Date.now();
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
        setSuccessMessage('Registration successful! Confirmation notice sent via Notification Bridge.');
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
      return <button className="btn-secondary" disabled style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', width: '100%' }}>REGISTERED</button>;
    }
    if (isNotEligible) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.8, color: '#dc2626', background: '#fef2f2', width: '100%' }}>NOT ELIGIBLE (INTRA-COLLEGE RESTRICTED)</button>;
    }
    if (isFull) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.8, color: '#dc2626', background: '#fef2f2', width: '100%' }}>EVENT FULL</button>;
    }
    if (isClosed) {
      return <button className="btn-secondary" disabled style={{ opacity: 0.8, color: '#854d0e', background: '#fef9c3', width: '100%' }}>REGISTRATION CLOSED</button>;
    }

    return (
      <button
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
        onClick={handleRegister}
        disabled={registering}
      >
        {registering ? 'Validating Chain of Responsibility...' : 'REGISTER FOR EVENT'}
      </button>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-intra">{event.category}</span>
          <span className={event.eventType === 'INTRA_COLLEGE' ? 'badge badge-intra' : 'badge badge-inter'}>
            {event.eventType}
          </span>
          <span className="badge badge-open">{event.status}</span>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
          {event.title}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0891b2', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          <Building size={18} />
          <span>Organizing College: {event.organizingCollegeName || `College #${event.collegeId}`}</span>
        </div>

        {/* Validation Errors from Chain of Responsibility */}
        {validationError && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <AlertTriangle size={18} />
              <span>Registration Validation Rejected</span>
            </div>
            <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>{validationError.message}</p>
            {validationError.handlerName && (
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontFamily: 'monospace', color: '#b91c1c' }}>
                Chain Handler Intercepted: {validationError.handlerName}
              </div>
            )}
          </div>
        )}

        {/* Success Notice */}
        {successMessage && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}
          >
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DATE & TIME</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Calendar size={14} style={{ color: '#2563eb' }} />
              {event.date}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.1rem' }}>
              {event.startTime} - {event.endTime}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>VENUE</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <MapPin size={14} style={{ color: '#d97706' }} />
              {event.venue}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>REGISTRATION DEADLINE</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#d97706', marginTop: '0.2rem' }}>
              {event.registrationDeadline}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>CAPACITY & FEE</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
              {event.currentRegistrations} / {event.capacity} Enrolled • {event.registrationFee > 0 ? `$${event.registrationFee}` : 'Free'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.92rem', color: '#2563eb', marginBottom: '0.35rem', fontWeight: 700 }}>Event Description</h4>
          <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: '1.6' }}>{event.description}</p>
        </div>

        <div style={{ marginBottom: '1.5rem', background: '#eff6ff', padding: '0.9rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Info size={16} />
            Institutional Eligibility Rules
          </div>
          <p style={{ fontSize: '0.85rem', color: '#1e40af' }}>
            {event.eventType === 'INTRA_COLLEGE'
              ? `INTRA_COLLEGE Restriction: Exclusively open to registered students of ${event.organizingCollegeName}.`
              : `INTER_COLLEGE Access: Open to students from registered platform institutions.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {renderRegisterButton()}
          {user && (
            <button
              className="btn-secondary"
              style={{ padding: '0.85rem 1.25rem' }}
              onClick={() => onOpenContact(event)}
            >
              <Mail size={18} />
              Contact Organizer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
