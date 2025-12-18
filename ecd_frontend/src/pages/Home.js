import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 'calc(100vh - 140px)',
    background: '#f5f0ee',
    padding: '20px 60px 40px 60px',
    overflow: 'hidden'
  };

  const leftStyle = {
    flex: '0 0 42%',
    paddingRight: 40,
    zIndex: 2
  };

  const headingStyle = {
    fontSize: 52,
    fontWeight: 700,
    color: '#4a7c59',
    marginBottom: 24,
    lineHeight: 1.2
  };

  const paragraphStyle = {
    fontSize: 15,
    color: '#333',
    lineHeight: 1.6,
    marginBottom: 16
  };

  const ctaTextStyle = {
    fontSize: 24,
    fontWeight: 700,
    color: '#000',
    marginTop: 40,
    marginBottom: 24
  };

  const buttonStyle = {
    padding: '12px 28px',
    background: '#4a7c59',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const rightStyle = {
    flex: '0 0 52%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    position: 'relative'
  };

  const imageStyle = {
    width: 'auto',
    height: '156%',
    maxHeight: 'calc(156vh - 120px)',
    borderRadius: 0,
    objectFit: 'cover',
    transform: 'translateX(calc(-2in + 2%)) scale(1.56)',
    background: 'transparent'
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        <h1 style={headingStyle}>
          Learning, playing and<br />Growing Together.
        </h1>
        <p style={paragraphStyle}>
          Supporting every child's development with expert-guided play and learning.
        </p>
        <p style={paragraphStyle}>
          Start your child's personalized journey in just a few simple steps.
        </p>
        <div style={ctaTextStyle}>
          Let your Child grow with us!
        </div>
        <Link to="/register">
          <button style={buttonStyle}>Get Started</button>
        </Link>
      </div>

      <div style={rightStyle}>
        <img
          src="/hero-bg.jpg"
          alt="Child learning"
          style={imageStyle}
        />
      </div>
    </div>
  );
};

export default Home;
