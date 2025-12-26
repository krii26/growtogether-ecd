import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'PARENT'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.email || !form.password) {
      setError('Please enter email and password.');
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
        role: form.role,
      };

      // Attempt login; backend endpoint can be added later
      await API.post('login/', payload);
      setSuccess('Login successful. Redirecting...');
      setError('');
      setTimeout(() => navigate('/std_dashboard'), 800);
    } catch (err) {
      console.error(err);
      setError('Login failed. Please verify your credentials.');
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

  const rightStyle = {
    flex: '0 0 52%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: 20
  };

  const formCardStyle = {
    background: 'white',
    padding: '16px 20px',
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 380
  };

  const formTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: '#333',
    marginBottom: 12
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontWeight: 500
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 13,
    border: '1px solid #ddd',
    borderRadius: 6,
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 13,
    border: '1px solid #ddd',
    borderRadius: 6,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: 'white'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 10,
    color: 'white',
    backgroundImage: 'linear-gradient(90deg, #6a11cb 0%, #d91973 100%)'
  };

  const errorStyle = {
    color: '#dc3545',
    background: '#f8d7da',
    padding: '6px 8px',
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 11
  };

  const successStyle = {
    color: '#155724',
    background: '#d4edda',
    padding: '6px 8px',
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 11
  };

  const belowTextStyle = {
    marginTop: 10,
    fontSize: 12,
    color: '#333',
    textAlign: 'center'
  };

  const loginLinkStyle = {
    color: '#6f42c1',
    fontWeight: 600,
    textDecoration: 'none',
    marginLeft: 4
  };

  const imageStyle = {
    width: 'auto',
    height: '156%',
    maxHeight: 'calc(156vh - 120px)',
    borderRadius: 0,
    objectFit: 'cover',
    transform: 'translateX(calc(2in + 2%)) scale(1.56)',
    background: 'transparent'
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        <h1 style={headingStyle}>
          Learning, playing and<br />Growing Together.
        </h1>
        <img src="/hero-bg.jpg" alt="Child learning" style={imageStyle} />
      </div>

      <div style={rightStyle}>
        <div style={formCardStyle}>
          <h2 style={formTitleStyle}>Welcome to GrowTogether</h2>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>I am a</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="PARENT">Parent</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button type="submit" style={buttonStyle}>Login</button>
            <button type="button" onClick={loginWithGoogle} style={{
              width: '100%', padding: '12px 20px', marginTop: 12, borderRadius: 24, border: '1px solid #dadce0',
              background: '#fff', color: '#3c4043', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14
            }}>
              <img alt="Google" src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png" style={{ width: 18, height: 18 }} />
              Sign in with Google
            </button>
            <div style={belowTextStyle}>
              Don't have an account?
              <Link to="/register" style={loginLinkStyle}>Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
