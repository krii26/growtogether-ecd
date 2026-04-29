import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import ParentSidebar from '../components/ParentSidebar';

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
  const [editingChildId, setEditingChildId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const getApiErrorMessage = (err, fallback) => {
    if (!err?.response) {
      return 'Cannot connect to backend server (http://127.0.0.1:8000). Start Django server and try again.';
    }

    const data = err.response.data;
    if (typeof data === 'string') return data;
    if (data?.detail) return data.detail;

    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      const firstValue = data[firstKey];
      if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue[0]}`;
      if (typeof firstValue === 'string') return `${firstKey}: ${firstValue}`;
    }

    return fallback;
  };

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
      setError(getApiErrorMessage(error, 'Failed to load children.'));
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
      setError(getApiErrorMessage(err, 'Failed to add child. Please try again.'));
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

  const handleEditChild = (child) => {
    setEditingChildId(child.id);
    setIsEditing(true);
    setForm({
      name: child.name,
      date_of_birth: child.date_of_birth || '',
      photo: null
    });
    if (child.photo) {
      setPhotoPreview(child.photo);
    } else {
      setPhotoPreview('');
    }
    setShowModal(true);
  };

  const handleUpdateChild = async (e) => {
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
      
      await API.patch(`children/${editingChildId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchChildren();
      setShowModal(false);
      setEditingChildId(null);
      setIsEditing(false);
      setForm({ name: '', date_of_birth: '', photo: null });
      setPhotoPreview('');
    } catch (err) {
      console.error('Error updating child:', err);
      setError(getApiErrorMessage(err, 'Failed to update child. Please try again.'));
    } finally {
      setSaving(false);
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

  const progressData = [
    { name: 'Social-Emotional', percent: 85, color: '#6366f1' },
    { name: 'Cognitive', percent: 78, color: '#2563eb' },
    { name: 'Physical', percent: 92, color: '#059669' }
  ];

  // Styles
  const layout = {
    display: 'flex',
    gap: 0,
    minHeight: '100vh',
    background: '#ffffff'
  };

  const sidebar = {
    width: '240px',
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: '24px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box'
  };

  const navItem = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    color: '#4b5563',
    cursor: 'pointer',
    marginBottom: 6,
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.2s ease'
  };

  const navActive = { 
    ...navItem, 
    background: '#e8eefc', 
    color: '#1d4ed8',
    fontWeight: 600
  };

  const iconStyle = {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center'
  };

  const userSection = {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px',
    marginTop: 'auto'
  };

  const userProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    cursor: 'default'
  };

  const userAvatar = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
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
    color: '#6b7280',
    marginTop: 2
  };

  const logoutIcon = {
    fontSize: '18px',
    color: '#6b7280',
    cursor: 'pointer'
  };

  const mainContent = {
    flex: 1,
    padding: '28px 34px',
    background: 'transparent'
  };

  const contentContainer = {
    maxWidth: '1160px',
    margin: '0 auto'
  };

  const header = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    padding: '18px 22px'
  };

  const headerLeft = {
    flex: 1
  };

  const pageTitle = {
    fontSize: '30px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '6px',
    marginTop: 0
  };

  const pageSubtitle = {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  };

  const notificationIcon = {
    position: 'relative',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#eff6ff',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    border: '1px solid #dbeafe'
  };

  const notificationDot = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    background: '#ef4444',
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
    marginBottom: '18px'
  };

  const sectionTitle = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827'
  };

  const addButton = {
    padding: '10px 18px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 8px 18px rgba(37, 99, 235, 0.22)'
  };

  const childrenGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
    gap: '20px'
  };

  const childCard = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)'
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
    color: '#111827',
    marginBottom: '4px'
  };

  const childAge = {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px'
  };

  const activeBadge = {
    display: 'inline-block',
    padding: '5px 12px',
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600
  };

  const progressSection = {
    marginBottom: '16px'
  };

  const progressItem = {
    marginBottom: '14px'
  };

  const progressLabel = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  };

  const progressName = {
    fontSize: '13px',
    color: '#374151',
    fontWeight: 500
  };

  const progressValue = {
    fontSize: '13px',
    fontWeight: 600
  };

  const progressBar = {
    width: '100%',
    height: '7px',
    background: '#e5e7eb',
    borderRadius: '999px',
    overflow: 'hidden'
  };

  const progressFill = (percent, color) => ({
    width: `${percent}%`,
    height: '100%',
    background: color,
    borderRadius: '999px',
    transition: 'width 0.3s ease'
  });

  const actionsRow = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginTop: '8px'
  };

  const actionButton = {
    width: '100%',
    padding: '10px',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  const emptyState = {
    gridColumn: '1 / -1',
    background: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '14px',
    padding: '42px 24px',
    textAlign: 'center',
    color: '#6b7280'
  };

  return (
    <div style={layout}>
      <ParentSidebar activeKey="children" userInfo={userInfo} onLogout={handleLogout} />
      <main style={mainContent}>
        <div style={contentContainer}>
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
                {progressData.map((progress) => (
                  <div key={progress.name} style={progressItem}>
                    <div style={progressLabel}>
                      <span style={progressName}>{progress.name}</span>
                      <span style={{ ...progressValue, color: progress.color }}>{progress.percent}%</span>
                    </div>
                    <div style={progressBar}>
                      <div style={progressFill(progress.percent, progress.color)}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={actionsRow}>
                <button 
                  onClick={() => navigate(`/milestones?childId=${child.id}`)}
                  style={actionButton}
                >
                  Milestones
                </button>
                <button 
                  onClick={() => handleEditChild(child)}
                  style={{
                    ...actionButton,
                    background: '#fef3c7',
                    color: '#b45309'
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteChild(child.id)}
                  style={{
                    ...actionButton,
                    background: '#fee2e2',
                    color: '#b91c1c'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {children.length === 0 && (
            <div style={emptyState}>
              No children profiles yet. Click "Add Child" to get started.
            </div>
          )}
        </div>

        {showModal && (
          <div style={modalOverlay}>
            <div style={modalCard}>
              <h3 style={modalTitle}>{isEditing ? 'Edit Child' : 'Add Child'}</h3>
              {error && (
                <div style={{ marginBottom: '12px', color: '#b91c1c', fontSize: '13px' }}>{error}</div>
              )}
              <form onSubmit={(e) => isEditing ? handleUpdateChild(e) : handleAddChild(e)}>
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
                          border: '2px solid #2563eb'
                        }}
                      />
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>Preview</p>
                    </div>
                  )}
                </div>
                <div style={modalActions}>
                  <button
                    type="button"
                    onClick={() => { 
                      setShowModal(false); 
                      setError(''); 
                      setPhotoPreview(''); 
                      setEditingChildId(null);
                      setIsEditing(false);
                      setForm({ name: '', date_of_birth: '', photo: null });
                    }}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default Children;
