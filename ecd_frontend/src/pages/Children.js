import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const Children = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    date_of_birth: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    fetchChildren();
    loadUserInfo();
  }, []);

  const loadUserInfo = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo({
        first_name: user.first_name || 'John',
        last_name: user.last_name || 'Doe',
        role: user.role || 'Parent'
      });
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await API.get('children/');
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('date_of_birth', form.date_of_birth);
      formData.append('parent_name', userInfo.first_name + ' ' + userInfo.last_name || 'Parent');
      if (form.photo instanceof File) {
        formData.append('photo', form.photo);
      }
      
      await API.post('children/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchChildren();
      setShowModal(false);
      setForm({ name: '', date_of_birth: '', photo: null });
      setPhotoPreview('');
    } catch (err) {
      console.error('Error adding child:', err);
      setError('Failed to add child. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteChild = async (childId) => {
    if (!window.confirm('Are you sure you want to delete this child profile? This action cannot be undone.')) {
      return;
    }
    try {
      await API.delete(`children/${childId}/`);
      await fetchChildren();
    } catch (err) {
      console.error('Error deleting child:', err);
      alert('Failed to delete child profile. Please try again.');
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    const totalMonths = years * 12 + months;
    const ageYears = Math.floor(totalMonths / 12);
    const ageMonths = totalMonths % 12;
    return `${ageYears} years ${ageMonths} months`;
  };

  // Styles
  const layout = {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 0,
    minHeight: '100vh',
    background: '#f8f9fa'
  };

  const sidebar = {
    background: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    padding: '20px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const navItem = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    color: '#666',
    cursor: 'pointer',
    marginBottom: 8,
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.2s'
  };

  const navActive = { 
    ...navItem, 
    background: '#e8d5f2', 
    color: '#6a11cb',
    fontWeight: 600
  };

  const iconStyle = {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center'
  };

  const userSection = {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '16px',
    marginTop: 'auto'
  };

  const userProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#fff',
    borderRadius: 10,
    cursor: 'pointer'
  };

  const userAvatar = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '16px'
  };

  const userInfo2 = {
    flex: 1
  };

  const userName = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    lineHeight: 1.2
  };

  const userRole = {
    fontSize: '12px',
    color: '#999',
    marginTop: 2
  };

  const logoutIcon = {
    fontSize: '18px',
    color: '#999',
    cursor: 'pointer'
  };

  const mainContent = {
    padding: '24px 40px',
    background: '#ffffff'
  };

  const header = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px'
  };

  const headerLeft = {
    flex: 1
  };

  const pageTitle = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '8px'
  };

  const pageSubtitle = {
    fontSize: '14px',
    color: '#666'
  };

  const notificationIcon = {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px'
  };

  const notificationDot = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    background: '#ff4444',
    borderRadius: '50%'
  };

  const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  };

  const modalCard = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    width: '420px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
  };

  const modalTitle = {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '16px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box'
  };

  const modalActions = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px'
  };

  const sectionHeader = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  };

  const sectionTitle = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1a1a1a'
  };

  const addButton = {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const childrenGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  };

  const childCard = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  const childHeader = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px'
  };

  const childAvatar = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#e5e7eb'
  };

  const childInfo = {
    flex: 1
  };

  const childName = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '4px'
  };

  const childAge = {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px'
  };

  const activeBadge = {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#d1fae5',
    color: '#065f46',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600
  };

  const progressSection = {
    marginBottom: '16px'
  };

  const progressItem = {
    marginBottom: '12px'
  };

  const progressLabel = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  };

  const progressName = {
    fontSize: '13px',
    color: '#666',
    fontWeight: 500
  };

  const progressValue = {
    fontSize: '13px',
    fontWeight: 600
  };

  const progressBar = {
    width: '100%',
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden'
  };

  const progressFill = (percent, color) => ({
    width: `${percent}%`,
    height: '100%',
    background: color,
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  });

  const viewButton = {
    width: '100%',
    padding: '10px',
    background: '#f3e8ff',
    color: '#6a11cb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  };

  return (
    <div style={layout}>
      <aside style={sidebar}>
        <div>
          <div style={navItem} onClick={() => navigate('/std_dashboard')}>
            <span style={iconStyle}>🏠</span>
            Dashboard
          </div>
          <div style={navActive}>
            <span style={iconStyle}>👶</span>
            My Children
          </div>
          <div style={navItem} onClick={() => navigate('/milestones')}>
            <span style={iconStyle}>📋</span>
            Milestones
          </div>
          <div style={navItem} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem}>
            <span style={iconStyle}>💡</span>
            Activities
          </div>
        </div>
        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>
              {userInfo.first_name.charAt(0)}{userInfo.last_name.charAt(0)}
            </div>
            <div style={userInfo2}>
              <div style={userName}>
                {userInfo.first_name} {userInfo.last_name}
              </div>
              <div style={userRole}>
                {userInfo.role}
              </div>
            </div>
            <div style={logoutIcon} onClick={handleLogout} title="Logout">
              ⎋
            </div>
          </div>
        </div>
      </aside>
      <main style={mainContent}>
        <div style={header}>
          <div style={headerLeft}>
            <h1 style={pageTitle}>My Children</h1>
            <p style={pageSubtitle}>Welcome back! Here's what's happening today.</p>
          </div>
          <div style={notificationIcon}>
            🔔
            <span style={notificationDot}></span>
          </div>
        </div>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Children Profiles</h2>
          <button style={addButton} onClick={() => setShowModal(true)}>
            + Add Child
          </button>
        </div>
        <div style={childrenGrid}>
          {children.map((child) => (
            <div key={child.id} style={childCard}>
              <div style={childHeader}>
                <img 
                  src={child.photo || '/default-child.jpg'} 
                  alt={child.name}
                  style={childAvatar}
                />
                <div style={childInfo}>
                  <div style={childName}>{child.name}</div>
                  <div style={childAge}>Age: {calculateAge(child.date_of_birth)}</div>
                  <span style={activeBadge}>Active</span>
                </div>
              </div>
              <div style={progressSection}>
                <div style={progressItem}>
                  <div style={progressLabel}>
                    <span style={progressName}>Social-Emotional</span>
                    <span style={{ ...progressValue, color: '#8b5cf6' }}>85%</span>
                  </div>
                  <div style={progressBar}>
                    <div style={progressFill(85, '#8b5cf6')}></div>
                  </div>
                </div>
                <div style={progressItem}>
                  <div style={progressLabel}>
                    <span style={progressName}>Cognitive</span>
                    <span style={{ ...progressValue, color: '#3b82f6' }}>78%</span>
                  </div>
                  <div style={progressBar}>
                    <div style={progressFill(78, '#3b82f6')}></div>
                  </div>
                </div>
                <div style={progressItem}>
                  <div style={progressLabel}>
                    <span style={progressName}>Physical</span>
                    <span style={{ ...progressValue, color: '#10b981' }}>92%</span>
                  </div>
                  <div style={progressBar}>
                    <div style={progressFill(92, '#10b981')}></div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/milestones?childId=${child.id}`)}
                style={viewButton}
              >
                View Milestones
              </button>
              <button 
                onClick={() => handleDeleteChild(child.id)}
                style={{
                  ...viewButton,
                  background: '#fee2e2',
                  color: '#dc2626',
                  marginLeft: '8px'
                }}
              >
                Delete
              </button>
            </div>
          ))}
          {children.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              No children profiles yet. Click "Add Child" to get started.
            </div>
          )}
        </div>

        {showModal && (
          <div style={modalOverlay}>
            <div style={modalCard}>
              <h3 style={modalTitle}>Add Child</h3>
              {error && (
                <div style={{ marginBottom: '12px', color: '#b91c1c', fontSize: '13px' }}>{error}</div>
              )}
              <form onSubmit={handleAddChild}>
                <input
                  name="name"
                  placeholder="Child name"
                  value={form.name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  name="date_of_birth"
                  type="date"
                  placeholder="Date of birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>
                    Upload Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  />
                  {photoPreview && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '2px solid #a855f7'
                        }}
                      />
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>Preview</p>
                    </div>
                  )}
                </div>
                <div style={modalActions}>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setError(''); setPhotoPreview(''); }}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: '#a855f7', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Children;
