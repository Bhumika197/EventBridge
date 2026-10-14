import React, { useState } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Sparkles, Send, FileText, Plus, Trash2, Calendar, MapPin, Award, Users, Shield } from 'lucide-react';
import { api } from '../services/api';

interface CreateEventWizardModalProps {
  onClose: () => void;
  onSuccess: () => void;
  colleges?: any[];
}

export const CreateEventWizardModal: React.FC<CreateEventWizardModalProps> = ({ onClose, onSuccess, colleges = [] }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Builder State
  const [formData, setFormData] = useState({
    // Step 1: Core Required Fields
    title: '',
    date: '2026-11-20',
    collegeId: colleges.length > 0 ? colleges[0].collegeId : 1,

    // Step 2: Schedule & Venue
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: '',
    registrationDeadline: '2026-11-15',
    capacity: 100,

    // Step 3: Scope & Category
    category: 'Technical',
    isInterCollege: true,
    eventType: 'INTER_COLLEGE',
    description: '',

    // Step 4: Optionals & Enhancements
    prizePool: 50000,
    minTeamSize: 1,
    maxTeamSize: 4,
    registrationFee: 0,
    eligibilityDescription: 'Open to enrolled university students.',
    speakers: ['Dr. Vikram Sarabhai (Guest Speaker)', 'Pooja Iyer (AI Engineer)'],
    sponsors: ['Google Developers Group', 'Tech Mahindra'],
    newSpeaker: '',
    newSponsor: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleAddSpeaker = () => {
    if (formData.newSpeaker.trim()) {
      setFormData({
        ...formData,
        speakers: [...formData.speakers, formData.newSpeaker.trim()],
        newSpeaker: ''
      });
    }
  };

  const handleRemoveSpeaker = (idx: number) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.filter((_, i) => i !== idx)
    });
  };

  const handleAddSponsor = () => {
    if (formData.newSponsor.trim()) {
      setFormData({
        ...formData,
        sponsors: [...formData.sponsors, formData.newSponsor.trim()],
        newSponsor: ''
      });
    }
  };

  const handleRemoveSponsor = (idx: number) => {
    setFormData({
      ...formData,
      sponsors: formData.sponsors.filter((_, i) => i !== idx)
    });
  };

  // Validate step before advancing
  const handleNext = () => {
    const errs: string[] = [];

    if (step === 1) {
      if (!formData.title.trim()) errs.push('Event title is required.');
      if (!formData.date.trim()) errs.push('Event date is required.');
      if (!formData.collegeId) errs.push('Organizing college is required.');
    } else if (step === 2) {
      if (!formData.venue.trim()) errs.push('Venue & Hall location is required.');
      if (!formData.registrationDeadline) errs.push('Registration deadline is required.');
      if (formData.capacity <= 0) errs.push('Capacity must be at least 1 seat.');
      if (new Date(formData.registrationDeadline).getTime() > new Date(formData.date).getTime()) {
        errs.push('Registration deadline cannot be after the event date.');
      }
    } else if (step === 3) {
      if (!formData.description.trim()) errs.push('Event description is required.');
    }

    if (errs.length > 0) {
      setValidationErrors(errs);
      return;
    }

    setValidationErrors([]);
    setStep(Math.min(5, step + 1));
  };

  const handlePrev = () => {
    setValidationErrors([]);
    setStep(Math.max(1, step - 1));
  };

  // Save via EventBuilder backend endpoint or createEvent
  const handleSave = async (submitDirectly: boolean) => {
    setLoading(true);
    setError(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      eventType: formData.isInterCollege ? 'INTER_COLLEGE' : 'INTRA_COLLEGE',
      collegeId: Number(formData.collegeId),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      venue: formData.venue,
      registrationDeadline: formData.registrationDeadline,
      capacity: Number(formData.capacity),
      registrationFee: Number(formData.registrationFee),
      eligibilityDescription: formData.eligibilityDescription,
      prizePool: Number(formData.prizePool),
      minTeamSize: Number(formData.minTeamSize),
      maxTeamSize: Number(formData.maxTeamSize),
      speakers: formData.speakers,
      sponsors: formData.sponsors,
      status: submitDirectly ? 'SUBMITTED' : 'DRAFT'
    };

    try {
      // First validate with EventBuilder endpoint
      const valRes = await api.validateBuilder(payload);
      if (!valRes.success) {
        setError(valRes.errors?.join(' ') || 'Builder validation failed.');
        setLoading(false);
        return;
      }

      // Persist event
      const res = await api.createEvent(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to create event.');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const generatedBuilderCode = `const event = new EventBuilder()
  .setTitle("${formData.title || 'Untitled Event'}")
  .setDate("${formData.date}")
  .setCollege(${formData.collegeId})
  .setSchedule("${formData.startTime}", "${formData.endTime}")
  .setVenue("${formData.venue || 'TBA'}")
  .setRegistrationDeadline("${formData.registrationDeadline}")
  .setCapacity(${formData.capacity})
  .setCategory("${formData.category}")
  .setInterCollege(${formData.isInterCollege})
  .setPrizePool(${formData.prizePool})
  .setTeamSize(${formData.minTeamSize}, ${formData.maxTeamSize})
  ${formData.speakers.map(s => `.addSpeaker("${s}")`).join('\n  ')}
  ${formData.sponsors.map(s => `.addSponsor("${s}")`).join('\n  ')}
  .build(); // Atomic domain validation in build()`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel modal-content"
        style={{ maxWidth: '780px', width: '92%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', color: '#0f172a' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={24} style={{ color: '#0f172a' }} />
        </button>

        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-inter" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={14} />
            Builder Pattern Wizard
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Step-by-step Chained Assembly</span>
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
          Create Event with EventBuilder
        </h2>

        {/* Stepper Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          {[
            { num: 1, label: 'Core Required' },
            { num: 2, label: 'Schedule & Venue' },
            { num: 3, label: 'Category & Scope' },
            { num: 4, label: 'Optionals & Extras' },
            { num: 5, label: 'Builder Review' }
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: s.num <= step ? 'pointer' : 'default',
                  opacity: s.num <= step ? 1 : 0.5
                }}
                onClick={() => { if (s.num < step) setStep(s.num); }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isCompleted ? '#16a34a' : isActive ? '#2563eb' : '#e2e8f0',
                    color: isCompleted || isActive ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {isCompleted ? <Check size={14} /> : s.num}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#1d4ed8' : '#64748b' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Banners */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.88rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 1: Core Required Fields */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
              <strong style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Step 1: Required Foundation Fields</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.82rem' }}>
                EventBuilder mandates title, event date, and college affiliation before assembling secondary attributes.
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Event Title *
              </label>
              <input
                type="text"
                className="search-input"
                style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                placeholder="e.g. National Level Autonomous Drone Hackathon 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Event Date *
                </label>
                <input
                  type="date"
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Host University / College *
                </label>
                <select
                  className="select-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: Number(e.target.value) })}
                >
                  {colleges.length > 0 ? (
                    colleges.map((c) => (
                      <option key={c.collegeId} value={c.collegeId}>
                        {c.name} ({c.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={1}>Ramdeobaba University (RBU)</option>
                      <option value={2}>Shri Ramdeobaba College of Engineering (RCOEM)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Venue */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #0891b2' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0e7490' }}>Step 2: Timing, Logistics & Seating</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.82rem' }}>
                Set venue, daily timings, seat capacity, and registration cutoff date.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Start Time *
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  placeholder="09:00 AM"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  End Time *
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  placeholder="05:00 PM"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Venue & Hall Location *
              </label>
              <input
                type="text"
                className="search-input"
                style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                placeholder="e.g. APJ Abdul Kalam Multipurpose Convention Hall, Block B"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Capacity Seat Limit *
                </label>
                <input
                  type="number"
                  min={1}
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Scope & Category */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #7c3aed' }}>
              <strong style={{ fontSize: '0.9rem', color: '#5b21b6' }}>Step 3: Classification & Institutional Scope</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.82rem' }}>
                Toggle inter-college visibility flag and specify event domain categories.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Category *
                </label>
                <select
                  className="select-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Management">Management</option>
                  <option value="Literary">Literary</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Scope / Inter-College Flag *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#0f172a' }}>
                    <input
                      type="checkbox"
                      checked={formData.isInterCollege}
                      onChange={(e) => setFormData({ ...formData, isInterCollege: e.target.checked })}
                    />
                    <span>Open as Inter-College (Cross-Campus Open Access)</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Event Description & Guidelines *
              </label>
              <textarea
                className="search-input"
                style={{ width: '100%', minHeight: '90px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                placeholder="Describe rules, prerequisites, prize categories, and schedule highlights..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 4: Optionals & Extras */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
              <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>Step 4: Optional Fields & Builder Extensions</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.82rem' }}>
                Optional parameters assembled by EventBuilder: Prize pool, team size, speakers array, sponsors array, ticket fees.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Prize Pool (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Min Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.minTeamSize}
                  onChange={(e) => setFormData({ ...formData, minTeamSize: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Max Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  className="search-input"
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  value={formData.maxTeamSize}
                  onChange={(e) => setFormData({ ...formData, maxTeamSize: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Speakers List */}
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Distinguished Speakers & Mentors Array
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="search-input"
                  style={{ flex: 1, background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  placeholder="e.g. Dr. Sundar Pichai (Google)"
                  value={formData.newSpeaker}
                  onChange={(e) => setFormData({ ...formData, newSpeaker: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpeaker(); } }}
                />
                <button type="button" className="btn-secondary" onClick={handleAddSpeaker}>
                  <Plus size={16} /> Add Speaker
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {formData.speakers.map((spk, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    {spk}
                    <button type="button" onClick={() => handleRemoveSpeaker(idx)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1d4ed8' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sponsors List */}
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Event Sponsors & Partners Array
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="search-input"
                  style={{ flex: 1, background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  placeholder="e.g. Red Bull (Beverage Partner)"
                  value={formData.newSponsor}
                  onChange={(e) => setFormData({ ...formData, newSponsor: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSponsor(); } }}
                />
                <button type="button" className="btn-secondary" onClick={handleAddSponsor}>
                  <Plus size={16} /> Add Sponsor
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {formData.sponsors.map((spo, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    {spo}
                    <button type="button" onClick={() => handleRemoveSponsor(idx)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#15803d' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Builder Review */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <strong style={{ fontSize: '0.9rem', color: '#047857' }}>Step 5: EventBuilder Assembly & Atomic Validation</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.82rem' }}>
                Review the chained EventBuilder execution code. Clicking Save triggers atomic validation in build().
              </p>
            </div>

            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '1rem', color: '#f8fafc', fontFamily: 'monospace', fontSize: '0.82rem', maxHeight: '200px', overflowY: 'auto' }}>
              <pre style={{ margin: 0 }}>{generatedBuilderCode}</pre>
            </div>

            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Summary of Configured Event:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#334155' }}>
                <div><strong>Title:</strong> {formData.title}</div>
                <div><strong>Date:</strong> {formData.date}</div>
                <div><strong>Venue:</strong> {formData.venue}</div>
                <div><strong>Capacity:</strong> {formData.capacity} seats</div>
                <div><strong>Prize Pool:</strong> ₹{formData.prizePool.toLocaleString()}</div>
                <div><strong>Team Sizing:</strong> {formData.minTeamSize}-{formData.maxTeamSize} members</div>
                <div><strong>Scope:</strong> {formData.isInterCollege ? 'INTER_COLLEGE (Open)' : 'INTRA_COLLEGE (Restricted)'}</div>
                <div><strong>Speakers:</strong> {formData.speakers.length} confirmed</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <div>
            {step > 1 ? (
              <button type="button" className="btn-secondary" onClick={handlePrev}>
                <ChevronLeft size={16} /> Previous Step
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {step < 5 ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Next: {step === 1 ? 'Schedule' : step === 2 ? 'Category' : step === 3 ? 'Optionals' : 'Review'}
                <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={loading}
                  onClick={() => handleSave(false)}
                >
                  <FileText size={16} /> Save as Draft
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={loading}
                  onClick={() => handleSave(true)}
                >
                  <Send size={16} /> Build & Submit for Review
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
