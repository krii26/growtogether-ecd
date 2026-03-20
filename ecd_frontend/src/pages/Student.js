import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const Student = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMilestones, setStudentMilestones] = useState({
    'social-emotional': [],
    'cognitive': [],
    'physical': [],
    'language': []
  });
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return children;
    return children.filter((c) =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.parent_name || '').toLowerCase().includes(term)
    );
  }, [children, search]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const res = await API.get('children/');
        setChildren(res.data || []);
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleViewProfile = async (student) => {
    setSelectedStudent(student);
    setLoadingMilestones(true);
    try {
      const res = await API.get('milestones/', {
        params: { child: student.id }
      });
      
      const grouped = {
        'social-emotional': [],
        'cognitive': [],
        'physical': [],
        'language': []
      };

      (res.data || []).forEach((milestone) => {
        if (grouped[milestone.category]) {
          grouped[milestone.category].push(milestone);
        }
      });

      setStudentMilestones(grouped);
    } catch (err) {
      console.error('Failed to load milestones', err);
    } finally {
      setLoadingMilestones(false);
    }
  };

  const handleCloseProfile = () => {
    setSelectedStudent(null);
    setStudentMilestones({
      'social-emotional': [],
      'cognitive': [],
      'physical': [],
      'language': []
    });
  };

  const layout = {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    minHeight: '100vh',
    background: '#f7f8fc'
  };

  const sidebar = {
    background: '#fff',
    borderRight: '1px solid #e5e7eb',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    height: '100vh'
  };

  const logoSection = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    marginBottom: 32
  };

  const logoIcon = {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '20px'
  };

  const logoText = {
    fontWeight: 700,
    fontSize: 18,
    color: '#111827'
  };

  const navItem = (active = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    color: active ? '#7c3aed' : '#374151',
    background: active ? '#f3e8ff' : 'transparent',
    fontWeight: active ? 700 : 500,
    transition: 'all 0.2s ease'
  });

  const iconStyle = { width: 20, textAlign: 'center' };

  const userSection = {
    borderTop: '1px solid #e5e7eb',
    paddingTop: 16,
    marginTop: 'auto'
  };

  const userProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#f9fafb',
    borderRadius: 12
  };

  const userAvatar = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700
  };

  const userName = { fontWeight: 600, color: '#111827' };
  const userRole = { fontSize: 12, color: '#6b7280' };
  const logoutIcon = { marginLeft: 'auto', cursor: 'pointer', color: '#9ca3af' };

  const main = { padding: '32px 40px' };
  const header = { marginBottom: 32 };
  const title = { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 6 };
  const subtitle = { color: '#6b7280' };

  const card = {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  };

  const table = { width: '100%', borderCollapse: 'collapse' };
  const th = { textAlign: 'left', padding: '14px 12px', color: '#6b7280', fontSize: 13, fontWeight: 600 };
  const tr = { borderBottom: '1px solid #f1f1f5' };
  const td = { padding: '14px 12px', color: '#111827', fontSize: 14, verticalAlign: 'middle' };

  const studentCell = { display: 'flex', alignItems: 'center', gap: 12 };
  const avatar = { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' };
  const name = { fontWeight: 700, color: '#111827' };
  const progressBarOuter = { background: '#f3f4f6', borderRadius: 999, width: 100, height: 8 };
  const progressBarInner = (pct) => ({ width: `${pct}%`, height: '100%', borderRadius: 999, background: pct >= 85 ? '#10b981' : '#f59e0b' });
  const badge = { fontWeight: 600, color: '#6b7280', fontSize: 13 };
  const actionBtn = { background: '#f3e8ff', color: '#7c3aed', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 600 };

  const formatAge = (child) => {
    if (child?.date_of_birth) {
      const dob = new Date(child.date_of_birth);
      const today = new Date();
      const years = today.getFullYear() - dob.getFullYear();
      const months = today.getMonth() - dob.getMonth() + (today.getDate() < dob.getDate() ? -1 : 0);
      const totalMonths = years * 12 + months;
      const y = Math.max(0, Math.floor(totalMonths / 12));
      const m = Math.max(0, totalMonths % 12);
      return `${y} years ${m} months`;
    }
    if (typeof child?.age === 'number') return `${child.age} years`;
    return 'N/A';
  };

  const computeProgress = (child) => {
    const milestones = child?.milestones || [];
    if (!milestones.length) return 0;
    return Math.min(100, milestones.length * 10);
  };

  const getAvatar = (child) => {
    return child?.photo || '/happychild.jpg';
  };

  const categoryConfig = {
    'social-emotional': {
      title: 'Social-Emotional',
      color: '#a78bfa',
      icon: '👥'
    },
    'cognitive': {
      title: 'Cognitive',
      color: '#60a5fa',
      icon: '🧠'
    },
    'physical': {
      title: 'Physical',
      color: '#34d399',
      icon: '💪'
    },
    'language': {
      title: 'Language',
      color: '#f472b6',
      icon: '🗣️'
    }
  };

  return (
    <div style={layout}>
      <aside style={sidebar}>
        <div>
          <div style={logoSection}>
            <div style={logoIcon}>👶</div>
            <div style={logoText}>GrowTogether</div>
          </div>

          <div style={navItem()} onClick={() => navigate('/teacher_dashboard')}>
            <span style={iconStyle}>🏠</span>
            Dashboard
          </div>
          <div style={navItem(true)}>
            <span style={iconStyle}>👥</span>
            Students
          </div>
          <div style={navItem()} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem()}>
            <span style={iconStyle}>📊</span>
            Publish Results
          </div>
        </div>

        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>JD</div>
            <div>
              <div style={userName}>John Doe</div>
              <div style={userRole}>Teacher</div>
            </div>
            <div style={logoutIcon} onClick={() => navigate('/login')}>↗</div>
          </div>
        </div>
      </aside>

      <main style={main}>
        <div style={header}>
          <div style={title}>Student Management</div>
          <div style={subtitle}>Welcome back! Here's what's happening today.</div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1, fontWeight: 700, fontSize: 16, color: '#1f2937' }}>Student Management</div>
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                outline: 'none',
                width: 220,
                fontSize: 14,
                color: '#4b5563'
              }}
            />
          </div>

          <table style={table}>
            <thead>
              <tr style={tr}>
                <th style={th}>Student Name</th>
                <th style={th}>Age</th>
                <th style={th}>Parent</th>
                <th style={th}>Progress</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const progress = computeProgress(s);
                return (
                  <tr key={s.id} style={tr}>
                    <td style={td}>
                      <div style={studentCell}>
                        <img src={getAvatar(s)} alt={s.name} style={avatar} />
                        <div style={name}>{s.name}</div>
                      </div>
                    </td>
                    <td style={td}>{formatAge(s)}</td>
                    <td style={td}>{s.parent_name || 'N/A'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={progressBarOuter}>
                          <div style={progressBarInner(progress)} />
                        </div>
                        <span style={badge}>{progress}%</span>
                      </div>
                    </td>
                    <td style={td}>
                      <button 
                        style={actionBtn}
                        onClick={() => handleViewProfile(s)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td style={{ ...td, textAlign: 'center' }} colSpan={5}>No students found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td style={{ ...td, textAlign: 'center' }} colSpan={5}>Loading...</td>

        {/* Student Profile Modal */}
        {selectedStudent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              {/* Profile Header */}
              <div style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                padding: '24px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                color: 'white',
                position: 'relative'
              }}>
                <button
                  onClick={handleCloseProfile}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <img
                    src={getAvatar(selectedStudent)}
                    alt={selectedStudent.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: '4px solid rgba(255,255,255,0.3)',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
                      {selectedStudent.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', opacity: 0.9 }}>
                      <span>👶 {formatAge(selectedStudent)}</span>
                      <span>👨‍👩‍👧 Parent: {selectedStudent.parent_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div style={{ padding: '24px' }}>
                {/* Student Details */}
                <div style={{
                  background: '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    Student Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Age</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {formatAge(selectedStudent)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Parent Name</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {selectedStudent.parent_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date of Birth</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Progress</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={progressBarOuter}>
                          <div style={progressBarInner(computeProgress(selectedStudent))} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {computeProgress(selectedStudent)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    Developmental Milestones
                  </h3>

                  {loadingMilestones ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      Loading milestones...
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '16px'
                    }}>
                      {Object.entries(categoryConfig).map(([category, config]) => (
                        <div
                          key={category}
                          style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{
                            background: config.color,
                            color: 'white',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px' }}>{config.icon}</span>
                              <span style={{ fontWeight: '600', fontSize: '14px' }}>{config.title}</span>
                            </div>
                            <span style={{
                              background: 'rgba(255,255,255,0.3)',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {studentMilestones[category].length}
                            </span>
                          </div>

                          <div style={{ padding: '12px' }}>
                            {studentMilestones[category].length === 0 ? (
                              <div style={{ 
                                textAlign: 'center', 
                                padding: '20px', 
                                color: '#9ca3af',
                                fontSize: '13px'
                              }}>
                                No milestones yet
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {studentMilestones[category].map((milestone) => (
                                  <div
                                    key={milestone.id}
                                    style={{
                                      padding: '10px',
                                      background: '#f9fafb',
                                      borderRadius: '8px',
                                      border: '1px solid #e5e7eb'
                                    }}
                                  >
                                    <div style={{
                                      fontWeight: '600',
                                      fontSize: '13px',
                                      color: '#111827',
                                      marginBottom: '4px'
                                    }}>
                                      {milestone.title}
                                    </div>
                                    {milestone.date_achieved && (
                                      <div style={{
                                        fontSize: '11px',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        📅 {new Date(milestone.date_achieved).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Milestones Summary */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b21a8', marginBottom: '4px' }}>
                    Total Milestones Achieved
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#7c3aed' }}>
                    {Object.values(studentMilestones).reduce((sum, arr) => sum + arr.length, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Student;
