import React, { useEffect, useRef, useState } from 'react';
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
  const googleButtonRef = useRef(null);

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

      const response = await API.post('login/', payload);

      const userData = response.data?.user || response.data || { role: form.role };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setSuccess('Login successful. Redirecting...');
      setError('');
      
      const resolvedRole = (userData.role || form.role || 'PARENT').toUpperCase();
      const dashboardPath =
        resolvedRole === 'TEACHER'
          ? '/teacher_dashboard'
          : resolvedRole === 'ADMIN' || resolvedRole === 'SUPER_ADMIN'
            ? '/admin_dashboard'
            : '/std_dashboard';
      setTimeout(() => navigate(dashboardPath), 800);
    } catch (err) {
      console.error(err);
      setError('Login failed. Please verify your credentials.');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await API.post('google-login/', { credential: credentialResponse.credential });

      const userData = res.data?.user || res.data || { role: 'PARENT' };
      localStorage.setItem('user', JSON.stringify(userData));

      setSuccess('Login successful. Redirecting...');
      setError('');

      const userRole = (userData.role || 'PARENT').toUpperCase();
      const dashboardPath =
        userRole === 'TEACHER'
          ? '/teacher_dashboard'
          : userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
            ? '/admin_dashboard'
            : '/std_dashboard';
      setTimeout(() => navigate(dashboardPath), 800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Google login failed.');
    }
  };

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google login is not configured.');
      return undefined;
    }

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      if (!googleButtonRef.current) {
        return;
      }

      if (!window.google?.accounts?.id) {
        attempts += 1;
        if (attempts >= 20) {
          setError('Google login is unavailable right now. Please refresh and try again.');
          window.clearInterval(intervalId);
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLogin,
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: googleButtonRef.current.offsetWidth || 340,
      });

      window.clearInterval(intervalId);
    }, 300);

    return () => window.clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const googleButtonWrapperStyle = {
    width: '100%',
    marginTop: 12,
    display: 'flex',
    justifyContent: 'center'
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
            <div style={googleButtonWrapperStyle}>
              <div ref={googleButtonRef} />
            </div>
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
