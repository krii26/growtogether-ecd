import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      id: 1,
      icon: '📋',
      title: 'Smart Checklist',
      description: 'Track social, emotional, cognitive and physical development milestones',
      color: '#2ecc71'
    },
    {
      id: 2,
      icon: '📚',
      title: 'E-Library',
      description: 'Access expert content on nutrition, psychology, and child behavior for parents',
      color: '#e74c3c'
    },
    {
      id: 3,
      icon: '💡',
      title: 'Activity Suggestions',
      description: 'Get age-appropriate activity recommendations tailored to your child\'s development stage',
      color: '#3498db'
    },
    {
      id: 4,
      icon: '👨‍🏫',
      title: 'Teacher Portal',
      description: 'Teachers can manage student profiles, publish results, and access educational materials',
      color: '#27ae60'
    },
    {
      id: 5,
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Stay updated with timely reminders, milestones, and important updates about your child',
      color: '#f39c12'
    },
    {
      id: 6,
      icon: '🔐',
      title: 'Role-Based Access',
      description: 'Secure platform with different access levels for parents, teachers, and administrators',
      color: '#9b59b6'
    }
  ];

  // Home Container Styles
  const homeContainerStyle = {
    width: '100%',
    overflow: 'hidden'
  };

  // Hero Section Styles
  const heroSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '65vh',
    background: '#f3e8f7',
    padding: '40px 60px',
    gap: '40px'
  };

  const heroContentStyle = {
    flex: 1,
    zIndex: 2,
    maxWidth: '600px'
  };

  const heroTitleStyle = {
    fontSize: '3.5rem',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '24px',
    lineHeight: 1.2
  };

  const heroSubtitleStyle = {
    color: '#a855f7'
  };

  const heroDescriptionStyle = {
    fontSize: '1.1rem',
    color: '#666',
    lineHeight: 1.6,
    marginBottom: '32px',
    maxWidth: '500px'
  };

  const heroButtonsStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '40px'
  };

  const btnStyle = {
    padding: '12px 28px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease'
  };

  const btnPrimaryStyle = {
    ...btnStyle,
    background: '#a855f7',
    color: 'white'
  };

  const btnSecondaryStyle = {
    ...btnStyle,
    background: 'transparent',
    color: '#333',
    border: '2px solid #ddd'
  };

  const heroStatsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const statItemStyle = {
    fontSize: '0.95rem',
    color: '#666',
    background: '#e8d5f2',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-block'
  };

  const heroImageStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  };

  const heroImgStyle = {
    width: '100%',
    height: 'auto',
    maxWidth: '450px',
    borderRadius: '12px',
    objectFit: 'cover',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
    display: 'block'
  };

  // Features Section Styles
  const featuresSectionStyle = {
    padding: '80px 60px',
    background: '#ffffff',
    textAlign: 'center'
  };

  const featuresTitleStyle = {
    fontSize: '2.2rem',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '8px'
  };

  const featuresSubtitleStyle = {
    fontSize: '1rem',
    color: '#999',
    marginBottom: '60px'
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const featureCardStyle = (color) => ({
    background: '#f9f9f9',
    padding: '32px',
    borderRadius: '12px',
    borderTop: `4px solid ${color}`,
    transition: 'all 0.3s ease',
    textAlign: 'center',
    cursor: 'pointer'
  });

  const featureIconStyle = (color) => ({
    width: '60px',
    height: '60px',
    background: color,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    margin: '0 auto 16px'
  });

  const featureTitleStyle = {
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '12px'
  };

  const featureDescriptionStyle = {
    fontSize: '0.95rem',
    color: '#666',
    lineHeight: 1.6,
    margin: 0
  };

  // CTA Section Styles
  const ctaSectionStyle = {
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    padding: '80px 60px',
    textAlign: 'center',
    borderRadius: '20px',
    margin: '0 60px 60px'
  };

  const ctaTitleStyle = {
    fontSize: '2.2rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '16px'
  };

  const ctaDescriptionStyle = {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '32px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto'
  };

  const btnCtaStyle = {
    ...btnStyle,
    background: 'white',
    color: '#a855f7',
    fontWeight: 700,
    padding: '14px 40px',
    fontSize: '1.05rem'
  };

  return (
    <div style={homeContainerStyle}>
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            Nurturing Growth,<br />
            <span style={heroSubtitleStyle}>Together.</span>
          </h1>
          <p style={heroDescriptionStyle}>
            A comprehensive platform for parents and teachers to support early childhood development for ages 0-8 years
          </p>
          <div style={heroButtonsStyle}>
            <Link to="/register">
              <button style={btnPrimaryStyle}>Get Started Free</button>
            </Link>
            <button style={btnSecondaryStyle}>Learn More</button>
          </div>
          <div style={heroStatsStyle}>
            <p style={statItemStyle}>✓ 10,000+ Happy Families</p>
          </div>
        </div>
        <div style={heroImageStyle}>
          <img src="/happychild.jpg" alt="Child learning" style={heroImgStyle} />
        </div>
      </section>

      {/* Features Section */}
      <section style={featuresSectionStyle}>
        <h2 style={featuresTitleStyle}>Everything You Need for Child Development</h2>
        <p style={featuresSubtitleStyle}>Comprehensive tools for parents and teachers</p>
        
        <div style={featuresGridStyle}>
          {features.map((feature) => (
            <div key={feature.id} style={featureCardStyle(feature.color)}>
              <div style={featureIconStyle(feature.color)}>
                {feature.icon}
              </div>
              <h3 style={featureTitleStyle}>{feature.title}</h3>
              <p style={featureDescriptionStyle}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaSectionStyle}>
        <h2 style={ctaTitleStyle}>Ready to Start Your Journey?</h2>
        <p style={ctaDescriptionStyle}>
          Join thousands of parents and teachers who trust GrowTogether for early childhood development
        </p>
        <Link to="/register">
          <button style={btnCtaStyle}>Create Free Account</button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
