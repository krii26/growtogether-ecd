import React from 'react';

const Footer = () => {
  const wrapper = {
    background: '#f4eded',
    padding: '12px 8px',
    textAlign: 'center',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    borderTop: '1px solid rgba(0,0,0,0.05)'
  };
  const text = { fontSize: 14, color: '#111' };

  return (
    <footer style={wrapper}>
      <div style={text}>Copyright GrowTogether, Inc© 2025</div>
    </footer>
  );
};

export default Footer;
