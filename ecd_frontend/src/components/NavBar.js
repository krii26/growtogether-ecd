import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const style = { padding: '8px 12px', display: 'inline-block' };
  return (
    <nav style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
      <Link to="/" style={style}>Home</Link>
      <Link to="/children" style={style}>Children</Link>
      <Link to="/register" style={style}>Register</Link>
    </nav>
  );
};

export default NavBar;