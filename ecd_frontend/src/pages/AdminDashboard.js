import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ROLE_OPTIONS = ['PARENT', 'TEACHER', 'ADMIN'];
const LOCAL_FOLLOW_UP_KEY = 'admin_unresolved_followups';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState({
    first_name: 'Admin',
    last_name: 'User',
    role: 'ADMIN'
  });

  const [children, setChildren] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [resources, setResources] = useState([]);

  const [userSearch, setUserSearch] = useState('');
  const [childSearch, setChildSearch] = useState('');
  const [savingState, setSavingState] = useState(false);

  const [editingChild, setEditingChild] = useState(null);
  const [editChildForm, setEditChildForm] = useState({
    name: '',
    age: '',
    parent_name: '',
    date_of_birth: ''
  });

  const [reportFilters, setReportFilters] = useState({
    child: '',
    from: '',
    to: '',
    teacher: ''
  });

  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo({
        first_name: parsedUser.first_name || 'Admin',
        last_name: parsedUser.last_name || 'User',
        role: parsedUser.role || 'ADMIN'
      });
    }
  }, []);

  useEffect(() => {
    const persisted = localStorage.getItem(LOCAL_FOLLOW_UP_KEY);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) {
          setUnresolvedFollowups(new Set(parsed));
        }
      } catch (e) {
        console.error('Failed to parse unresolved follow-up state', e);
      }
    }
  }, []);

  const [unresolvedFollowups, setUnresolvedFollowups] = useState(new Set());

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        childrenRes,
        profilesRes,
        reportsRes,
        followupsRes,
        activitiesRes,
        milestonesRes,
        resourcesRes,
      ] = await Promise.all([
        API.get('children/'),
        API.get('user_profiles/'),
        API.get('progress_reports/'),
        API.get('follow_up_messages/'),
        API.get('activities/'),
        API.get('milestones/'),
        API.get('elibrary/'),
      ]);

      setChildren(childrenRes.data || []);
      setProfiles(profilesRes.data || []);
      setReports(reportsRes.data || []);
      setFollowUps(followupsRes.data || []);
      setActivities(activitiesRes.data || []);
      setMilestones(milestonesRes.data || []);
      setResources(resourcesRes.data || []);
    } catch (err) {
      console.error('Failed loading admin dashboard', err);
      setError('Failed to load dashboard data. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const addAuditLog = (message) => {
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ].slice(0, 12));
  };

  const users = useMemo(() => {
    return (profiles || []).map((profile) => ({
      profileId: profile.id,
      role: profile.role,
      phone_number: profile.phone_number,
      address: profile.address,
      id: profile.user?.id,
      username: profile.user?.username || '-',
      email: profile.user?.email || '-',
      first_name: profile.user?.first_name || '',
      last_name: profile.user?.last_name || '',
      is_active: profile.user?.is_active !== false,
      last_login: profile.user?.last_login,
      date_joined: profile.user?.date_joined,
    }));
  }, [profiles]);

  const childrenMap = useMemo(() => {
    const map = {};
    (children || []).forEach((child) => {
      map[child.id] = child;
    });
    return map;
  }, [children]);

  const reportCountByChild = useMemo(() => {
    const counts = {};
    (reports || []).forEach((report) => {
      counts[report.child] = (counts[report.child] || 0) + 1;
    });
    return counts;
  }, [reports]);

  const duplicateChildren = useMemo(() => {
    const groups = {};
    (children || []).forEach((child) => {
      const key = `${(child.name || '').trim().toLowerCase()}|${child.date_of_birth || ''}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(child);
    });
    return Object.values(groups).filter((group) => group.length > 1);
  }, [children]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.trim().toLowerCase();
      return (
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        fullName.includes(term) ||
        (user.role || '').toLowerCase().includes(term)
      );
    });
  }, [users, userSearch]);

  const filteredChildren = useMemo(() => {
    const term = childSearch.trim().toLowerCase();
    if (!term) return children;
    return (children || []).filter((child) => {
      return (
        (child.name || '').toLowerCase().includes(term) ||
        (child.parent_name || '').toLowerCase().includes(term)
      );
    });
  }, [children, childSearch]);

  const filteredReports = useMemo(() => {
    return (reports || []).filter((report) => {
      const childOk = !reportFilters.child || String(report.child) === String(reportFilters.child);
      const teacherOk = !reportFilters.teacher || (report.notes || '').toLowerCase().includes(reportFilters.teacher.toLowerCase());

      const reportDate = report.report_date ? new Date(report.report_date) : null;
      const fromOk = !reportFilters.from || (reportDate && reportDate >= new Date(reportFilters.from));
      const toOk = !reportFilters.to || (reportDate && reportDate <= new Date(reportFilters.to));

      return childOk && teacherOk && fromOk && toOk;
    });
  }, [reports, reportFilters]);

  const stats = useMemo(() => {
    const totalTeachers = users.filter((user) => user.role === 'TEACHER').length;
    const totalParents = users.filter((user) => user.role === 'PARENT').length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newRegistrations = users.filter((user) => {
      if (!user.date_joined) return false;
      return new Date(user.date_joined) >= sevenDaysAgo;
    }).length;

    const incompleteChildProfiles = (children || []).filter((child) => !child.parent_name || !child.date_of_birth).length;
    const pendingReports = (children || []).filter((child) => !reportCountByChild[child.id]).length;

    return {
      totalChildren: (children || []).length,
      totalTeachers,
      totalParents,
      newRegistrations,
      pendingReports,
      incompleteChildProfiles,
    };
  }, [users, children, reportCountByChild]);

  const failedUploads = useMemo(() => {
    const invalidActivities = activities.filter((activity) => !activity.title || !activity.description);
    const invalidResources = resources.filter((resource) => !resource.title || !resource.resource_type);
    return invalidActivities.length + invalidResources.length;
  }, [activities, resources]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleRoleChange = async (profileId, newRole) => {
    try {
      setSavingState(true);
      await API.patch(`user_profiles/${profileId}/`, { role: newRole });
      setProfiles((prev) => prev.map((profile) => (
        profile.id === profileId ? { ...profile, role: newRole } : profile
      )));
      addAuditLog(`Updated user role to ${newRole}`);
    } catch (err) {
      console.error('Failed to update role', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setSavingState(false);
    }
  };

  const handleToggleActive = async (profile) => {
    const nextState = !profile.user?.is_active;
    try {
      setSavingState(true);
      await API.patch(`user_profiles/${profile.id}/`, {
        user: {
          is_active: nextState
        }
      });

      setProfiles((prev) => prev.map((item) => {
        if (item.id !== profile.id) return item;
        return {
          ...item,
          user: {
            ...item.user,
            is_active: nextState
          }
        };
      }));

      addAuditLog(`${nextState ? 'Activated' : 'Deactivated'} account ${profile.user?.email || ''}`);
    } catch (err) {
      console.error('Failed to change account status', err);
      setError('Failed to change account status. Please try again.');
    } finally {
      setSavingState(false);
    }
  };

  const triggerPasswordReset = (email) => {
    if (!email || email === '-') {
      setError('Cannot trigger password reset without a valid email.');
      return;
    }
    addAuditLog(`Password reset requested for ${email}`);
    window.alert(`Password reset trigger recorded for ${email}. Connect this to a backend reset endpoint next.`);
  };

  const openChildEditor = (child) => {
    setEditingChild(child);
    setEditChildForm({
      name: child.name || '',
      age: child.age ?? '',
      parent_name: child.parent_name || '',
      date_of_birth: child.date_of_birth || ''
    });
  };

  const closeChildEditor = () => {
    setEditingChild(null);
    setEditChildForm({
      name: '',
      age: '',
      parent_name: '',
      date_of_birth: ''
    });
  };

  const saveChildEdit = async () => {
    if (!editingChild) return;

    try {
      setSavingState(true);
      const payload = {
        name: editChildForm.name,
        age: editChildForm.age === '' ? null : Number(editChildForm.age),
        parent_name: editChildForm.parent_name,
        date_of_birth: editChildForm.date_of_birth || null
      };

      const res = await API.patch(`children/${editingChild.id}/`, payload);
      setChildren((prev) => prev.map((child) => (child.id === editingChild.id ? res.data : child)));
      addAuditLog(`Updated child profile ${editChildForm.name}`);
      closeChildEditor();
    } catch (err) {
      console.error('Failed to update child profile', err);
      setError('Failed to update child profile. Please try again.');
    } finally {
      setSavingState(false);
    }
  };

  const toggleFollowUpResolved = (id) => {
    setUnresolvedFollowups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(LOCAL_FOLLOW_UP_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const sendTeacherReminder = () => {
    const teacherEmails = users
      .filter((user) => user.role === 'TEACHER' && user.email && user.email !== '-')
      .map((user) => user.email);

    if (!teacherEmails.length) {
      setError('No teacher emails found to send reminders.');
      return;
    }

    addAuditLog('Prepared reminder draft for teacher follow-up');
    const recipients = teacherEmails.join(',');
    const subject = encodeURIComponent('Reminder: Submit pending reports and follow-ups');
    const body = encodeURIComponent('Hello Team,\n\nPlease review pending progress reports and unresolved follow-up messages today.\n\nThank you.');
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
  };

  const exportReportsCSV = () => {
    if (!filteredReports.length) {
      setError('No reports available for export with current filters.');
      return;
    }

    const header = ['Report ID', 'Child Name', 'Report Date', 'Score', 'Notes'];
    const rows = filteredReports.map((report) => {
      const child = childrenMap[report.child];
      return [
        report.id,
        child?.name || 'Unknown Child',
        report.report_date || '',
        report.overall_score ?? '',
        (report.notes || '').replace(/\n/g, ' ').replace(/,/g, ';')
      ];
    });

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin_reports_export.csv';
    link.click();
    URL.revokeObjectURL(url);
    addAuditLog('Exported filtered reports as CSV');
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
    transition: 'all 0.2s ease',
    marginBottom: 4
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
  const header = { marginBottom: 20 };
  const title = { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 6 };
  const subtitle = { color: '#6b7280' };

  const alertError = {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '10px 12px',
    borderRadius: 10,
    marginBottom: 16,
    border: '1px solid #fecaca'
  };

  const card = {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  };

  const sectionTitle = {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 14
  };

  const topGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0,1fr))',
    gap: 12,
    marginBottom: 16
  };

  const smallCardTitle = { fontSize: 12, color: '#6b7280' };
  const smallCardValue = { fontSize: 24, fontWeight: 700, marginTop: 6, color: '#1f2937' };

  const twoCol = {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 16,
    marginBottom: 16
  };

  const threeCol = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
    gap: 16,
    marginBottom: 16
  };

  const input = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box'
  };

  const table = { width: '100%', borderCollapse: 'collapse' };
  const th = {
    textAlign: 'left',
    padding: '12px 10px',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontSize: 12,
    fontWeight: 700
  };
  const td = {
    padding: '10px',
    borderBottom: '1px solid #f3f4f6',
    color: '#111827',
    fontSize: 13,
    verticalAlign: 'middle'
  };

  const btn = {
    border: 'none',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer'
  };

  const btnPrimary = { ...btn, background: '#ede9fe', color: '#5b21b6' };
  const btnNeutral = { ...btn, background: '#f3f4f6', color: '#374151' };
  const btnDanger = { ...btn, background: '#fee2e2', color: '#b91c1c' };
  const badge = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  };

  return (
    <div style={layout}>
      <aside style={sidebar}>
        <div>
          <div style={logoSection}>
            <div style={logoIcon}>👶</div>
            <div style={logoText}>GrowTogether</div>
          </div>

          <div style={navItem(true)}>
            <span style={iconStyle}>🛡️</span>
            Admin Dashboard
          </div>
          <div style={navItem()} onClick={() => navigate('/teacher_dashboard')}>
            <span style={iconStyle}>🏫</span>
            Teacher View
          </div>
          <div style={navItem()} onClick={() => navigate('/std_dashboard')}>
            <span style={iconStyle}>👨‍👩‍👧</span>
            Parent View
          </div>
          <div style={navItem()} onClick={() => navigate('/students')}>
            <span style={iconStyle}>👥</span>
            Students
          </div>
          <div style={navItem()} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
        </div>

        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>
              {(userInfo.first_name || 'A').charAt(0)}{(userInfo.last_name || 'U').charAt(0)}
            </div>
            <div>
              <div style={userName}>{userInfo.first_name} {userInfo.last_name}</div>
              <div style={userRole}>{userInfo.role}</div>
            </div>
            <div style={logoutIcon} onClick={handleLogout} title="Logout">⎋</div>
          </div>
        </div>
      </aside>

      <main style={main}>
        <div style={header}>
          <div style={title}>Admin Dashboard</div>
          <div style={subtitle}>Manage users, children, content, reports, follow-up messages, alerts, and security from one place.</div>
        </div>

        {error && <div style={alertError}>{error}</div>}

        <div style={topGrid}>
          <div style={card}>
            <div style={smallCardTitle}>Total Children</div>
            <div style={smallCardValue}>{stats.totalChildren}</div>
          </div>
          <div style={card}>
            <div style={smallCardTitle}>Total Teachers</div>
            <div style={smallCardValue}>{stats.totalTeachers}</div>
          </div>
          <div style={card}>
            <div style={smallCardTitle}>Total Parents</div>
            <div style={smallCardValue}>{stats.totalParents}</div>
          </div>
          <div style={card}>
            <div style={smallCardTitle}>New Registrations (7 days)</div>
            <div style={smallCardValue}>{stats.newRegistrations}</div>
          </div>
          <div style={card}>
            <div style={smallCardTitle}>Pending Reports</div>
            <div style={smallCardValue}>{stats.pendingReports}</div>
          </div>
        </div>

        <div style={twoCol}>
          <div style={card}>
            <div style={sectionTitle}>User Management</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 12 }}>
              <input
                style={input}
                placeholder="Search by name, role, email"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <button
                style={btnNeutral}
                onClick={loadDashboardData}
                disabled={loading || savingState}
              >
                Refresh
              </button>
            </div>

            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>User</th>
                    <th style={th}>Role</th>
                    <th style={th}>Status</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.profileId}>
                      <td style={td}>
                        <div style={{ fontWeight: 700 }}>{`${user.first_name} ${user.last_name}`.trim() || user.username}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{user.email}</div>
                      </td>
                      <td style={td}>
                        <select
                          style={input}
                          value={user.role || 'PARENT'}
                          disabled={savingState}
                          onChange={(e) => handleRoleChange(user.profileId, e.target.value)}
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      <td style={td}>
                        <span
                          style={{
                            ...badge,
                            background: user.is_active ? '#dcfce7' : '#fee2e2',
                            color: user.is_active ? '#166534' : '#b91c1c'
                          }}
                        >
                          {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            style={user.is_active ? btnDanger : btnPrimary}
                            onClick={() => handleToggleActive(profiles.find((p) => p.id === user.profileId))}
                            disabled={savingState}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            style={btnNeutral}
                            onClick={() => triggerPasswordReset(user.email)}
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Notifications and Alerts</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Users waiting approval</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>0 (approval flow not enabled yet)</div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Incomplete child profiles</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{stats.incompleteChildProfiles}</div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Failed data/upload issues</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{failedUploads}</div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Duplicate child records</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{duplicateChildren.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={twoCol}>
          <div style={card}>
            <div style={sectionTitle}>Children and School Data</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 12 }}>
              <input
                style={input}
                placeholder="Search child or parent name"
                value={childSearch}
                onChange={(e) => setChildSearch(e.target.value)}
              />
            </div>

            <div style={{ maxHeight: 280, overflow: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Child</th>
                    <th style={th}>Age</th>
                    <th style={th}>Parent</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((child) => (
                    <tr key={child.id}>
                      <td style={td}>{child.name}</td>
                      <td style={td}>{child.age ?? 'N/A'}</td>
                      <td style={td}>{child.parent_name || 'N/A'}</td>
                      <td style={td}>
                        <button style={btnPrimary} onClick={() => openChildEditor(child)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {duplicateChildren.length > 0 && (
              <div style={{ marginTop: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>Potential duplicates detected</div>
                {duplicateChildren.slice(0, 4).map((group, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: '#7c2d12', marginBottom: 4 }}>
                    {group.map((child) => `${child.name} (ID ${child.id})`).join(' | ')}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={sectionTitle}>Learning Content Management</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>Activities</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{activities.length} total activities</div>
                <button style={btnPrimary} onClick={() => navigate('/activities')}>Manage Activities</button>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>Milestones</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{milestones.length} total milestones</div>
                <button style={btnPrimary} onClick={() => navigate('/milestones')}>Manage Milestones</button>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>E-Library Resources</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{resources.length} total resources</div>
                <button style={btnPrimary} onClick={() => navigate('/e-library')}>Manage Resources</button>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>Images and files</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>Use the content pages to upload and remove assets.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={threeCol}>
          <div style={card}>
            <div style={sectionTitle}>Reports and Monitoring</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
              <select
                style={input}
                value={reportFilters.child}
                onChange={(e) => setReportFilters((prev) => ({ ...prev, child: e.target.value }))}
              >
                <option value="">All children</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
              <input
                style={input}
                type="date"
                value={reportFilters.from}
                onChange={(e) => setReportFilters((prev) => ({ ...prev, from: e.target.value }))}
              />
              <input
                style={input}
                type="date"
                value={reportFilters.to}
                onChange={(e) => setReportFilters((prev) => ({ ...prev, to: e.target.value }))}
              />
              <input
                style={input}
                placeholder="Filter by teacher keyword in notes"
                value={reportFilters.teacher}
                onChange={(e) => setReportFilters((prev) => ({ ...prev, teacher: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 10, color: '#6b7280', fontSize: 13 }}>
              Showing {filteredReports.length} / {reports.length} reports
            </div>
            <button style={btnPrimary} onClick={exportReportsCSV}>Export CSV</button>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Messages and Follow-up</div>
            <div style={{ maxHeight: 260, overflow: 'auto' }}>
              {(followUps || []).slice(0, 8).map((msg) => {
                const unresolved = unresolvedFollowups.has(msg.id);
                return (
                  <div
                    key={msg.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 8,
                      background: unresolved ? '#fff7ed' : '#f9fafb'
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {msg.parent_name} · Child ID {msg.child}
                      {msg.milestone_title ? ` · Milestone: ${msg.milestone_title}` : ''}
                    </div>
                    <div style={{ fontSize: 13, color: '#111827', margin: '4px 0' }}>{msg.message}</div>
                    <button style={btnNeutral} onClick={() => toggleFollowUpResolved(msg.id)}>
                      {unresolved ? 'Mark Resolved' : 'Mark Unresolved'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button style={{ ...btnPrimary, marginTop: 8 }} onClick={sendTeacherReminder}>Send Reminder to Teachers</button>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Audit and Security</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Last Login List</div>
              <div style={{ maxHeight: 120, overflow: 'auto' }}>
                {users
                  .filter((user) => user.last_login)
                  .sort((a, b) => new Date(b.last_login) - new Date(a.last_login))
                  .slice(0, 6)
                  .map((user) => (
                    <div key={user.profileId} style={{ fontSize: 12, marginBottom: 4, color: '#374151' }}>
                      {user.email} · {new Date(user.last_login).toLocaleString()}
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Recent admin actions</div>
              <div style={{ maxHeight: 120, overflow: 'auto' }}>
                {auditLogs.length === 0 && (
                  <div style={{ fontSize: 12, color: '#6b7280' }}>No tracked actions in this session yet.</div>
                )}
                {auditLogs.map((log) => (
                  <div key={log.id} style={{ fontSize: 12, marginBottom: 6, color: '#374151' }}>
                    {log.timestamp} · {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {editingChild && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(17,24,39,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div style={{ ...card, width: 460 }}>
              <div style={sectionTitle}>Edit Child Profile</div>
              <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
                <input
                  style={input}
                  placeholder="Child name"
                  value={editChildForm.name}
                  onChange={(e) => setEditChildForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  style={input}
                  type="number"
                  placeholder="Age"
                  value={editChildForm.age}
                  onChange={(e) => setEditChildForm((prev) => ({ ...prev, age: e.target.value }))}
                />
                <input
                  style={input}
                  placeholder="Parent name"
                  value={editChildForm.parent_name}
                  onChange={(e) => setEditChildForm((prev) => ({ ...prev, parent_name: e.target.value }))}
                />
                <input
                  style={input}
                  type="date"
                  value={editChildForm.date_of_birth}
                  onChange={(e) => setEditChildForm((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button style={btnNeutral} onClick={closeChildEditor} disabled={savingState}>Cancel</button>
                <button style={btnPrimary} onClick={saveChildEdit} disabled={savingState}>Save</button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Loading admin data...</div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
