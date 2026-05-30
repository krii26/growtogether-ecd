import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import ParentSidebar from '../components/ParentSidebar';

const StdDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    children: 0,
    activities: 0,
    milestones: 0,
    reports: 0,
  });
  const [progressReports, setProgressReports] = useState([]);
  const [children, setChildren] = useState([]);
  const [followMessages, setFollowMessages] = useState([]);
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        // Load user info from localStorage or API
        const storedUser = sessionStorage.getItem('user');
        let parentFullName = '';
        let parentFirstName = '';
        let parentLastName = '';
        let currentUserId = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          currentUserId = user.id || null;
          parentFirstName = (user.first_name || '').trim();
          parentLastName = (user.last_name || '').trim();
          parentFullName = `${parentFirstName} ${parentLastName}`.trim();
          setUserInfo({
            first_name: user.first_name || 'John',
            last_name: user.last_name || 'Doe',
            role: user.role || 'Parent'
          });
        }

        const [childrenRes, activitiesRes, milestonesRes, reportsRes, followMessagesRes] = await Promise.all([
          API.get('children/', { skipCache: true }),
          API.get('activities/'),
          API.get('milestones/', { skipCache: true }),
          API.get('progress_reports/', { skipCache: true }),
          API.get('follow_up_messages/', { skipCache: true }),
        ]);

        const allChildren = childrenRes.data || [];
        const ownedChildren = currentUserId
          ? allChildren.filter((child) => String(child?.parent) === String(currentUserId))
          : allChildren.filter((child) => {
              const parentName = (child?.parent_name || '').trim().toLowerCase();
              return parentName && parentName.includes(parentFullName.toLowerCase());
            });
        const ownedChildIds = new Set(ownedChildren.map((child) => child.id));
        const ownedReports = (reportsRes.data || []).filter((report) => ownedChildIds.has(report.child));

        setCounts({
          children: ownedChildren.length,
          activities: activitiesRes.data?.length || 0,
          milestones: (milestonesRes.data || []).filter((milestone) => ownedChildIds.has(milestone.child)).length,
          reports: ownedReports.length,
        });
        setChildren(ownedChildren);

        const sortedRecentReports = [...ownedReports]
          .sort((a, b) => {
            const dateA = new Date(a.report_date || 0).getTime();
            const dateB = new Date(b.report_date || 0).getTime();
            if (dateA !== dateB) {
              return dateB - dateA;
            }
            return (b.id || 0) - (a.id || 0);
          })
          .slice(0, 5);
        setProgressReports(sortedRecentReports);

        const allMessages = [...(followMessagesRes.data || [])].sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          if (dateA !== dateB) {
            return dateB - dateA;
          }
          return (b.id || 0) - (a.id || 0);
        });
        const normalizedFull = parentFullName.toLowerCase();
        const normalizedFirst = parentFirstName.toLowerCase();
        const normalizedLast = parentLastName.toLowerCase();

        const childParentNames = ownedChildren
          .map((child) => (child?.parent_name || '').trim().toLowerCase())
          .filter(Boolean);

        const candidateParentNames = Array.from(
          new Set([
            normalizedFull,
            normalizedFirst,
            normalizedLast,
            ...childParentNames,
          ].filter(Boolean))
        );

        const filteredByParent = candidateParentNames.length
          ? allMessages.filter((msg) => {
              if (msg.child && !ownedChildIds.has(msg.child)) return false;
              const parentName = (msg.parent_name || '').trim().toLowerCase();
              if (!parentName) return false;
              return candidateParentNames.some(
                (candidate) => parentName === candidate || parentName.includes(candidate)
              );
            })
          : allMessages;

        setFollowMessages(filteredByParent.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
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

  const listCard = { ...card };

  const parseStructuredNotes = (notes) => {
    const text = (notes || '').trim();
    if (!text) {
      return null;
    }

    const extract = (label) => {
      const pattern = new RegExp(`(?:^|\\n)${label}:\\s*([\\s\\S]*?)(?=\\n[A-Za-z ]+:|$)`, 'i');
      const match = text.match(pattern);
      return match ? match[1].trim() : '';
    };

    const behavior = extract('Behavior');
    const category = extract('Category');
    const remark = extract('Remark');
    const cause = extract('Cause');
    const fixPlan = extract('Fix Plan');
    const practicePlan = extract('Practice Plan');
    const activities = extract('Recommended activities');
    const library = extract('Recommended library content');

    if (!behavior && !category && !remark && !cause && !fixPlan && !practicePlan && !activities && !library) {
      return null;
    }

    const splitList = (value) =>
      (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    return {
      behavior,
      category,
      remark,
      cause,
      fixPlan,
      practicePlan,
      activities: splitList(activities),
      library: splitList(library),
    };
  };

  const reportTopicLabel = {
    behavior: 'Behavior',
    category: 'Category',
    remark: 'Remark',
    cause: 'Likely Cause',
    fixPlan: 'Fix Plan',
    practicePlan: 'Practice Plan',
    activities: 'Recommended Activities',
    library: 'Recommended Library Content',
  };

  return (
    <div style={layout}>
      <ParentSidebar activeKey="dashboard" userInfo={userInfo} onLogout={handleLogout} />

      {/* Main Content */}
      <main>
        <div style={content}>
          <div style={topBar}>
            <div style={titleWrap}>
              <span style={title}>Student Dashboard</span>
              <span style={subtitle}>Welcome back! Here's what's happening today.</span>
            </div>
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

          {/* Follow Messages */}
          <div style={{ ...listCard, marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>
              🔔 Follow Messages
            </div>
            {followMessages.length === 0 ? (
              <div style={{ color: '#777', fontSize: 13, padding: '8px 0' }}>
                No follow messages yet.
              </div>
            ) : (
              followMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 10,
                    background: '#f9fafb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                    gap: 10,
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#4338ca' }}>
                      Follow Message
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {new Date(msg.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    For: {msg.child_name || 'Child'}
                  </div>
                  {msg.milestone_title && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                      Milestone: {msg.milestone_title}
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: '#1f2937', lineHeight: 1.6 }}>
                    {msg.message}
                  </div>
                </div>
              ))
            )}
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
                const parsed = parseStructuredNotes(report.notes);
                
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
                        Score: {report.overall_score ? (report.overall_score / 10) : 'N/A'}/10
                      </div>
                    </div>

                    {parsed ? (
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 10,
                        padding: '10px 12px',
                        marginBottom: 8
                      }}>
                        {parsed.behavior && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 2 }}>
                              {reportTopicLabel.behavior}
                            </div>
                            <div style={{ fontSize: 13, color: '#1f2937', fontWeight: 600 }}>{parsed.behavior}</div>
                          </div>
                        )}

                        {parsed.category && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{
                              display: 'inline-block',
                              background: '#ede9fe',
                              color: '#5b21b6',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 8px'
                            }}>
                              {reportTopicLabel.category}: {parsed.category}
                            </span>
                          </div>
                        )}

                        {parsed.remark && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 2 }}>
                              {reportTopicLabel.remark}
                            </div>
                            <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.5, fontWeight: 600 }}>
                              {parsed.remark}
                            </div>
                          </div>
                        )}

                        {parsed.cause && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 2 }}>
                              {reportTopicLabel.cause}
                            </div>
                            <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{parsed.cause}</div>
                          </div>
                        )}

                        {parsed.fixPlan && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 2 }}>
                              {reportTopicLabel.fixPlan}
                            </div>
                            <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{parsed.fixPlan}</div>
                          </div>
                        )}

                        {parsed.practicePlan && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 2 }}>
                              {reportTopicLabel.practicePlan}
                            </div>
                            <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{parsed.practicePlan}</div>
                          </div>
                        )}

                        {parsed.activities.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>
                              {reportTopicLabel.activities}
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151' }}>
                              {parsed.activities.map((item, idx) => (
                                <li key={`activity-${report.id}-${idx}`} style={{ marginBottom: 2 }}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {parsed.library.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>
                              {reportTopicLabel.library}
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151' }}>
                              {parsed.library.map((item, idx) => (
                                <li key={`library-${report.id}-${idx}`} style={{ marginBottom: 2 }}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        fontSize: 13,
                        color: '#6b7280',
                        marginBottom: 8,
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 10,
                        padding: '10px 12px',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {report.notes || 'No note provided.'}
                      </div>
                    )}
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
