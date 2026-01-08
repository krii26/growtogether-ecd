import React from 'react';
import { useNavigate } from 'react-router-dom';

const Student = () => {
  const navigate = useNavigate();

  const students = [
    {
      id: 1,
      name: 'Emma Johnson',
      age: '4 years 3 months',
      parent: 'Sarah Johnson',
      progress: 85,
      avatar: '/happychild.jpg'
    },
    {
      id: 2,
      name: 'Oliver Smith',
      age: '5 years 8 months',
      parent: 'Michael Smith',
      progress: 92,
      avatar: '/traumakid.jpg'
    },
    {
      id: 3,
      name: 'Sophia Davis',
      age: '2 years 11 months',
      parent: 'Jennifer Davis',
      progress: 68,
      avatar: '/languageDev.png'
    },
  ];

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
              {students.map((s) => (
                <tr key={s.id} style={tr}>
                  <td style={td}>
                    <div style={studentCell}>
                      <img src={s.avatar} alt={s.name} style={avatar} />
                      <div style={name}>{s.name}</div>
                    </div>
                  </td>
                  <td style={td}>{s.age}</td>
                  <td style={td}>{s.parent}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={progressBarOuter}>
                        <div style={progressBarInner(s.progress)} />
                      </div>
                      <span style={badge}>{s.progress}%</span>
                    </div>
                  </td>
                  <td style={td}>
                    <button style={actionBtn}>View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Student;
