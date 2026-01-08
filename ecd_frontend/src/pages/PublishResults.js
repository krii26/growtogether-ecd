import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const PublishResults = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await API.get('children/');
      setChildren(response.data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const assessments = useMemo(() => [
    'Social-Emotional Development',
    'Cognitive',
    'Language',
    'Motor Skills',
    'Behavior'
  ], []);

  const recent = useMemo(() => [
    { id: 1, title: 'Emma Johnson - Social-Emotional', score: 85, time: 'Published 2 hours ago' },
    { id: 2, title: 'Oliver Smith - Cognitive', score: 92, time: 'Published 4 hours ago' },
    { id: 3, title: 'Sophia Davis - Language', score: 68, time: 'Published yesterday' },
  ], []);

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

  const logoText = { fontWeight: 700, fontSize: 18, color: '#111827' };

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
  const header = { marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const title = { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 4 };
  const subtitle = { color: '#6b7280' };
  const newBtn = {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(168,85,247,0.25)'
  };

  const card = {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 24
  };

  const label = { fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 8 };
  const select = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none' };
  const input = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none' };
  const textarea = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', minHeight: 120, resize: 'vertical' };

  const publishBtn = {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    boxShadow: '0 12px 30px rgba(168,85,247,0.35)'
  };

  const recentCard = { ...card, marginBottom: 0 };
  const recentItem = { border: '1px solid #f3f4f6', borderRadius: 14, padding: '14px 16px', marginBottom: 12, background: '#fdfcff' };
  const recentTitle = { fontWeight: 700, color: '#111827', marginBottom: 4 };
  const recentMeta = { color: '#6b7280', fontSize: 13 };

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
          <div style={navItem()} onClick={() => navigate('/students')}>
            <span style={iconStyle}>👥</span>
            Students
          </div>
          <div style={navItem()} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem(true)}>
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
          <div>
            <div style={title}>Publish Results</div>
            <div style={subtitle}>Welcome back! Here's what's happening today.</div>
          </div>
          <button style={newBtn}>+ New Assessment</button>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', marginBottom: 16 }}>Create New Assessment</div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Select Student</div>
            {loading ? (
              <select style={select} disabled>
                <option>Loading students...</option>
              </select>
            ) : children.length === 0 ? (
              <select style={select} disabled>
                <option>No students with child profiles found</option>
              </select>
            ) : (
              <select 
                style={select} 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">-- Select a student --</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Assessment Type</div>
            <select 
              style={select}
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
            >
              <option value="">-- Select assessment type --</option>
              <option value="Social-Emotional Development">Social-Emotional Development</option>
              <option value="Cognitive">Cognitive</option>
              <option value="Language">Language</option>
              <option value="Motor Skills">Motor Skills</option>
              <option value="Behavior">Behavior</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Score</div>
            <input 
              style={input} 
              placeholder="Enter score (0-100)" 
              type="number" 
              min="0" 
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Comments</div>
            <textarea 
              style={textarea} 
              placeholder="Add your observations and comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <button style={publishBtn}>Publish Assessment</button>
        </div>

        <div style={recentCard}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', marginBottom: 12 }}>Recent Assessments</div>
          {recent.map((r) => (
            <div key={r.id} style={recentItem}>
              <div style={recentTitle}>{r.title}</div>
              <div style={recentMeta}>Score: {r.score}/100</div>
              <div style={recentMeta}>{r.time}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PublishResults;
