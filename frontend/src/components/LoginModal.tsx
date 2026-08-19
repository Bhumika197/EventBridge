import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, Shield, UserCheck, KeyRound, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { login, colleges } = useAuth();
  const [modalMode, setModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login state
  const [username, setUsername] = useState('');
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
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
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
      await login(usr, pwd);
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
      const res = await api.registerStudent(regData);
      if (res.success) {
        await login(regData.username, regData.password);
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
    setInfoMessage(null);
    try {
      const res = await api.forgotPassword(resetEmail);
      if (res.success) {
        setCodeSent(true);
        setInfoMessage(res.message);
        if (res.resetCodeForTesting) {
          setResetCode(res.resetCodeForTesting);
        }
      } else {
        setError(res.message || 'Failed to send reset code.');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending reset code.');
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
        email: resetEmail,
        resetCode,
        newPassword
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            className={`tab-btn ${modalMode === 'login' ? 'active' : ''}`}
            onClick={() => { setModalMode('login'); setError(null); setInfoMessage(null); }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${modalMode === 'register' ? 'active' : ''}`}
            onClick={() => { setModalMode('register'); setError(null); setInfoMessage(null); }}
          >
            Student Registration
          </button>
          <button
            className={`tab-btn ${modalMode === 'forgot' ? 'active' : ''}`}
            onClick={() => { setModalMode('forgot'); setError(null); setInfoMessage(null); }}
          >
            Forgot Password?
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

        {modalMode === 'login' && (
          <div>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Username</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="Enter username (e.g. bhumika_rbu)"
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
                  <Sparkles size={14} style={{ color: '#d97706' }} />
                  Organizer (RBU Cell)
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.6rem', justifyContent: 'flex-start' }}
                  onClick={() => handleQuickLogin('org_rcoem', 'password123')}
                >
                  <Sparkles size={14} style={{ color: '#16a34a' }} />
                  Organizer (RCOEM Club)
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.6rem', justifyContent: 'flex-start', gridColumn: 'span 2' }}
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                >
                  <Shield size={14} style={{ color: '#16a34a' }} />
                  Platform Administrator (Governance Access)
                </button>
              </div>
            </div>
          </div>
        )}

        {modalMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Full Name *</label>
              <input
                type="text"
                className="search-input"
                style={{ width: '100%' }}
                required
                placeholder="e.g. Bhumika Reddy"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Unique Username *</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="e.g. bhumika_rbu"
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Email (@rcoem.in / @rbunagpur.in) *</label>
                <input
                  type="email"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="bhumika@rbunagpur.in"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>College Affiliation *</label>
              <select
                className="select-input"
                style={{ width: '100%' }}
                value={regData.collegeId}
                onChange={(e) => setRegData({ ...regData, collegeId: Number(e.target.value) })}
              >
                {colleges.map((c) => (
                  <option key={c.collegeId} value={c.collegeId}>
                    {c.name} (@{c.emailDomain})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Department</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="Computer Science"
                  value={regData.department}
                  onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Academic Year</label>
                <input
                  type="number"
                  className="search-input"
                  style={{ width: '100%' }}
                  min={1}
                  max={5}
                  value={regData.year}
                  onChange={(e) => setRegData({ ...regData, year: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Password *</label>
              <input
                type="password"
                className="search-input"
                style={{ width: '100%' }}
                required
                placeholder="Create password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Register Student Account'}
            </button>
          </form>
        )}

        {modalMode === 'forgot' && (
          <div>
            {!codeSent ? (
              <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                  Enter your registered institutional email address (e.g. <code>bhumika@rbunagpur.in</code> or <code>aarav@rcoem.in</code>). We will dispatch a 6-digit password reset verification code via Email Channel.
                </p>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Registered Student / User Email *</label>
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
      </div>
    </div>
  );
};
