import React, { useState } from 'react';
import {
  Play, RotateCcw, Check, AlertCircle, Copy, Sparkles, Send,
  ArrowRight, Shield, Bell, Database, Layers, CheckCircle2,
  DollarSign, Tag, Users, Clock, MapPin, Building
} from 'lucide-react';
import { api } from '../services/api';

// ============================================================================
// 1. BUILDER PATTERN DEMO
// ============================================================================
export const BuilderDemo: React.FC = () => {
  const [title, setTitle] = useState('National AI Hackathon 2026');
  const [date, setDate] = useState('2026-11-20');
  const [collegeId, setCollegeId] = useState(1);
  const [category, setCategory] = useState('Technical');
  const [isInterCollege, setIsInterCollege] = useState(true);
  const [prizePool, setPrizePool] = useState(75000);
  const [minTeam, setMinTeam] = useState(2);
  const [maxTeam, setMaxTeam] = useState(4);
  const [speakers, setSpeakers] = useState<string[]>(['Dr. Alan Turing', 'Ada Lovelace']);
  const [newSpeaker, setNewSpeaker] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuild = () => {
    setError(null);
    if (!title.trim()) {
      setError('EventBuilder Validation Error: Title is required.');
      return;
    }
    if (!date) {
      setError('EventBuilder Validation Error: Date is required.');
      return;
    }
    if (minTeam > maxTeam) {
      setError(`EventBuilder Validation Error: Min team size (${minTeam}) cannot exceed max (${maxTeam}).`);
      return;
    }

    const built = {
      title,
      date,
      collegeId,
      category,
      eventType: isInterCollege ? 'INTER_COLLEGE' : 'INTRA_COLLEGE',
      venue: 'Main University Amphitheatre',
      prizePool,
      teamSize: `${minTeam}-${maxTeam} members`,
      speakers: [...speakers],
      status: 'DRAFT',
      assembledAt: new Date().toLocaleTimeString()
    };
    setResult(built);
  };

  return (
    <div className="demo-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="#2563eb" />
          <span>Interactive EventBuilder Sandbox</span>
        </h4>
        <span className="badge badge-inter">Creational Pattern</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Title (Required)</label>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', fontSize: '0.85rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Date (Required)</label>
          <input
            type="date"
            className="search-input"
            style={{ width: '100%', fontSize: '0.85rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Prize Pool (₹)</label>
          <input
            type="number"
            className="search-input"
            style={{ width: '100%', fontSize: '0.85rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={prizePool}
            onChange={(e) => setPrizePool(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Min Team Size</label>
          <input
            type="number"
            min={1}
            className="search-input"
            style={{ width: '100%', fontSize: '0.85rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={minTeam}
            onChange={(e) => setMinTeam(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Max Team Size</label>
          <input
            type="number"
            min={1}
            className="search-input"
            style={{ width: '100%', fontSize: '0.85rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={maxTeam}
            onChange={(e) => setMaxTeam(Number(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Add Speaker to Array</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="search-input"
            style={{ flex: 1, fontSize: '0.85rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            placeholder="e.g. Dr. Geoffrey Hinton"
            value={newSpeaker}
            onChange={(e) => setNewSpeaker(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
            onClick={() => {
              if (newSpeaker.trim()) {
                setSpeakers([...speakers, newSpeaker.trim()]);
                setNewSpeaker('');
              }
            }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
          {speakers.map((s, i) => (
            <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }} onClick={handleBuild}>
        <Play size={15} /> Execute EventBuilder.build()
      </button>

      {error && (
        <div style={{ padding: '0.6rem 0.8rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#0f172a', color: '#10b981', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
          <div style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>// Verified Result returned by EventBuilder.build() at {result.assembledAt}:</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. PROTOTYPE PATTERN DEMO
// ============================================================================
export const PrototypeDemo: React.FC = () => {
  const [originalEvent] = useState({
    title: 'HackRBU Annual Fest 2025',
    date: '2025-10-15',
    venue: 'Old Hall 1',
    speakers: ['Keynote Speaker Alpha', 'Speaker Beta'],
    sponsors: ['TechCorp', 'CloudLabs'],
    status: 'COMPLETED'
  });

  const [clonedEvent, setClonedEvent] = useState<any | null>(null);
  const [newDate, setNewDate] = useState('2026-10-15');
  const [newVenue, setNewVenue] = useState('New Tech Amphitheatre');
  const [extraSpeaker, setExtraSpeaker] = useState('');

  const handleClone = () => {
    // Perform Prototype Deep Copy
    const copy = {
      ...originalEvent,
      title: `${originalEvent.title} (2026 Edition)`,
      date: newDate,
      venue: newVenue,
      status: 'DRAFT',
      speakers: [...originalEvent.speakers], // Deep copy array
      sponsors: [...originalEvent.sponsors]  // Deep copy array
    };
    setClonedEvent(copy);
  };

  const addSpeakerToClone = () => {
    if (clonedEvent && extraSpeaker.trim()) {
      setClonedEvent({
        ...clonedEvent,
        speakers: [...clonedEvent.speakers, extraSpeaker.trim()]
      });
      setExtraSpeaker('');
    }
  };

  return (
    <div className="demo-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Copy size={16} color="#0284c7" />
          <span>Interactive Prototype Deep-Cloning Sandbox</span>
        </h4>
        <span className="badge badge-inter">Creational Pattern</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Original Prototype */}
        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Original Prototype Event (Source)
          </div>
          <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{originalEvent.title}</div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
            Date: {originalEvent.date} • Venue: {originalEvent.venue}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '0.4rem' }}>
            Speakers ({originalEvent.speakers.length}): {originalEvent.speakers.join(', ')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '0.2rem' }}>
            Original memory reference remains isolated
          </div>
        </div>

        {/* Clone Config */}
        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Prototype.clone() Overrides
          </div>
          <div style={{ marginTop: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', color: '#475569' }}>New Event Date</label>
            <input
              type="date"
              className="search-input"
              style={{ width: '100%', fontSize: '0.82rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div style={{ marginTop: '0.3rem' }}>
            <label style={{ fontSize: '0.72rem', color: '#475569' }}>New Venue</label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', fontSize: '0.82rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }} onClick={handleClone}>
        <Copy size={15} /> Execute EventPrototype.clone()
      </button>

      {clonedEvent && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: '#15803d', fontSize: '0.88rem' }}>
              ✓ Cloned Object Created (Deep Copy Confirmed)
            </strong>
            <span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>Status: {clonedEvent.status}</span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#166534', marginBottom: '0.5rem' }}>
            Title: <strong>{clonedEvent.title}</strong> • Date: <strong>{clonedEvent.date}</strong> • Venue: <strong>{clonedEvent.venue}</strong>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '0.5rem' }}>
            Speakers in Clone ({clonedEvent.speakers.length}): {clonedEvent.speakers.join(', ')}
          </div>

          {/* Mutate clone to prove deep copy */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            <input
              type="text"
              className="search-input"
              style={{ flex: 1, fontSize: '0.8rem', background: '#fff', color: '#0f172a', border: '1px solid #86efac' }}
              placeholder="Add speaker to clone only..."
              value={extraSpeaker}
              onChange={(e) => setExtraSpeaker(e.target.value)}
            />
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }} onClick={addSpeakerToClone}>
              Mutate Clone Array
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '0.3rem' }}>
            Notice: Original prototype speakers array ({originalEvent.speakers.length}) is completely untouched!
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. MEDIATOR PATTERN DEMO
// ============================================================================
export const MediatorDemo: React.FC = () => {
  const [studentName, setStudentName] = useState('Kavya Deshmukh');
  const [seatCapacity, setSeatCapacity] = useState(100);
  const [currentRegistered, setCurrentRegistered] = useState(99);
  const [fee, setFee] = useState(150);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setLogs([]);

    try {
      const res = await api.simulateMediator({
        student: { name: studentName, email: 'kavya@rbunagpur.in' },
        event: {
          title: 'Cyber Security HackCon 2026',
          capacity: seatCapacity,
          currentRegistrations: currentRegistered,
          registrationFee: fee,
          organizerId: 2,
          eventId: 48
        }
      });

      if (res && res.success && res.data) {
        setLogs(res.data.logs || []);
      }
    } catch {
      // Fallback client simulation if offline
      const simulatedLogs = [
        { step: 1, colleague: 'SeatColleague', action: 'SEAT_RESERVED', details: 'Capacity check: 99/100 -> Reserved seat #100' },
        { step: 2, colleague: 'PaymentColleague', action: 'PAYMENT_PROCESSED', details: `Transaction cleared for ₹${fee} via gateway` },
        { step: 3, colleague: 'NotificationColleague', action: 'EMAIL_DISPATCHED', details: `Official ticket email sent to kavya@rbunagpur.in` },
        { step: 4, colleague: 'DashboardColleague', action: 'DASHBOARD_ROSTER_UPDATED', details: `Organizer dashboard counter incremented to 100/100` }
      ];
      setLogs(simulatedLogs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={16} color="#7c3aed" />
          <span>EventCoordinator Mediator Simulation</span>
        </h4>
        <span className="badge badge-inter">Behavioral Pattern</span>
      </div>

      {/* 4 Colleague Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { name: 'SeatColleague', role: 'Capacity Check', color: '#2563eb' },
          { name: 'PaymentColleague', role: 'Fee Deduction', color: '#16a34a' },
          { name: 'NotificationColleague', role: 'Email Dispatch', color: '#d97706' },
          { name: 'DashboardColleague', role: 'Live Roster Refresh', color: '#9333ea' }
        ].map((c, i) => (
          <div key={i} style={{ background: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: `1px solid ${c.color}`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: c.color }}>{c.name}</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{c.role}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#eff6ff', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', color: '#1e40af', marginBottom: '0.75rem' }}>
        <strong>Decoupling Guarantee:</strong> None of these 4 colleagues communicate directly. All messaging routes through <code>EventCoordinator.notify()</code>.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569' }}>Student Name</label>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', fontSize: '0.82rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569' }}>Current / Max Seats</label>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', fontSize: '0.82rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={`${currentRegistered} / ${seatCapacity}`}
            readOnly
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569' }}>Fee to Process (₹)</label>
          <input
            type="number"
            className="search-input"
            style={{ width: '100%', fontSize: '0.82rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
          />
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }} onClick={handleSimulate}>
        <Play size={15} /> Trigger Registration via EventCoordinator
      </button>

      {logs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {logs.map((log, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ffffff',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem'
              }}
            >
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {log.step || i + 1}
              </span>
              <strong style={{ color: '#0f172a' }}>{log.colleague}:</strong>
              <span className="badge badge-intra">{log.action}</span>
              <span style={{ color: '#475569', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. TEMPLATE METHOD PATTERN DEMO
// ============================================================================
export const TemplateMethodDemo: React.FC = () => {
  const [workflowType, setWorkflowType] = useState<'HackathonWorkflow' | 'CulturalFestWorkflow'>('HackathonWorkflow');
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await api.runWorkflow(workflowType);
      if (res && res.success && res.data) {
        setReport(res.data);
      }
    } catch {
      // Offline fallback
      setReport({
        workflowType,
        completedAt: new Date().toLocaleTimeString(),
        steps: [
          { stepNumber: 1, stepName: 'Validate Category Requirements', isOverridden: true, executedBy: `${workflowType} (Overridden)`, output: workflowType === 'HackathonWorkflow' ? 'Validated team size 2-4 and GitHub accounts' : 'Validated stage lighting and acoustic sound permits' },
          { stepNumber: 2, stepName: 'Setup Category Registration', isOverridden: true, executedBy: `${workflowType} (Overridden)`, output: workflowType === 'HackathonWorkflow' ? 'Team registration portal configured' : 'Solo entries & tiered ticketing pass setup' },
          { stepNumber: 3, stepName: 'Publish Event to Campus Feed', isOverridden: false, executedBy: 'EventWorkflow (Base Invariant)', output: 'Published live to student feed' },
          { stepNumber: 4, stepName: 'Execute Event Day Coordination', isOverridden: true, executedBy: `${workflowType} (Overridden)`, output: workflowType === 'HackathonWorkflow' ? 'Coding sprint & jury judging round executed' : 'Stage live performances & crowd cheer voting executed' },
          { stepNumber: 5, stepName: 'Close Event Registration Portal', isOverridden: false, executedBy: 'EventWorkflow (Base Invariant)', output: 'Registration portal closed and attendance locked' },
          { stepNumber: 6, stepName: 'Generate Post-Event Analytics', isOverridden: true, executedBy: `${workflowType} (Overridden)`, output: workflowType === 'HackathonWorkflow' ? 'Podium trophy report & GitHub commits exported' : 'Box office audience ticket revenue exported' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Play size={16} color="#16a34a" />
          <span>EventWorkflow.run() Template Method Runner</span>
        </h4>
        <span className="badge badge-inter">Behavioral Pattern</span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <button
          className={`btn-secondary ${workflowType === 'HackathonWorkflow' ? 'btn-primary' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setWorkflowType('HackathonWorkflow')}
        >
          HackathonWorkflow (Teams & Judging)
        </button>
        <button
          className={`btn-secondary ${workflowType === 'CulturalFestWorkflow' ? 'btn-primary' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setWorkflowType('CulturalFestWorkflow')}
        >
          CulturalFestWorkflow (Solo & Ticketing)
        </button>
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }} onClick={handleRun}>
        <Play size={15} /> Execute {workflowType}.run()
      </button>

      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {report.steps.map((st: any, i: number) => (
            <div
              key={i}
              style={{
                background: '#ffffff',
                borderLeft: `4px solid ${st.isOverridden ? '#2563eb' : '#16a34a'}`,
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                borderTop: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>
                  Step {st.stepNumber}: {st.stepName}
                </strong>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: st.isOverridden ? '#eff6ff' : '#f0fdf4',
                    color: st.isOverridden ? '#1d4ed8' : '#15803d',
                    border: `1px solid ${st.isOverridden ? '#bfdbfe' : '#bbf7d0'}`
                  }}
                >
                  {st.isOverridden ? 'Subclass Overridden' : 'Base Invariant'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                {st.output}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. STRATEGY PATTERN DEMO
// ============================================================================
export const StrategyDemo: React.FC = () => {
  const [baseFee, setBaseFee] = useState<number>(200);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('StudentIdDiscount');
  const [isEarlyBird, setIsEarlyBird] = useState(true);
  const [isInterCollege, setIsInterCollege] = useState(true);
  const [teamSize, setTeamSize] = useState(4);
  const [hasStudentId, setHasStudentId] = useState(true);
  const [breakdown, setBreakdown] = useState<any | null>(null);

  const strategies = [
    { id: 'Free', label: 'FreeStrategy (0 Fee)' },
    { id: 'EarlyBird', label: 'EarlyBirdStrategy (25% off)' },
    { id: 'InterCollegeFee', label: 'InterCollegeFee (+50 Surcharge)' },
    { id: 'GroupDiscount', label: 'GroupDiscount (20% for >=3)' },
    { id: 'StudentIdDiscount', label: 'StudentIdDiscount (15% off)' }
  ];

  const handleCalculate = async (strategyName: string = selectedStrategy) => {
    try {
      const res = await api.calculateFee(strategyName, {
        baseFee,
        isEarlyBird,
        isInterCollegeStudent: isInterCollege,
        teamSize,
        hasStudentId
      });
      if (res && res.success) {
        setBreakdown(res.data);
      }
    } catch {
      // Local calculation fallback
      let disc = 0;
      let sur = 0;
      let name = strategyName;
      let desc = '';

      if (strategyName === 'Free') {
        disc = baseFee;
        desc = '100% Free Sponsored';
      } else if (strategyName === 'EarlyBird') {
        disc = Math.round(baseFee * 0.25);
        desc = '25% Early bird discount';
      } else if (strategyName === 'InterCollegeFee') {
        sur = isInterCollege ? 50 : 0;
        desc = isInterCollege ? 'Cross-college external surcharge applied' : 'Host student standard rate';
      } else if (strategyName === 'GroupDiscount') {
        disc = teamSize >= 3 ? Math.round(baseFee * 0.2) : 0;
        desc = teamSize >= 3 ? '20% group discount for team >= 3' : 'Solo registration (no discount)';
      } else {
        disc = hasStudentId ? Math.round(baseFee * 0.15) : 0;
        desc = hasStudentId ? '15% university student concession' : 'Standard public rate';
      }

      setBreakdown({
        strategyName: name,
        originalFee: baseFee,
        discountAmount: disc,
        surchargeAmount: sur,
        finalFee: Math.max(0, baseFee - disc + sur),
        discountDescription: desc
      });
    }
  };

  return (
    <div className="demo-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <DollarSign size={16} color="#d97706" />
          <span>Dynamic Fee Calculation Strategy Playground</span>
        </h4>
        <span className="badge badge-inter">Behavioral Pattern</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Base Ticket Price (₹)</label>
          <input
            type="number"
            min={0}
            className="search-input"
            style={{ width: '100%', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={baseFee}
            onChange={(e) => setBaseFee(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Team Size (Members)</label>
          <input
            type="number"
            min={1}
            className="search-input"
            style={{ width: '100%', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={isEarlyBird} onChange={(e) => setIsEarlyBird(e.target.checked)} />
          <span>Early Bird Window Open</span>
        </label>
        <label style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={isInterCollege} onChange={(e) => setIsInterCollege(e.target.checked)} />
          <span>Inter-College Student</span>
        </label>
        <label style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={hasStudentId} onChange={(e) => setHasStudentId(e.target.checked)} />
          <span>Has University Student ID</span>
        </label>
      </div>

      {/* Strategy Selector Buttons */}
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
        Select Pricing Strategy:
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {strategies.map((s) => (
          <button
            key={s.id}
            className={`btn-secondary ${selectedStrategy === s.id ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            onClick={() => {
              setSelectedStrategy(s.id);
              handleCalculate(s.id);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {breakdown && (
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              Strategy: {breakdown.strategyName}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>
              Final Fee: ₹{breakdown.finalFee}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
            <div>Base Fee: <strong>₹{breakdown.originalFee}</strong></div>
            <div>Discount: <strong style={{ color: '#16a34a' }}>-₹{breakdown.discountAmount}</strong></div>
            <div>Surcharge: <strong style={{ color: '#d97706' }}>+₹{breakdown.surchargeAmount}</strong></div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '0.4rem', background: '#f0f9ff', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
            {breakdown.discountDescription}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. MEMENTO PATTERN DEMO
// ============================================================================
export const MementoDemo: React.FC = () => {
  const [eventState, setEventState] = useState({
    title: 'National Robotics Conclave',
    registrationDeadline: '2026-11-20',
    venue: 'Block B Auditorium',
    capacity: 100
  });

  const [historyStack, setHistoryStack] = useState<any[]>([
    {
      id: 1,
      title: 'National Robotics Conclave',
      registrationDeadline: '2026-11-20',
      venue: 'Block B Auditorium',
      capacity: 100,
      timestamp: 'Initial Approved Setup'
    }
  ]);

  const [newDeadline, setNewDeadline] = useState('2026-10-31');
  const [newVenue, setNewVenue] = useState('Room 102 (Accidental)');

  const handleSaveSnapshot = () => {
    // Push current snapshot
    const snapshot = {
      id: historyStack.length + 1,
      ...eventState,
      timestamp: `Snapshot before editing at ${new Date().toLocaleTimeString()}`
    };
    setHistoryStack([...historyStack, snapshot]);

    // Apply mutation
    setEventState({
      ...eventState,
      registrationDeadline: newDeadline,
      venue: newVenue
    });
  };

  const handleUndo = () => {
    if (historyStack.length <= 1) return;
    const popped = historyStack[historyStack.length - 1];
    setEventState({
      title: popped.title,
      registrationDeadline: popped.registrationDeadline,
      venue: popped.venue,
      capacity: popped.capacity
    });
    setHistoryStack(historyStack.slice(0, historyStack.length - 1));
  };

  return (
    <div className="demo-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RotateCcw size={16} color="#d97706" />
          <span>Memento Pattern: Accidental Edit Undo Sandbox</span>
        </h4>
        <span className="badge badge-inter">Behavioral Pattern</span>
      </div>

      {/* Current Live State */}
      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.85rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Current Event State in Memory</strong>
          <span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>Live Originator</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
          <div>Title: <strong>{eventState.title}</strong></div>
          <div>Venue: <strong>{eventState.venue}</strong></div>
          <div style={{ color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
            Registration Deadline: <strong>{eventState.registrationDeadline}</strong>
          </div>
          <div>Capacity: <strong>{eventState.capacity} seats</strong></div>
        </div>
      </div>

      {/* Simulate Accidental Edit Inputs */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.85rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', marginBottom: '0.4rem' }}>
          Simulate Organizer Edit (Accidental Deadline Shift)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#78350f' }}>New Registration Deadline</label>
            <input
              type="date"
              className="search-input"
              style={{ width: '100%', fontSize: '0.82rem', background: '#fff', color: '#0f172a', border: '1px solid #f59e0b' }}
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#78350f' }}>New Venue</label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', fontSize: '0.82rem', background: '#fff', color: '#0f172a', border: '1px solid #f59e0b' }}
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
            />
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSaveSnapshot}>
          Save Mutation (Push Snapshot to Caretaker Stack)
        </button>
      </div>

      {/* Undo Button & Caretaker Stack */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
          History Stack Size: {historyStack.length} snapshots
        </span>
        <button
          className="btn-secondary"
          style={{ borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb', fontWeight: 700 }}
          disabled={historyStack.length <= 1}
          onClick={handleUndo}
        >
          <RotateCcw size={14} /> Undo Last Edit (Pop Snapshot)
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {historyStack.map((snap, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              fontSize: '0.75rem'
            }}
          >
            <span style={{ color: '#0f172a', fontWeight: 600 }}>
              Memento #{i + 1}: Deadline was "{snap.registrationDeadline}" at "{snap.venue}"
            </span>
            <span style={{ color: '#64748b' }}>{snap.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 7. MVC ARCHITECTURAL PATTERN DEMO
// ============================================================================
export const MVCDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const steps = [
    {
      title: 'Step 1: View Layer Captures User Intent',
      layer: 'VIEW (React Frontend)',
      component: 'EventCard / EventDetailModal',
      desc: 'Student clicks [Register]. The React View triggers client handler and invokes api.registerForEvent(eventId) via fetch.',
      code: `// View Component
const handleRegister = async () => {
  const response = await api.registerForEvent(eventId);
  setRegistrationStatus('CONFIRMED');
};`
    },
    {
      title: 'Step 2: Controller Parses & Validates HTTP Request',
      layer: 'CONTROLLER (Express Server)',
      component: 'RegistrationController.register()',
      desc: 'Controller receives POST /api/registrations/event/:id, verifies the JWT cookie/bearer header, and extracts studentId & role.',
      code: `// Express Controller
public register = async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user.userId;
  const result = await this.regService.registerStudentForEvent(studentId, req.params.eventId);
  return res.status(201).json({ success: true, data: result });
};`
    },
    {
      title: 'Step 3: Model & Services Execute Business Rules & Persistence',
      layer: 'MODEL (Repositories & SQLite WASM DB)',
      component: 'RegistrationRepository & DatabaseManager',
      desc: 'Model runs transactional SQL check (INSERT INTO REGISTRATION) under atomic transaction lock, updating event attendee counters.',
      code: `// Model Layer
public async create(reg: Registration): Promise<Registration> {
  const db = this.dbManager.getDb();
  await db.run("INSERT INTO REGISTRATION (eventId, studentId, status) VALUES (?, ?, 'CONFIRMED')", [reg.eventId, reg.studentId]);
  return reg;
};`
    },
    {
      title: 'Step 4: Controller Formats JSON Response',
      layer: 'CONTROLLER (Express Server)',
      component: 'RegistrationController -> HTTP Response',
      desc: 'Controller constructs HTTP 201 Created with JSON payload and status codes.',
      code: `return res.status(201).json({
  success: true,
  status: 'CONFIRMED',
  message: 'Successfully registered for event!'
});`
    },
    {
      title: 'Step 5: View Updates DOM / UI State',
      layer: 'VIEW (React Frontend)',
      component: 'EventCard / StudentDashboard State Re-render',
      desc: 'React receives JSON, executes setState(), and dynamically paints the green "CONFIRMED (REGISTERED)" badge on the DOM.',
      code: `// React UI Rerender
{isRegistered ? (
  <span className="badge badge-registered">CONFIRMED (REGISTERED)</span>
) : (
  <button onClick={handleRegister}>Register Now</button>
)}`
    }
  ];

  const runSimulation = () => {
    setIsSimulating(true);
    setActiveStep(1);

    const timer1 = setTimeout(() => setActiveStep(2), 1200);
    const timer2 = setTimeout(() => setActiveStep(3), 2400);
    const timer3 = setTimeout(() => setActiveStep(4), 3600);
    const timer4 = setTimeout(() => {
      setActiveStep(5);
      setIsSimulating(false);
    }, 4800);
  };

  return (
    <div className="demo-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Database size={16} color="#0891b2" />
          <span>Interactive MVC Full-Stack Request Flow Simulator</span>
        </h4>
        <span className="badge badge-inter">Architectural Pattern</span>
      </div>

      <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
        EventBridge enforces clean separation: <strong>Views</strong> never touch raw SQL, <strong>Models</strong> never touch the DOM, and <strong>Controllers</strong> orchestrate HTTP requests, status codes, and services.
      </p>

      {/* 3 Tier Diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: `2px solid ${activeStep === 1 || activeStep === 5 ? '#2563eb' : '#cbd5e1'}` }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>1. VIEW (React)</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Components & UI</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>EventCard, OrganizerDashboard</div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: `2px solid ${activeStep === 2 || activeStep === 4 ? '#7c3aed' : '#cbd5e1'}` }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>2. CONTROLLER (Express)</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Handlers & Routing</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>RegistrationController, Auth, api.ts</div>
        </div>

        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: `2px solid ${activeStep === 3 ? '#16a34a' : '#cbd5e1'}` }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>3. MODEL (SQLite DB)</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Data Entities & DAOs</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>EventRepository, DatabaseManager</div>
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }} disabled={isSimulating} onClick={runSimulation}>
        <Play size={15} /> {isSimulating ? 'Tracing Request Across MVC Tiers...' : 'Simulate Registration Request Flow (View → Controller → Model → View)'}
      </button>

      {activeStep > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="badge badge-intra">{steps[activeStep - 1].layer}</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Active Tier</span>
          </div>

          <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
            {steps[activeStep - 1].title}
          </h5>

          <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.5rem' }}>
            {steps[activeStep - 1].desc}
          </p>

          <pre className="code-box" style={{ margin: 0, fontSize: '0.75rem', padding: '0.6rem' }}>
            {steps[activeStep - 1].code}
          </pre>
        </div>
      )}
    </div>
  );
};
