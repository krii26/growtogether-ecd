import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#f4eded',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  };

  const leftStyle = { display: 'flex', alignItems: 'center', gap: 12 };
  const logoStyle = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const brandStyle = { fontWeight: 600, color: '#111', marginLeft: 12 };

  const rightStyle = { display: 'flex', alignItems: 'center', gap: 12 };
  const pillBtn = {
    padding: '8px 16px',
    background: '#d3b7b2',
    borderRadius: 18,
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <header style={barStyle}>
      <div style={leftStyle}>
        <img src="/logo.png" alt="GrowTogether" style={logoStyle} />
        <span style={brandStyle}>GrowTogether</span>
      </div>

      <div style={rightStyle}>
        <Link to="/register"><button style={pillBtn}>Register</button></Link>
        <Link to="/login"><button style={pillBtn}>Login</button></Link>
      </div>
    </header>
  );
};

export default Header;
