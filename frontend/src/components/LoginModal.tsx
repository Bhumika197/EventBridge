import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, Shield, UserCheck, KeyRound, CheckCircle, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface LoginModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'delete';
}

const FALLBACK_COLLEGES = [
  { collegeId: 1, name: 'Ramdeobaba University', emailDomain: 'rbunagpur.in' },
  { collegeId: 2, name: 'Shri Ramdeobaba College of Engineering and Management (RCOEM)', emailDomain: 'rcoem.in' },
  { collegeId: 3, name: 'North Valley University', emailDomain: 'nvu.edu' },
  { collegeId: 4, name: 'Greenfield Institute of Technology', emailDomain: 'git.edu' },
  { collegeId: 5, name: 'City Arts College', emailDomain: 'cac.edu' },
  { collegeId: 6, name: 'National Business College', emailDomain: 'nbc.edu' }
];

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, initialMode = 'login' }) => {
  const { user, login, logout, colleges } = useAuth();
  const [modalMode, setModalMode] = useState<'login' | 'register' | 'forgot' | 'delete'>(initialMode);

  // Login state
  const [username, setUsername] = useState(user ? user.username : '');
  const [password, setPassword] = useState('');

  // Register state
  const [regData, setRegData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    collegeId: 1,
    department: 'Computer Science',
    year: 1,
    phone: ''
  });

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Delete Account state
  const [deleteIdentifier, setDeleteIdentifier] = useState(user ? user.username : '');
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableColleges = colleges && colleges.length > 0 ? colleges : FALLBACK_COLLEGES;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (usr: string, pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      await login(usr.trim(), pwd.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanData = {
        ...regData,
        name: regData.name.trim(),
        username: regData.username.trim(),
        email: regData.email.trim(),
        password: regData.password.trim(),
        department: regData.department.trim(),
        phone: regData.phone.trim()
      };
      const res = await api.registerStudent(cleanData);
      if (res.success) {
        await login(cleanData.username, cleanData.password);
        onClose();
      } else {
        setError(res.reason || res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(resetEmail.trim());
      if (res.success) {
        setCodeSent(true);
        setInfoMessage(res.message);
        if (res.resetCodeForTesting) {
          setResetCode(res.resetCodeForTesting);
        }
      } else {
        setError(res.message || 'Failed to request reset code.');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.resetPassword({
        email: resetEmail.trim(),
        resetCode: resetCode.trim(),
        newPassword: newPassword.trim()
      });

      if (res.success) {
        setInfoMessage('Password updated successfully! Please sign in with your new password.');
        setTimeout(() => {
          setModalMode('login');
          setPassword('');
          setError(null);
        }, 1500);
      } else {
        setError(res.message || 'Password reset failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCheckbox) {
      setError('Please check the confirmation box to confirm permanent account deletion.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.deleteAccount({
        username: deleteIdentifier.trim(),
        password: deletePassword.trim()
      });

      if (res.success) {
        setInfoMessage(res.message || 'Your account and data have been permanently deleted.');
        if (user) {
          logout();
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(res.message || 'Account deletion failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            className={`tab-btn ${modalMode === 'login' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.25rem', textAlign: 'center', justifyContent: 'center' }}
            onClick={() => { setModalMode('login'); setError(null); setInfoMessage(null); }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${modalMode === 'register' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.25rem', textAlign: 'center', justifyContent: 'center' }}
            onClick={() => { setModalMode('register'); setError(null); setInfoMessage(null); }}
          >
            Registration
          </button>
          <button
            className={`tab-btn ${modalMode === 'forgot' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.25rem', textAlign: 'center', justifyContent: 'center' }}
            onClick={() => { setModalMode('forgot'); setError(null); setInfoMessage(null); }}
          >
            Forgot Pass?
          </button>
          <button
            className={`tab-btn ${modalMode === 'delete' ? 'active' : ''}`}
            style={modalMode === 'delete' ? { color: '#dc2626', borderColor: '#f87171', fontSize: '0.8rem', padding: '0.45rem 0.25rem', textAlign: 'center', justifyContent: 'center' } : { color: '#ef4444', fontSize: '0.8rem', padding: '0.45rem 0.25rem', textAlign: 'center', justifyContent: 'center' }}
            onClick={() => {
              setModalMode('delete');
              setError(null);
              setInfoMessage(null);
              if (user) setDeleteIdentifier(user.username);
            }}
          >
            Delete Acc
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '1rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {infoMessage && (
          <div style={{ padding: '0.75rem', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={18} />
            {infoMessage}
          </div>
        )}

        {/* 1. SIGN IN MODE */}
        {modalMode === 'login' && (
          <div>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Username or Email</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="Enter username or email (e.g. bhumika_rbu or bhumika@rbunagpur.in)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Password</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => { setModalMode('forgot'); setError(null); setInfoMessage(null); }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
                <LogIn size={18} />
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Buttons */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <Sparkles size={14} />
                Quick One-Click Demo Accounts
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.6rem', justifyContent: 'flex-start' }}
                  onClick={() => handleQuickLogin('bhumika_rbu', 'password123')}
                >
                  <UserCheck size={14} style={{ color: '#2563eb' }} />
                  Student (RBU @rbunagpur.in)
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.6rem', justifyContent: 'flex-start' }}
                  onClick={() => handleQuickLogin('aarav_rcoem', 'password123')}
                >
                  <UserCheck size={14} style={{ color: '#0891b2' }} />
                  Student (RCOEM @rcoem.in)
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.6rem', justifyContent: 'flex-start' }}
                  onClick={() => handleQuickLogin('org_rbu', 'password123')}
                >
                  <UserCheck size={14} style={{ color: '#16a34a' }} />
                  Organizer (RBU Tech Cell)
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.6rem', justifyContent: 'flex-start' }}
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                >
                  <Shield size={14} style={{ color: '#7c3aed' }} />
                  Platform Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. REGISTRATION MODE */}
        {modalMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Full Name *</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="e.g. Bhumika Sharma"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Username *</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="e.g. bhumika_s"
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Select College / University *</label>
              <select
                className="search-input"
                style={{ width: '100%' }}
                value={regData.collegeId}
                onChange={(e) => setRegData({ ...regData, collegeId: Number(e.target.value) })}
              >
                {availableColleges.map((c) => (
                  <option key={c.collegeId} value={c.collegeId}>
                    {c.name} (@{c.emailDomain})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Institutional Email *</label>
                <input
                  type="email"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="e.g. bhumika@rbunagpur.in"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Password *</label>
                <input
                  type="password"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="Min 6 characters"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Department</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Computer Science"
                  value={regData.department}
                  onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Year of Study</label>
                <select
                  className="search-input"
                  style={{ width: '100%' }}
                  value={regData.year}
                  onChange={(e) => setRegData({ ...regData, year: Number(e.target.value) })}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Phone Number (Optional)</label>
              <input
                type="tel"
                className="search-input"
                style={{ width: '100%' }}
                placeholder="+91 98765 43210"
                value={regData.phone}
                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              <UserPlus size={18} />
              {loading ? 'Creating Student Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {modalMode === 'forgot' && (
          <div>
            {!codeSent ? (
              <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Enter your registered institutional email. We will generate and dispatch a 6-digit password verification code.
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Institutional Email Address *</label>
                  <input
                    type="email"
                    className="search-input"
                    style={{ width: '100%' }}
                    required
                    placeholder="e.g. bhumika@rbunagpur.in"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
                  <Mail size={18} />
                  {loading ? 'Dispatching Reset Email...' : 'Send Password Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Verification Reset Code (6 Digits) *</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', fontWeight: 700 }}
                    required
                    placeholder="Enter 6-digit code (e.g. 839201)"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Create New Password *</label>
                  <input
                    type="password"
                    className="search-input"
                    style={{ width: '100%' }}
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
                  <KeyRound size={18} />
                  {loading ? 'Updating Password...' : 'Reset Password & Return to Sign In'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 4. DELETE ACCOUNT MODE */}
        {modalMode === 'delete' && (
          <div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.4 }}>
                <strong>Permanent Action:</strong> Deleting your account will immediately remove your student profile, event registrations, waitlist queue positions, notifications, and contact history. This action cannot be reversed.
              </div>
            </div>

            <form onSubmit={handleDeleteAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Username or Email *</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="Enter your username or email"
                  value={deleteIdentifier}
                  onChange={(e) => setDeleteIdentifier(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Confirm Password *</label>
                <input
                  type="password"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="Enter your account password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.2rem' }}>
                <input
                  type="checkbox"
                  id="confirm-delete"
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                />
                <label htmlFor="confirm-delete" style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer', lineHeight: 1.3 }}>
                  I understand that deleting my account permanently erases all my registrations, waitlist spots, and profile data.
                </label>
              </div>

              <button
                type="submit"
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: '0.5rem'
                }}
                disabled={loading}
              >
                <Trash2 size={18} />
                {loading ? 'Deleting Account...' : 'Permanently Delete My Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
