import React, { useEffect, useState } from 'react';
import API from '../api/api';

const StdDashboard = () => {
  const [counts, setCounts] = useState({
    children: 0,
    activities: 0,
    milestones: 0,
    reports: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
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
        setRecentActivities((activitiesRes.data || []).slice(0, 3));
        setUpcomingMilestones((milestonesRes.data || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    load();
  }, []);

  const layout = {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 16,
    minHeight: 'calc(100vh - 140px)',
    background: '#f6f7fb',
    padding: '16px 20px',
  };

  const sidebar = {
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: 12,
    position: 'sticky',
    top: 16,
    height: 'fit-content'
  };

  const navItem = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    color: '#333',
    cursor: 'pointer'
  };

  const navActive = { ...navItem, background: '#f0ecff', color: '#6a11cb' };

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
        <div style={navActive}>Student Dashboard</div>
        <div style={navItem}>My Courses</div>
        <div style={navItem}>Checklist</div>
        <div style={navItem}>E-Library</div>
        <div style={navItem}>Activities</div>
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
        </div>
      </main>
    </div>
  );
};

export default StdDashboard;
