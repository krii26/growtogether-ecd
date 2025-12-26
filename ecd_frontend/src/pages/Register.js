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
    padding: '6px 8px',
    fontSize: 12,
    border: '1px solid #ddd',
    borderRadius: 3,
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const selectStyle = {
    width: '100%',
    padding: '6px 8px',
    fontSize: 12,
    border: '1px solid #ddd',
    borderRadius: 3,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: 'white'
  };

  const textareaStyle = {
    width: '100%',
    padding: '6px 8px',
    fontSize: 12,
    border: '1px solid #ddd',
    borderRadius: 3,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    minHeight: 50,
    resize: 'vertical'
  };

  const buttonStyle = {
    width: '100%',
    padding: '8px 16px',
    background: '#4a7c59',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4
  };

  const errorStyle = {
    color: '#dc3545',
    background: '#f8d7da',
    padding: '6px 8px',
    borderRadius: 3,
    marginBottom: 8,
    fontSize: 11
  };

  const successStyle = {
    color: '#155724',
    background: '#d4edda',
    padding: '6px 8px',
    borderRadius: 3,
    marginBottom: 8,
    fontSize: 11
  };

  const fieldGroupStyle = {
    marginBottom: 10
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

  const belowTextStyle = {
    marginTop: 8,
    fontSize: 12,
    color: '#333'
  };

  const loginLinkStyle = {
    color: '#6f42c1',
    fontWeight: 600,
    textDecoration: 'none',
    marginLeft: 4
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        <h1 style={headingStyle}>
          Learning, playing and<br />Growing Together.
        </h1>
        <img
          src="/hero-bg.jpg"
          alt="Child learning"
          style={imageStyle}
        />
      </div>

      <div style={rightStyle}>
        <div style={formCardStyle}>
          <h2 style={formTitleStyle}>Create an Account</h2>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Email *</label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>First Name</label>
              <input 
                name="first_name" 
                value={form.first_name} 
                onChange={handleChange} 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Last Name</label>
              <input 
                name="last_name" 
                value={form.last_name} 
                onChange={handleChange} 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Password *</label>
              <input 
                name="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Confirm Password *</label>
              <input 
                name="confirmPassword" 
                type="password" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Role</label>
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

            {/* Phone and address fields removed as requested */}

            <button type="submit" style={buttonStyle}>Register</button>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" onClick={loginWithGoogle} style={{
                width: '100%', padding: '10px 12px', borderRadius: 24, border: '1px solid #dadce0',
                background: '#fff', color: '#3c4043', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <img alt="Google" src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png" style={{ width: 18, height: 18 }} />
                Sign in with Google
              </button>
            </div>
            <div style={belowTextStyle}>
              Already have an account?
              <Link to="/login" style={loginLinkStyle}>Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;