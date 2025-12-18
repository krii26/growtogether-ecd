import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: '#fcecef',
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

  const navStyle = { display: 'flex', gap: 24, marginLeft: 8 };
  const navLink = { color: '#000', textDecoration: 'none', fontWeight: 600 };

  const rightStyle = {};
  const loginBtn = {
    padding: '8px 16px',
    background: '#e7c7c7',
    borderRadius: 18,
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <header style={barStyle}>
      <div style={leftStyle}>
        <img src="/logo.png" alt="GrowTogether" style={logoStyle} />
        <nav style={navStyle}>
          <Link to="/" style={navLink}>Home</Link>
          <Link to="/children" style={navLink}>Dashboard</Link>
          <Link to="/about" style={navLink}>About us</Link>
        </nav>
      </div>

      <div style={rightStyle}>
        <Link to="/login"><button style={loginBtn}>Login</button></Link>
      </div>
    </header>
  );
};

export default Header;
