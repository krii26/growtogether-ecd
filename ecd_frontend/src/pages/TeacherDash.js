import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const TeacherDash = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    resultsPublished: 0,
    resourcesAccessed: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        // Load user info from localStorage or API
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserInfo({
            first_name: user.first_name || 'John',
            last_name: user.last_name || 'Doe',
            role: user.role || 'Teacher'
          });
        }

        // Load dashboard data
        const [childrenRes] = await Promise.all([
          API.get('children/'),
        ]);
        
        setStats({
          totalStudents: childrenRes.data?.length || 24,
          resultsPublished: 18,
          resourcesAccessed: 42,
        });

        // Mock recent activities
        setRecentActivities([
          {
            id: 1,
            type: 'result',
            icon: '✓',
            iconBg: '#d1fae5',
            iconColor: '#059669',
            title: 'Published results for Emma Johnson',
            subtitle: 'Social-Emotional Development Assessment',
            time: '1 hour ago'
          },
          {
            id: 2,
            type: 'library',
            icon: '📚',
            iconBg: '#dbeafe',
            iconColor: '#2563eb',
            title: 'Accessed E-Library resource',
            subtitle: 'Emotional Development Stages',
            time: '3 hours ago'
          }
        ]);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Styles
  const layout = {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: 0,
    minHeight: '100vh',
    background: '#fafafa',
  };

  const sidebar = {
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100vh',
    position: 'sticky',
    top: 0
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
    color: 'white',
    fontSize: '20px'
  };

  const logoText = {
    fontSize: 18,
    fontWeight: 700,
    color: '#333'
  };

  const navItem = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    color: '#6b7280',
    cursor: 'pointer',
    marginBottom: 4,
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.2s'
  };

  const navActive = { 
    ...navItem, 
    background: '#f3e8ff', 
    color: '#7c3aed',
    fontWeight: 600
  };

  const iconStyle = {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center'
  };

  const userSection = {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px',
    marginTop: 'auto'
  };

  const userProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#f9fafb',
    borderRadius: 10,
    cursor: 'pointer'
  };

  const userAvatar = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '16px'
  };

  const userInfo2 = {
    flex: 1
  };

  const userName = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    lineHeight: 1.2
  };

  const userRole = {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: 2
  };

  const logoutIcon = {
    fontSize: '18px',
    color: '#9ca3af',
    cursor: 'pointer'
  };

  const content = {
    background: '#fafafa',
    padding: '32px 40px',
  };

  const header = {
    marginBottom: 32
  };

  const title = { 
    fontSize: 28, 
    fontWeight: 700, 
    color: '#1f2937',
    marginBottom: 4
  };

  const subtitle = { 
    fontSize: 14, 
    color: '#6b7280'
  };

  const statsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    marginBottom: 32
  };

  const statCard = {
    background: '#ffffff',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  };

  const statIconWrapper = (bg) => ({
    width: 48,
    height: 48,
    borderRadius: 10,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  });

  const statIcon = {
    fontSize: '24px'
  };

  const statValue = {
    fontSize: 32,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 4
  };

  const statLabel = {
    fontSize: 14,
    color: '#6b7280'
  };

  const activitySection = {
    background: '#ffffff',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  };

  const sectionTitle = {
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 20
  };

  const activityItem = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: '16px',
    borderRadius: 10,
    background: '#fafafa',
    marginBottom: 12,
    border: '1px solid #f3f4f6'
  };

  const activityIcon = (bg, color) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    background: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0
  });

  const activityContent = {
    flex: 1
  };

  const activityTitle = {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 4
  };

  const activitySubtitle = {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4
  };

  const activityTime = {
    fontSize: 12,
    color: '#9ca3af'
  };

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div>
          {/* Logo */}
          <div style={logoSection}>
            <div style={logoIcon}>👶</div>
            <div style={logoText}>GrowTogether</div>
          </div>

          {/* Navigation */}
          <div style={navActive}>
            <span style={iconStyle}>🏠</span>
             Dashboard
          </div>
          <div style={navItem} onClick={() => navigate('/students')}>
            <span style={iconStyle}>👥</span>
            Students
          </div>
          <div style={navItem} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem} onClick={() => navigate('/publish-results')}>
            <span style={iconStyle}>📊</span>
            Publish Results
          </div>
        </div>

        {/* User Profile Section */}
        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>
              {userInfo.first_name?.[0]}{userInfo.last_name?.[0]}
            </div>
            <div style={userInfo2}>
              <div style={userName}>{userInfo.first_name} {userInfo.last_name}</div>
              <div style={userRole}>{userInfo.role}</div>
            </div>
            <div style={logoutIcon} onClick={handleLogout}>
              ↗
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={content}>
        {/* Header */}
        <div style={header}>
          <div style={title}>Teacher Dashboard</div>
          <div style={subtitle}>Welcome back! Here's what's happening today.</div>
        </div>

        {/* Stats Cards */}
        <div style={statsGrid}>
          <div style={statCard}>
            <div style={statIconWrapper('#dbeafe')}>
              <span style={{ ...statIcon, color: '#2563eb' }}>👥</span>
            </div>
            <div style={statValue}>{stats.totalStudents}</div>
            <div style={statLabel}>Total Students</div>
          </div>

          <div style={statCard}>
            <div style={statIconWrapper('#d1fae5')}>
              <span style={{ ...statIcon, color: '#059669' }}>✓</span>
            </div>
            <div style={statValue}>{stats.resultsPublished}</div>
            <div style={statLabel}>Results Published</div>
          </div>

          <div style={statCard}>
            <div style={statIconWrapper('#e9d5ff')}>
              <span style={{ ...statIcon, color: '#7c3aed' }}>📚</span>
            </div>
            <div style={statValue}>{stats.resourcesAccessed}</div>
            <div style={statLabel}>Resources Accessed</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={activitySection}>
          <div style={sectionTitle}>Recent Activity</div>
          
          {recentActivities.map(activity => (
            <div key={activity.id} style={activityItem}>
              <div style={activityIcon(activity.iconBg, activity.iconColor)}>
                {activity.icon}
              </div>
              <div style={activityContent}>
                <div style={activityTitle}>{activity.title}</div>
                <div style={activitySubtitle}>{activity.subtitle}</div>
                <div style={activityTime}>{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeacherDash;
