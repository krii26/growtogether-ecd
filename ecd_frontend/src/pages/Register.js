import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'PARENT',
    phone_number: '',
    address: '',
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
        phone_number: form.phone_number,
        address: form.address,
      };

      const res = await API.post('register/', payload);
      setSuccess('Registration successful. Redirecting...');
      setError('');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/children');
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Registration failed. Check server connection.');
      }
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '1rem auto', padding: 16 }}>
      <h2>Register</h2>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email *</label>
          <br />
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>First Name</label>
          <br />
          <input name="first_name" value={form.first_name} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Last Name</label>
          <br />
          <input name="last_name" value={form.last_name} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Password *</label>
          <br />
          <input name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Confirm Password *</label>
          <br />
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Role</label>
          <br />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="PARENT">Parent</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Phone</label>
          <br />
          <input name="phone_number" value={form.phone_number} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Address</label>
          <br />
          <textarea name="address" value={form.address} onChange={handleChange} style={{ width: '100%' }} />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;