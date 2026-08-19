import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Building, Users, Calendar, Plus, CheckCircle, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { colleges, refreshUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New college form state
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [collegeData, setCollegeData] = useState({
    name: '',
    code: '',
    location: '',
    emailDomain: ''
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const resStats = await api.getAdminStats();
      const resUsers = await api.getAllUsers();
      if (resStats.success) setStats(resStats.data);
      if (resUsers.success) setUsersList(resUsers.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCollege(collegeData);
      if (res.success) {
        alert('College institution added successfully to EventBridge ecosystem!');
        setCollegeData({ name: '', code: '', location: '', emailDomain: '' });
        setShowAddCollege(false);
        loadAdminData();
        refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create college.');
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={16} />
            System Governance Desk
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
            Platform Administrator Dashboard
          </h1>
        </div>

        <button className="btn-primary" onClick={() => setShowAddCollege(true)}>
          <Plus size={18} />
          Register New College
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Colleges</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1', marginTop: '0.2rem' }}>{stats.totalColleges}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Students</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.2rem' }}>{stats.totalStudents}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Approved Organizers</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899', marginTop: '0.2rem' }}>{stats.totalOrganizers}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Platform Events</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>{stats.totalEvents}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Active Registrations</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>{stats.confirmedRegistrations}</div>
          </div>
        </div>
      )}

      {/* Colleges List */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
          Registered Institutional Colleges
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {colleges.map((c) => (
            <div key={c.collegeId} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{c.name} ({c.code})</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.2rem' }}>Location: {c.location}</div>
              <div style={{ color: '#06b6d4', fontSize: '0.82rem', marginTop: '0.1rem' }}>Domain: @{c.emailDomain}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Users Directory */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
          Platform User Accounts Directory
        </h3>

        {loading ? (
          <div style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>Loading user directory...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>User ID</th>
                  <th style={{ padding: '0.75rem' }}>Full Name</th>
                  <th style={{ padding: '0.75rem' }}>Username</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>College</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>#{u.userId}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}>{u.name}</td>
                    <td style={{ padding: '0.75rem', color: '#a5b4fc' }}>{u.username}</td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem', color: '#06b6d4' }}>{u.collegeName}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-intra">{u.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add College Modal */}
      {showAddCollege && (
        <div className="modal-overlay" onClick={() => setShowAddCollege(false)}>
          <div className="glass-panel modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
              Register New Academic College
            </h3>

            <form onSubmit={handleCreateCollege} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>College Full Name *</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="e.g. Stanford Technology Institute"
                  value={collegeData.name}
                  onChange={(e) => setCollegeData({ ...collegeData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>College Code *</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ width: '100%' }}
                    required
                    placeholder="STI"
                    value={collegeData.code}
                    onChange={(e) => setCollegeData({ ...collegeData, code: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Email Domain *</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ width: '100%' }}
                    required
                    placeholder="sti.edu"
                    value={collegeData.emailDomain}
                    onChange={(e) => setCollegeData({ ...collegeData, emailDomain: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Campus Location *</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  required
                  placeholder="Palo Alto Campus"
                  value={collegeData.location}
                  onChange={(e) => setCollegeData({ ...collegeData, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddCollege(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Institution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
