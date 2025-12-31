import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'PARENT',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      };

      const res = await API.post('register/', payload);
      setSuccess('Registration successful. Redirecting to login...');
      setError('');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Registration failed. Check server connection.');
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!window.google || !clientId) {
        setError('Google login is not configured.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await API.post('google-login/', { credential: response.credential });
            setSuccess('Login successful. Redirecting...');
            setError('');
            setTimeout(() => navigate('/std_dashboard'), 800);
          } catch (err) {
            console.error(err);
            setError('Google login failed.');
          }
        },
      });
      window.google.accounts.id.prompt();
    } catch (err) {
      console.error(err);
      setError('Google login failed to start.');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: '#f3e8f7'
  };

  const heroSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '70vh',
    background: '#f3e8f7',
    padding: '60px',
    gap: '40px'
  };

  const heroLeftStyle = {
    flex: 1,
    zIndex: 1,
    maxWidth: '600px'
  };

  const heroTitleBgStyle = {
    fontSize: '3.5rem',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '24px',
    lineHeight: 1.2
  };

  const heroSubtitleBgStyle = {
    color: '#a855f7'
  };

  const heroDescriptionBgStyle = {
    fontSize: '1.1rem',
    color: '#666',
    lineHeight: 1.6,
    marginBottom: '32px',
    maxWidth: '500px'
  };

  const heroButtonsBgStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '40px'
  };

  const heroRightStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  };

  const heroImgBgStyle = {
    width: '100%',
    height: 'auto',
    maxWidth: '450px',
    borderRadius: '12px',
    objectFit: 'cover',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)'
  };

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

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999
  };

  const modalWrapperStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 50px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 2
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#999',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const formTitleStyle = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '24px',
    textAlign: 'center'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '8px',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '16px'
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: 'white',
    marginBottom: '16px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.3s ease'
  };

  const errorStyle = {
    color: '#dc3545',
    background: '#f8d7da',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px'
  };

  const successStyle = {
    color: '#155724',
    background: '#d4edda',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px'
  };

  const fieldGroupStyle = {
    marginBottom: '16px'
  };

  const belowTextStyle = {
    marginTop: '16px',
    fontSize: '14px',
    color: '#333',
    textAlign: 'center'
  };

  const loginLinkStyle = {
    color: '#a855f7',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '4px'
  };

  return (
    <>
      <div style={containerStyle}>
        <section style={heroSectionStyle}>
          <div style={heroLeftStyle}>
            <h1 style={heroTitleBgStyle}>
              Nurturing Growth,<br />
              <span style={heroSubtitleBgStyle}>Together.</span>
            </h1>
            <p style={heroDescriptionBgStyle}>
              A comprehensive 
              
              
              
              
              platform for parents and teachers to support early childhood development for ages 0-8 years
            </p>
            <div style={heroButtonsBgStyle}>
              <button style={{
                padding: '12px 28px',
                background: '#a855f7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>Get Started Free</button>
              <button style={{
                padding: '12px 28px',
                background: 'transparent',
                color: '#333',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>Learn More</button>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <p style={{
                fontSize: '0.95rem',
                color: '#666',
                background: '#e8d5f2',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>✓ 10,000+ Happy Families</p>
            </div>
          </div>
          
          <div style={heroRightStyle}>
            <img src="/happychild.jpg" alt="Child learning" style={heroImgBgStyle} />
          </div>
        </section>

        <section style={featuresSectionStyle}>
          <h2 style={featuresTitleStyle}>Everything You Need for Child Development</h2>
          <p style={featuresSubtitleStyle}>Comprehensive tools for parents and teachers</p>
        </section>
      </div>

      <div style={overlayStyle}></div>

      <div style={modalWrapperStyle}>
        <div style={modalStyle}>
          <button 
            style={closeButtonStyle}
            onClick={() => window.history.back()}
            title="Close"
          >
            ✕
          </button>
          
          <h2 style={formTitleStyle}>Create Account</h2>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>First Name</label>
              <input 
                name="first_name" 
                placeholder="John"
                value={form.first_name} 
                onChange={handleChange} 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Last Name</label>
              <input 
                name="last_name" 
                placeholder="Doe"
                value={form.last_name} 
                onChange={handleChange} 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input 
                name="email" 
                type="email"
                placeholder="your@email.com"
                value={form.email} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Password</label>
              <input 
                name="password" 
                type="password"
                placeholder="•••••••"
                value={form.password} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <input 
                name="confirmPassword" 
                type="password"
                placeholder="•••••••"
                value={form.confirmPassword} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>I am a</label>
              <select 
                name="role" 
                value={form.role} 
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Select Role</option>
                <option value="PARENT">Parent</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button type="submit" style={buttonStyle}>Create Account</button>

            <div style={belowTextStyle}>
              Already have an account?
              <Link to="/login" style={loginLinkStyle}>Login</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;