import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Activities = () => {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState('All Ages');
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });

  const activities = [
    {
      id: 1,
      age: 'Age 3-4',
      title: 'Color Sorting Game',
      description: 'Help your child learn colors by sorting objects into color-coded containers.',
      duration: '15 min',
      domain: 'Cognitive'
    },
    {
      id: 2,
      age: 'Age 4-5',
      title: 'Obstacle Course',
      description: 'Create a fun indoor obstacle course to develop gross motor skills and coordination.',
      duration: '30 min',
      domain: 'Physical'
    },
    {
      id: 3,
      age: 'Age 2-3',
      title: 'Story Time Circle',
      description: 'Interactive storytelling session to enhance language and listening skills.',
      duration: '20 min',
      domain: 'Language'
    },
    {
      id: 4,
      age: 'Age 5-6',
      title: 'Science Experiment',
      description: 'Simple experiments like mixing colors or making bubbles to spark curiosity.',
      duration: '25 min',
      domain: 'Science'
    },
    {
      id: 5,
      age: 'Age 3-4',
      title: 'Playdough Creations',
      description: 'Encourage creativity and fine motor skills through playdough modeling.',
      duration: '20 min',
      domain: 'Fine Motor'
    },
    {
      id: 6,
      age: 'Age 4-5',
      title: 'Music and Movement',
      description: 'Dance and sing along to music to develop rhythm and coordination.',
      duration: '15 min',
      domain: 'Creative'
    }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo({
        first_name: user.first_name || 'John',
        last_name: user.last_name || 'Doe',
        role: user.role || 'Parent'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ages = ['All Ages', 'Age 2-3', 'Age 3-4', 'Age 4-5', 'Age 5-6'];
  const filteredActivities = selectedAge === 'All Ages'
    ? activities
    : activities.filter((a) => a.age === selectedAge);

  const layout = {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    minHeight: '100vh',
    background: '#f8f9fa'
  };

  const sidebar = {
    background: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    padding: '20px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const navItem = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    color: active ? '#6a11cb' : '#666',
    background: active ? '#e8d5f2' : 'transparent',
    cursor: 'pointer',
    marginBottom: 8,
    fontSize: '15px',
    fontWeight: active ? 600 : 500,
    transition: 'all 0.2s'
  });

  const iconStyle = {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center'
  };

  const userSection = {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '16px',
    marginTop: 'auto'
  };

  const userProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#fff',
    borderRadius: 10,
    cursor: 'pointer'
  };

  const userAvatar = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '16px'
  };

  const userInfo2 = { flex: 1 };

  const userName = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    lineHeight: 1.2
  };

  const userRole = {
    fontSize: '12px',
    color: '#999',
    marginTop: 2
  };

  const logoutIcon = {
    fontSize: '18px',
    color: '#999',
    cursor: 'pointer'
  };

  const mainContent = {
    padding: '32px',
    background: '#fff'
  };

  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  };

  const pageTitle = {
    fontSize: '26px',
    fontWeight: 700,
    color: '#333',
    margin: 0
  };

  const pageSubtitle = {
    fontSize: '14px',
    color: '#666',
    marginTop: 6
  };

  const notificationIcon = {
    position: 'relative',
    fontSize: '20px',
    cursor: 'pointer'
  };

  const notificationDot = {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    background: '#ef4444',
    borderRadius: '50%'
  };

  const toolbar = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  };

  const sectionTitle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#333',
    margin: 0
  };

  const sectionSubtitle = {
    fontSize: '13px',
    color: '#777',
    marginTop: 4
  };

  const dropdown = {
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '13px',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none'
  };

  const cardsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))',
    gap: '18px'
  };

  const card = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    padding: '18px',
    border: '1px solid #f3f4f6'
  };

  const cardHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  };

  const ageBadge = (age) => {
    const colors = {
      'Age 2-3': { bg: '#dbeafe', color: '#2563eb' },
      'Age 3-4': { bg: '#ede9fe', color: '#7c3aed' },
      'Age 4-5': { bg: '#dcfce7', color: '#16a34a' },
      'Age 5-6': { bg: '#fee2e2', color: '#dc2626' }
    };
    const c = colors[age] || { bg: '#f3f4f6', color: '#6b7280' };
    return {
      background: c.bg,
      color: c.color,
      fontSize: '12px',
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: '999px'
    };
  };

  const bookmark = {
    fontSize: '16px',
    color: '#9ca3af'
  };

  const cardTitle = {
    fontSize: '16px',
    fontWeight: 700,
    color: '#333',
    marginBottom: 6
  };

  const cardDesc = {
    fontSize: '13px',
    color: '#666',
    lineHeight: 1.5,
    marginBottom: 12
  };

  const metaRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: 14
  };

  const actionBtn = {
    width: '100%',
    padding: '10px',
    background: '#f3e8ff',
    color: '#6a11cb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  };

  return (
    <div style={layout}>
      <aside style={sidebar}>
        <div>
          <div style={navItem(false)} onClick={() => navigate('/std_dashboard')}>
            <span style={iconStyle}>🏠</span>
            Dashboard
          </div>
          <div style={navItem(false)} onClick={() => navigate('/children')}>
            <span style={iconStyle}>👶</span>
            My Children
          </div>
          <div style={navItem(false)} onClick={() => navigate('/milestones')}>
            <span style={iconStyle}>📋</span>
            Milestones
          </div>
          <div style={navItem(false)} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem(true)}>
            <span style={iconStyle}>💡</span>
            Activities
          </div>
        </div>
        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>
              {userInfo.first_name.charAt(0)}{userInfo.last_name.charAt(0)}
            </div>
            <div style={userInfo2}>
              <div style={userName}>
                {userInfo.first_name} {userInfo.last_name}
              </div>
              <div style={userRole}>{userInfo.role}</div>
            </div>
            <div style={logoutIcon} onClick={handleLogout} title="Logout">
              ⎋
            </div>
          </div>
        </div>
      </aside>

      <main style={mainContent}>
        <div style={header}>
          <div>
            <h1 style={pageTitle}>Activity Suggestions</h1>
            <div style={pageSubtitle}>Welcome back! Here's what's happening today.</div>
          </div>
          <div style={notificationIcon}>
            🔔
            <span style={notificationDot}></span>
          </div>
        </div>

        <div style={toolbar}>
          <div>
            <div style={sectionTitle}>Activity Suggestions</div>
            <div style={sectionSubtitle}>Age-appropriate activities for your child's development</div>
          </div>
          <select
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
            style={dropdown}
          >
            {ages.map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        <div style={cardsGrid}>
          {filteredActivities.map((activity) => (
            <div key={activity.id} style={card}>
              <div style={cardHeader}>
                <span style={ageBadge(activity.age)}>{activity.age}</span>
                <span style={bookmark}>🔖</span>
              </div>
              <div style={cardTitle}>{activity.title}</div>
              <div style={cardDesc}>{activity.description}</div>
              <div style={metaRow}>
                <span>🕒 {activity.duration}</span>
                <span>• {activity.domain}</span>
              </div>
              <button style={actionBtn}>View Details</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Activities;
