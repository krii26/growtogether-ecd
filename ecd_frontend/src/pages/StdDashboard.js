import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const StdDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    children: 0,
    activities: 0,
    milestones: 0,
    reports: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [children, setChildren] = useState([]);
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
            role: user.role || 'Parent'
          });
        }

        const [childrenRes, activitiesRes, milestonesRes, reportsRes] = await Promise.all([
          API.get('children/'),
          API.get('activities/'),
          API.get('milestones/'),
          API.get('progress_reports/'),
        ]);
        setCounts({
          children: childrenRes.data?.length || 0,
          activities: activitiesRes.data?.length || 0,
          milestones: milestonesRes.data?.length || 0,
          reports: reportsRes.data?.length || 0,
        });
        setChildren(childrenRes.data || []);
        setRecentActivities((activitiesRes.data || []).slice(0, 3));
        setUpcomingMilestones((milestonesRes.data || []).slice(0, 3));
        setProgressReports((reportsRes.data || []).slice(-5).reverse());
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

  const layout = {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 16,
    minHeight: 'calc(100vh - 140px)',
    background: '#f6f7fb',
    padding: '16px 20px',
  };

  const sidebar = {
    background: '#f8f9fa',
    borderRadius: 0,
    boxShadow: 'none',
    padding: '20px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const navItem = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    color: '#666',
    cursor: 'pointer',
    marginBottom: 8,
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.2s'
  };

  const navActive = { 
    ...navItem, 
    background: '#e8d5f2', 
    color: '#6a11cb',
    fontWeight: 600
  };

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
    color: '#999',
    marginTop: 2
  };

  const logoutIcon = {
    fontSize: '18px',
    color: '#999',
    cursor: 'pointer'
  };

  const content = {
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: 16,
  };

  const topBar = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottom: '1px solid #eee'
  };

  const titleWrap = { display: 'flex', flexDirection: 'column' };
  const title = { fontSize: 22, fontWeight: 700, color: '#222' };
  const subtitle = { fontSize: 12, color: '#666', marginTop: 4 };

  const logoTopRight = { width: 36, height: 36, borderRadius: '50%' };

  const cards = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
    gap: 12,
    marginTop: 16
  };
  const card = {
    background: '#ffffff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
  };
  const cardTitle = { fontSize: 12, color: '#666' };
  const cardValue = { fontSize: 24, fontWeight: 700, marginTop: 6 };

  const twoCols = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginTop: 16
  };

  const listCard = { ...card };
  const listItem = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 10,
    background: '#f8f9ff',
    marginBottom: 8
  };

  const progressWrap = { width: '100%', background: '#eee', borderRadius: 6, height: 6 };
  const progressBar = (pct, color) => ({ width: pct + '%', height: '100%', borderRadius: 6, background: color });

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div>
          <div style={navActive}>
            <span style={iconStyle}>🏠</span>
            Student Dashboard
          </div>
          <div style={navItem} onClick={() => navigate('/children')}>
            <span style={iconStyle}>👶</span>
            My Children
          </div>
          <div style={navItem} onClick={() => navigate('/milestones')}>
            <span style={iconStyle}>📋</span>
            Milestones
          </div>
          <div style={navItem} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem}>
            <span style={iconStyle}>💡</span>
            Activities
          </div>
        </div>

        {/* User Profile Section */}
        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>
              {userInfo.first_name.charAt(0)}{userInfo.last_name.charAt(0)}
            </div>
            <div style={userInfo2}>
              <div style={userName}>
                {userInfo.first_name} {userInfo.last_name}
              </div>
              <div style={userRole}>
                {userInfo.role}
              </div>
            </div>
            <div style={logoutIcon} onClick={handleLogout} title="Logout">
              ⎋
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main>
        <div style={content}>
          <div style={topBar}>
            <div style={titleWrap}>
              <span style={title}>Student Dashboard</span>
              <span style={subtitle}>Welcome back! Here's what's happening today.</span>
            </div>
            {/* Top-right app logo */}
            <img src="/logo.png" alt="GrowTogether" style={logoTopRight} />
          </div>

          {/* Summary Cards */}
          <div style={cards}>
            <div style={card}>
              <div style={cardTitle}>Children Profiles</div>
              <div style={cardValue}>{counts.children}</div>
            </div>
            <div style={card}>
              <div style={cardTitle}>Total Milestones</div>
              <div style={cardValue}>{counts.milestones}</div>
            </div>
            <div style={card}>
              <div style={cardTitle}>Progress Reports</div>
              <div style={cardValue}>{counts.reports}</div>
            </div>
            <div style={card}>
              <div style={cardTitle}>Activity Ideas</div>
              <div style={cardValue}>{counts.activities}</div>
            </div>
          </div>

          {/* Two column sections */}
          <div style={twoCols}>
            {/* Recent Activities */}
            <div style={listCard}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Activities</div>
              {recentActivities.length === 0 && (
                <div style={{ color: '#777', fontSize: 12 }}>No activities yet.</div>
              )}
              {recentActivities.map((a, idx) => (
                <div key={idx} style={listItem}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Recommended age: {a.recommended_age}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Milestones */}
            <div style={listCard}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Upcoming Milestones</div>
              {upcomingMilestones.length === 0 && (
                <div style={{ color: '#777', fontSize: 12 }}>No milestones yet.</div>
              )}
              {upcomingMilestones.map((m, idx) => {
                const pct = [75, 60, 90][idx % 3];
                const color = ['#8a5cf6', '#2a74ff', '#18b162'][idx % 3];
                return (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{pct}%</div>
                    </div>
                    <div style={progressWrap}>
                      <div style={progressBar(pct, color)} />
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{m.description?.slice(0, 70) || 'Milestone'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Reports Section */}
          <div style={listCard}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>📊 Recent Progress Reports</div>
            {progressReports.length === 0 ? (
              <div style={{ color: '#777', fontSize: 13, padding: '12px 0' }}>No progress reports published yet.</div>
            ) : (
              progressReports.map((report) => {
                const child = children.find(c => c.id === report.child);
                const childName = child ? child.name : 'Unknown Child';
                const date = new Date(report.report_date);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                return (
                  <div key={report.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: '14px 16px',
                    marginBottom: 12,
                    background: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>{childName}</div>
                      <div style={{
                        background: report.overall_score >= 75 ? '#d1fae5' : report.overall_score >= 50 ? '#fef3c7' : '#fee2e2',
                        color: report.overall_score >= 75 ? '#059669' : report.overall_score >= 50 ? '#d97706' : '#dc2626',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700
                      }}>
                        Score: {report.overall_score || 'N/A'}/100
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{report.notes}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Published: {formattedDate}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StdDashboard;
