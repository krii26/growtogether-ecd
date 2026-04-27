import React from 'react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/std_dashboard' },
  { key: 'children', label: 'My Children', icon: '👶', path: '/children' },
  { key: 'milestones', label: 'Milestones', icon: '📋', path: '/milestones' },
  { key: 'elibrary', label: 'E-Library', icon: '📚', path: '/e-library' },
  { key: 'activities', label: 'Activities', icon: '💡', path: '/activities' }
];

const ParentSidebar = ({ activeKey, userInfo, onLogout }) => {
  const navigate = useNavigate();

  const safeUser = {
    first_name: userInfo?.first_name || 'Parent',
    last_name: userInfo?.last_name || '',
    role: userInfo?.role || 'Parent'
  };

  const wrapper = {
    background: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    padding: '16px 14px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box'
  };

  const brandRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    padding: '6px 8px'
  };

  const logo = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const brandText = {
    fontSize: '14px',
    lineHeight: 1,
    fontWeight: 700,
    color: '#111827'
  };

  const navItem = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '13px 14px',
    borderRadius: 12,
    color: active ? '#6a11cb' : '#4b5563',
    background: active ? '#d8c6ec' : 'transparent',
    cursor: 'pointer',
    marginBottom: 8,
    fontSize: '15px',
    fontWeight: active ? 700 : 600,
    transition: 'all 0.2s ease'
  });

  const iconStyle = {
    fontSize: '20px',
    width: 22,
    textAlign: 'center'
  };

  const userSection = {
    borderTop: '1px solid #e0e0e0',
    paddingTop: 16,
    marginTop: 'auto'
  };

  const userProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 8px 12px'
  };

  const userAvatar = {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '20px'
  };

  const userText = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    flex: 1
  };

  const userName = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const userRole = {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  };

  const logoutButton = {
    width: '100%',
    border: '1px solid #fecaca',
    background: '#fee2e2',
    color: '#b91c1c',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer'
  };

  const initials = `${safeUser.first_name.charAt(0) || ''}${safeUser.last_name.charAt(0) || ''}`.toUpperCase() || 'P';

  return (
    <aside style={wrapper}>
      <div>
        <div style={brandRow}>
          <img src="/logo.png" alt="GrowTogether" style={logo} />
          <div style={brandText}>GrowTogether</div>
        </div>

        {navItems.map((item) => (
          <div
            key={item.key}
            style={navItem(activeKey === item.key)}
            onClick={() => navigate(item.path)}
          >
            <span style={iconStyle}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <div style={userSection}>
        <div style={userProfile}>
          <div style={userAvatar}>{initials}</div>
          <div style={userText}>
            <div style={userName}>{safeUser.first_name} {safeUser.last_name}</div>
            <div style={userRole}>{safeUser.role}</div>
          </div>
        </div>
        <button type="button" style={logoutButton} onClick={onLogout}>LOGOUT</button>
      </div>
    </aside>
  );
};

export default ParentSidebar;
