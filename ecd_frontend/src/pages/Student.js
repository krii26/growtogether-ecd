import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const CATEGORY_CONFIG = {
  'social-emotional': {
    title: 'Social-Emotional',
    color: '#a78bfa',
    icon: '👥'
  },
  cognitive: {
    title: 'Cognitive',
    color: '#60a5fa',
    icon: '🧠'
  },
  physical: {
    title: 'Physical',
    color: '#34d399',
    icon: '💪'
  },
  language: {
    title: 'Language',
    color: '#f472b6',
    icon: '🗣️'
  },
  'self-care': {
    title: 'Self-Care',
    color: '#f59e0b',
    icon: '🧼'
  },
  'executive-function': {
    title: 'Executive Function',
    color: '#22c55e',
    icon: '🎯'
  }
};

const getInitialMilestones = () =>
  Object.keys(CATEGORY_CONFIG).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});

const Student = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMilestones, setStudentMilestones] = useState(getInitialMilestones);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [reviewingMilestone, setReviewingMilestone] = useState(null);
  const [rating, setRating] = useState(0);
  const [suggestions, setSuggestions] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedFollowUpMilestone, setSelectedFollowUpMilestone] = useState(null);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [followUpSending, setFollowUpSending] = useState(false);
  const [followUpError, setFollowUpError] = useState('');
  const [followUpSuccess, setFollowUpSuccess] = useState('');
  const [userInfo, setUserInfo] = useState({
    first_name: 'John',
    last_name: 'Doe',
    role: 'Teacher'
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return children;
    return children.filter((c) =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.parent_name || '').toLowerCase().includes(term)
    );
  }, [children, search]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserInfo({
          first_name: user.first_name || 'John',
          last_name: user.last_name || 'Doe',
          role: user.role || 'Teacher'
        });
      } catch (error) {
        console.error('Failed to parse user info', error);
      }
    }

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

      const grouped = getInitialMilestones();

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
    setShowFollowUpModal(false);
    setSelectedFollowUpMilestone(null);
    setFollowUpMessage('');
    setFollowUpError('');
    setFollowUpSuccess('');
    setStudentMilestones(getInitialMilestones());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenFollowUp = (milestone) => {
    setSelectedFollowUpMilestone(milestone || null);
    setShowFollowUpModal(true);
    setFollowUpMessage('');
    setFollowUpError('');
    setFollowUpSuccess('');
  };

  const handleCloseFollowUp = () => {
    if (followUpSending) return;
    setShowFollowUpModal(false);
    setSelectedFollowUpMilestone(null);
    setFollowUpMessage('');
    setFollowUpError('');
    setFollowUpSuccess('');
  };

  const handleSendFollowUp = async () => {
    const trimmed = followUpMessage.trim();
    if (!trimmed) {
      setFollowUpError('Please enter a message before sending.');
      return;
    }
    if (!selectedStudent?.id) {
      setFollowUpError('Student context is missing. Please reopen the profile.');
      return;
    }
    if (!selectedFollowUpMilestone?.id) {
      setFollowUpError('Please select a milestone first.');
      return;
    }

    try {
      setFollowUpSending(true);
      setFollowUpError('');
      setFollowUpSuccess('');

      await API.post('follow_up_messages/', {
        child: selectedStudent.id,
        milestone: selectedFollowUpMilestone.id,
        parent_name: selectedStudent.parent_name || 'Parent',
        message: trimmed
      });

      setFollowUpSuccess('Milestone follow-up message sent to parent successfully.');
      setFollowUpMessage('');
    } catch (err) {
      console.error('Failed to send follow-up message', err);
      setFollowUpError('Failed to send follow-up message. Please try again.');
    } finally {
      setFollowUpSending(false);
    }
  };

  const handleReviewMilestone = (milestone) => {
    setReviewingMilestone(milestone);
    setRating(0);
    setSuggestions('');
  };

  const handleCloseReview = () => {
    setReviewingMilestone(null);
    setRating(0);
    setSuggestions('');
  };

  const getTargetDateStatus = (targetDate) => {
    if (!targetDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(targetDate);
    dueDate.setHours(0, 0, 0, 0);

    return {
      isMissed: dueDate < today,
      formattedDate: dueDate.toLocaleDateString(),
      longFormattedDate: dueDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
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
          <div style={navItem()} onClick={() => navigate('/publish-results')}>
            <span style={iconStyle}>📊</span>
            Publish Results
          </div>
          <div style={navItem()} onClick={() => navigate('/chat')}>
            <span style={iconStyle}>💬</span>
            Chat Room
          </div>
        </div>

        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>
              {(userInfo.first_name?.[0] || 'J').toUpperCase()}
              {(userInfo.last_name?.[0] || 'D').toUpperCase()}
            </div>
            <div>
              <div style={userName}>{userInfo.first_name} {userInfo.last_name}</div>
              <div style={userRole}>{userInfo.role}</div>
            </div>
            <div style={logoutIcon} onClick={handleLogout}>↗</div>
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
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                      Student Details
                    </h3>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Send follow-up from each milestone card.
                    </div>
                  </div>
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
                      {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
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
                              {studentMilestones[category]?.length || 0}
                            </span>
                          </div>

                          <div style={{ padding: '12px' }}>
                            {(studentMilestones[category]?.length || 0) === 0 ? (
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
                                {(studentMilestones[category] || []).map((milestone) => (
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
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'flex-start',
                                      marginBottom: '4px'
                                    }}>
                                      <div style={{
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        color: '#111827',
                                        flex: 1
                                      }}>
                                        {milestone.title}
                                      </div>
                                      <button
                                        onClick={() => handleReviewMilestone(milestone)}
                                        style={{
                                          background: '#e0e7ff',
                                          color: '#4338ca',
                                          border: 'none',
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          marginLeft: '8px'
                                        }}
                                      >
                                        Review
                                      </button>
                                      <button
                                        onClick={() => handleOpenFollowUp(milestone)}
                                        style={{
                                          background: '#ede9fe',
                                          color: '#6d28d9',
                                          border: 'none',
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          marginLeft: '6px'
                                        }}
                                      >
                                        Follow Up
                                      </button>
                                    </div>
                                      {milestone.parent_note && (
                                        <div style={{
                                          marginBottom: '8px',
                                          padding: '8px 10px',
                                          borderRadius: '8px',
                                          background: '#fff7ed',
                                          borderLeft: '3px solid #f59e0b'
                                        }}>
                                          <div style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            color: '#9a3412',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            marginBottom: '4px'
                                          }}>
                                            Parent Note
                                          </div>
                                          <div style={{
                                            fontSize: '12px',
                                            color: '#7c2d12',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap'
                                          }}>
                                            {milestone.parent_note}
                                          </div>
                                        </div>
                                      )}
                                    {milestone.image && (
                                      <div style={{ marginBottom: '8px' }}>
                                        <img
                                          src={milestone.image}
                                          alt={milestone.title}
                                          style={{
                                            width: '100%',
                                            maxHeight: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb'
                                          }}
                                        />
                                      </div>
                                    )}
                                    {milestone.date_achieved && (() => {
                                      const targetStatus = getTargetDateStatus(milestone.date_achieved);
                                      return targetStatus?.isMissed ? (
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#b91c1c',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          background: '#fee2e2',
                                          padding: '4px 6px',
                                          borderRadius: '4px'
                                        }}>
                                          ⚠ Deadline missed ({targetStatus.formattedDate})
                                        </div>
                                      ) : (
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#6b7280',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}>
                                          🎯 Target: {targetStatus?.formattedDate}
                                        </div>
                                      );
                                    })()}
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

        {/* Follow Up Modal */}
        {selectedStudent && showFollowUpModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: 'white',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>Follow Up</div>
                <button
                  onClick={handleCloseFollowUp}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    cursor: followUpSending ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                  disabled={followUpSending}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                  Send follow-up message to: <strong>{selectedStudent.parent_name || 'Parent'}</strong>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#4b5563',
                  marginBottom: '12px',
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}>
                  Milestone: <strong>{selectedFollowUpMilestone?.title || 'Not selected'}</strong>
                </div>
                <textarea
                  value={followUpMessage}
                  onChange={(e) => {
                    setFollowUpMessage(e.target.value);
                    if (followUpError) setFollowUpError('');
                  }}
                  placeholder="Write a follow-up message for this milestone..."
                  style={{
                    width: '100%',
                    minHeight: '130px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />

                {followUpError && (
                  <div style={{
                    marginTop: '10px',
                    fontSize: '13px',
                    color: '#b91c1c',
                    background: '#fee2e2',
                    padding: '8px 10px',
                    borderRadius: '8px'
                  }}>
                    {followUpError}
                  </div>
                )}

                {followUpSuccess && (
                  <div style={{
                    marginTop: '10px',
                    fontSize: '13px',
                    color: '#065f46',
                    background: '#d1fae5',
                    padding: '8px 10px',
                    borderRadius: '8px'
                  }}>
                    {followUpSuccess}
                  </div>
                )}

                <div style={{
                  marginTop: '14px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    onClick={handleCloseFollowUp}
                    disabled={followUpSending}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#e5e7eb',
                      color: '#1f2937',
                      fontWeight: '600',
                      cursor: followUpSending ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendFollowUp}
                    disabled={followUpSending}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      background: followUpSending ? '#c4b5fd' : '#7c3aed',
                      color: 'white',
                      fontWeight: '600',
                      cursor: followUpSending ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {followUpSending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestone Review Modal */}
        {reviewingMilestone && (
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
            zIndex: 1001,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                padding: '24px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                color: 'white',
                position: 'relative'
              }}>
                <button
                  onClick={handleCloseReview}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '10px',
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>
                    {reviewingMilestone.category === 'social-emotional' && '👥'}
                    {reviewingMilestone.category === 'cognitive' && '🧠'}
                    {reviewingMilestone.category === 'physical' && '💪'}
                    {reviewingMilestone.category === 'language' && '🗣️'}
                    {reviewingMilestone.category === 'self-care' && '🧼'}
                    {reviewingMilestone.category === 'executive-function' && '🎯'}
                  </div>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700' }}>
                      {reviewingMilestone.title}
                    </h2>
                    <div style={{ fontSize: '14px', opacity: 0.9, textTransform: 'capitalize' }}>
                      {reviewingMilestone.category.replace('-', ' ')} Milestone
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '24px' }}>
                {/* Milestone Image */}
                {reviewingMilestone.image && (
                  <div style={{ marginBottom: '24px' }}>
                    <img
                      src={reviewingMilestone.image}
                      alt={reviewingMilestone.title}
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </div>
                )}

                {/* Target Date */}
                {reviewingMilestone.date_achieved && (() => {
                  const targetStatus = getTargetDateStatus(reviewingMilestone.date_achieved);
                  return (
                    <div style={{
                      background: targetStatus?.isMissed ? '#fee2e2' : '#f3f4f6',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderLeft: targetStatus?.isMissed ? '3px solid #dc2626' : '3px solid #8b5cf6'
                    }}>
                      <span style={{ fontSize: '18px' }}>{targetStatus?.isMissed ? '⚠' : '🎯'}</span>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Target Date</div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: targetStatus?.isMissed ? '#b91c1c' : '#111827'
                        }}>
                          {targetStatus?.longFormattedDate}
                        </div>
                        {targetStatus?.isMissed && (
                          <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                            Deadline missed
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Description */}
                {reviewingMilestone.description && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '12px'
                    }}>
                      Description
                    </h3>
                    <div style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {reviewingMilestone.description.split('\n').map((line, idx) => {
                        if (line.startsWith('👉')) {
                          return (
                            <div key={idx} style={{
                              background: '#d1fae5',
                              padding: '12px',
                              borderRadius: '8px',
                              marginTop: '12px',
                              color: '#059669',
                              fontWeight: '500',
                              fontSize: '13px'
                            }}>
                              {line}
                            </div>
                          );
                        }
                        return <div key={idx} style={{ marginBottom: '8px' }}>{line}</div>;
                      })}
                    </div>
                  </div>
                )}

                {reviewingMilestone.parent_note && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '12px'
                    }}>
                      Parent Note
                    </h3>
                    <div style={{
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderLeft: '4px solid #f59e0b',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#7c2d12',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {reviewingMilestone.parent_note}
                    </div>
                  </div>
                )}

                {/* Student Info */}
                {selectedStudent && (
                  <div style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      Student Information
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {selectedStudent.photo && (
                        <img
                          src={selectedStudent.photo}
                          alt={selectedStudent.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e5e7eb'
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {selectedStudent.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Parent: {selectedStudent.parent_name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Section */}
                <div style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px'
                  }}>
                    Rate Performance (1-10)
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '16px'
                  }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRating(num)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          border: rating === num ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                          background: rating === num ? '#8b5cf6' : 'white',
                          color: rating === num ? 'white' : '#111827',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: rating === num ? '700' : '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggestions Section */}
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px'
                  }}>
                    Suggestions
                  </h3>
                  <textarea
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="Write your suggestions or comments here..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Mark Complete Button */}
                <div style={{
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    onClick={() => handleOpenFollowUp(reviewingMilestone)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#ede9fe',
                      color: '#6d28d9',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}
                  >
                    Send Follow-Up For This Milestone
                  </button>
                  <button
                    onClick={async () => {
                      if (rating === 0) {
                        alert('Please provide a rating before marking as complete.');
                        return;
                      }
                      
                      try {
                        // Create progress report with behavior as notes
                        const behavior = reviewingMilestone.title || 'Milestone completed';
                        const notesText = suggestions ? `Behavior: ${behavior}\n\nSuggestions: ${suggestions}` : `Behavior: ${behavior}`;
                        
                        const progressData = {
                          child: selectedStudent.id,
                          notes: notesText,
                          overall_score: rating * 10 // Convert 1-10 to percentage
                        };
                        
                        await API.post('progress_reports/', progressData);
                        
                        // Save to completed milestones in localStorage
                        const completedMilestone = {
                          ...reviewingMilestone,
                          rating: rating,
                          suggestions: suggestions,
                          completedDate: new Date().toISOString(),
                          childId: selectedStudent.id,
                          childName: selectedStudent.name
                        };
                        
                        const storageKey = `completedMilestones_${selectedStudent.id}`;
                        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                        existing.push(completedMilestone);
                        localStorage.setItem(storageKey, JSON.stringify(existing));
                        
                        // Delete the milestone from active milestones
                        await API.delete(`milestones/${reviewingMilestone.id}/`);
                        
                        // Remove from local state
                        const category = reviewingMilestone.category;
                        setStudentMilestones(prev => ({
                          ...prev,
                          [category]: prev[category].filter(m => m.id !== reviewingMilestone.id)
                        }));
                        
                        alert(`Milestone marked as complete!\nRating: ${rating}/10\nMilestone moved to completed section!`);
                        handleCloseReview();
                        // Don't close profile so user can see updated list
                      } catch (error) {
                        console.error('Error completing milestone:', error);
                        alert('Failed to mark milestone as complete. Please try again.');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ✓ Mark as Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Student;
