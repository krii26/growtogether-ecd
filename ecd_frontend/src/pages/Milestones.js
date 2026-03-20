import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import '../styles/Milestones.css';

// Cognitive Milestones predefined options
const cognitiveMilestones = [
  {
    title: 'Recognizes Familiar Objects',
    description: 'The child is able to identify and respond to commonly seen objects such as toys, food items, or familiar people when asked. They may point, look at, or name the object correctly.\n\n👉 Completed when the child consistently identifies at least 4–5 familiar objects without confusion.'
  },
  {
    title: 'Follows Simple Instructions',
    description: 'The child understands and acts on short, clear instructions like "sit down," "bring the ball," or "come here" without needing repeated guidance.\n\n👉 Completed when the child follows 2-step simple instructions correctly most of the time.'
  },
  {
    title: 'Problem-Solving Skills',
    description: 'The child shows curiosity and attempts to solve simple challenges such as stacking blocks, opening containers, or fitting shapes into the correct slots. They may try different approaches if one fails.\n\n👉 Completed when the child independently attempts and completes basic problem-solving tasks.'
  },
  {
    title: 'Memory Recall',
    description: 'The child remembers familiar routines, locations of objects, songs, or actions from previous experiences and can repeat them when prompted.\n\n👉 Completed when the child recalls and repeats actions, routines, or words after some time delay.'
  }
];

// Physical Milestones predefined options
const physicalMilestones = [
  {
    title: 'Gross Motor Skills Development',
    description: 'The child develops large muscle movements such as sitting, crawling, walking, running, or jumping. Balance and coordination gradually improve over time.\n\n👉 Completed when the child performs age-appropriate movements (e.g., walking steadily or running without frequent falls).'
  },
  {
    title: 'Fine Motor Skills Development',
    description: 'The child uses small muscles in hands and fingers to perform tasks like holding a spoon, picking up small objects, scribbling, or turning pages.\n\n👉 Completed when the child can control hand movements to perform precise actions like holding a crayon or picking small items.'
  },
  {
    title: 'Hand-Eye Coordination',
    description: 'The child is able to coordinate vision and hand movement in activities such as catching a ball, stacking blocks, or placing objects into containers.\n\n👉 Completed when the child performs coordination tasks with accuracy and minimal error.'
  },
  {
    title: 'Self-Help Physical Skills',
    description: 'The child begins to perform basic daily activities independently such as feeding themselves, drinking from a cup, or attempting to dress/undress.\n\n👉 Completed when the child can perform simple self-care tasks with little or no assistance.'
  }
];

// Social-Emotional Milestones predefined options
const socialEmotionalMilestones = [
  {
    title: 'Interaction with Others',
    description: 'The child shows interest in engaging with others through playing, talking, or responding to caregivers and peers. They may initiate or respond to interaction.\n\n👉 Completed when the child actively participates in simple play or communication with others.'
  },
  {
    title: 'Expresses Emotions',
    description: 'The child shows a range of emotions such as happiness, sadness, frustration, or excitement through facial expressions, sounds, or actions.\n\n👉 Completed when the child expresses emotions clearly and in appropriate situations.'
  },
  {
    title: 'Shares and Takes Turns',
    description: 'The child begins to understand the concept of sharing toys and waiting for their turn during play or group activities, though support may still be needed.\n\n👉 Completed when the child shares or waits briefly without significant resistance.'
  },
  {
    title: 'Responds to Social Cues',
    description: 'The child reacts to others\' facial expressions, tone of voice, gestures, or body language (e.g., smiling back, stopping when told "no").\n\n👉 Completed when the child appropriately responds to common social signals.'
  }
];

// Language Milestones predefined options
const languageMilestones = [
  {
    title: 'Responds to Sounds and Name',
    description: 'The child reacts to sounds, voices, or their own name by turning their head, making eye contact, or showing attention. This shows early listening and recognition skills.\n\n👉 Completed when the child consistently responds to their name or familiar sounds without repeated attempts.'
  },
  {
    title: 'Uses Simple Words',
    description: 'The child begins to say basic words such as "mama," "dada," "no," or names of common objects. Speech may not be perfectly clear but is understandable in context.\n\n👉 Completed when the child uses at least 3–5 meaningful words regularly to communicate needs or identify people/objects.'
  },
  {
    title: 'Understands Basic Language',
    description: 'The child understands simple words, questions, or phrases like "where is your toy?" or "give me the ball," even if they cannot fully speak yet.\n\n👉 Completed when the child responds correctly to simple questions or instructions most of the time.'
  },
  {
    title: 'Combines Words or Gestures',
    description: 'The child starts combining words (e.g., "want milk") or uses gestures (pointing, waving) along with sounds to express needs and intentions.\n\n👉 Completed when the child uses 2-word combinations or gestures + sounds to communicate clearly.'
  }
];

const Milestones = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const childId = searchParams.get('childId');
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(childId);
  const [child, setChild] = useState(null);
  const [milestones, setMilestones] = useState({
    'social-emotional': [],
    'cognitive': [],
    'physical': [],
    'language': []
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('social-emotional');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date_achieved: '',
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    // First, fetch all children
    fetchChildren();
  }, []);

  useEffect(() => {
    // When selectedChildId changes, fetch that child's milestones
    if (selectedChildId) {
      fetchChildAndMilestones(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      console.log('Fetching all children');
      const res = await API.get('children/');
      console.log('Children data:', res.data);
      setChildren(res.data);
      
      // If childId from URL exists, use it; otherwise use first child
      if (childId) {
        setSelectedChildId(childId);
      } else if (res.data.length > 0) {
        setSelectedChildId(res.data[0].id);
      } else {
        setError('No children found. Please add a child first.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setError(`Failed to load children: ${error.message}`);
      setLoading(false);
    }
  };

  const fetchChildAndMilestones = async (childIdToFetch) => {
    try {
      console.log('Fetching child with ID:', childIdToFetch);
      const childRes = await API.get(`children/${childIdToFetch}/`);
      console.log('Child data:', childRes.data);
      setChild(childRes.data);

      console.log('Fetching milestones for child:', childIdToFetch);
      const milestonesRes = await API.get('milestones/', {
        params: { child: childIdToFetch }
      });
      console.log('Milestones data:', milestonesRes.data);

      const grouped = {
        'social-emotional': [],
        'cognitive': [],
        'physical': [],
        'language': []
      };

      milestonesRes.data.forEach((milestone) => {
        if (grouped[milestone.category]) {
          grouped[milestone.category].push(milestone);
        }
      });

      setMilestones(grouped);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(`Failed to load milestones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: preview
      }));
      setError('');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    // Reset form when category changes
    setForm({
      title: '',
      description: '',
      date_achieved: '',
      image: null,
      imagePreview: null
    });
    setError('');
  };

  const handleTitleChange = (e) => {
    const selectedTitle = e.target.value;
    setForm((prev) => ({ ...prev, title: selectedTitle }));
    
    // Auto-populate description based on category
    let selectedMilestone = null;
    
    if (selectedCategory === 'cognitive') {
      selectedMilestone = cognitiveMilestones.find(m => m.title === selectedTitle);
    } else if (selectedCategory === 'physical') {
      selectedMilestone = physicalMilestones.find(m => m.title === selectedTitle);
    } else if (selectedCategory === 'social-emotional') {
      selectedMilestone = socialEmotionalMilestones.find(m => m.title === selectedTitle);
    } else if (selectedCategory === 'language') {
      selectedMilestone = languageMilestones.find(m => m.title === selectedTitle);
    }
    
    if (selectedMilestone) {
      setForm((prev) => ({ ...prev, description: selectedMilestone.description }));
    }
    setError('');
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a milestone title');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('child', selectedChildId);
      formData.append('category', selectedCategory);
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.date_achieved) {
        formData.append('date_achieved', form.date_achieved);
      }
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editingMilestone) {
        // Update existing milestone
        await API.put(`milestones/${editingMilestone.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new milestone
        await API.post('milestones/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await fetchChildAndMilestones(selectedChildId);
      setShowAddModal(false);
      setEditingMilestone(null);
      setForm({
        title: '',
        description: '',
        date_achieved: '',
        image: null,
        imagePreview: null
      });
    } catch (err) {
      console.error('Error saving milestone:', err);
      setError('Failed to save milestone. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setSelectedCategory(milestone.category);
    setForm({
      title: milestone.title,
      description: milestone.description,
      date_achieved: milestone.date_achieved || '',
      image: null,
      imagePreview: milestone.image || null
    });
    setShowAddModal(true);
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;

    try {
      await API.delete(`milestones/${milestoneId}/`);
      await fetchChildAndMilestones(selectedChildId);
    } catch (error) {
      console.error('Error deleting milestone:', error);
      setError('Failed to delete milestone');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading milestones...</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    );
  }

  if (error && !child) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red', marginBottom: '20px' }}>Error: {error}</p>
        <button
          onClick={() => navigate('/children')}
          style={{
            padding: '10px 20px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Children
        </button>
      </div>
    );
  }

  const categoryConfig = {
    'social-emotional': {
      title: 'Social-Emotional',
      color: '#a78bfa',
      icon: '👥'
    },
    'cognitive': {
      title: 'Cognitive',
      color: '#60a5fa',
      icon: '🧠'
    },
    'physical': {
      title: 'Physical',
      color: '#34d399',
      icon: '💪'
    },
    'language': {
      title: 'Language',
      color: '#f472b6',
      icon: '🗣️'
    }
  };

  // Styles (same as Children.js)
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
  };

  const navItem = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    margin: '4px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    transition: 'all 0.2s',
    fontWeight: '500'
  };

  const navActive = {
    ...navItem,
    background: '#e9d5ff',
    color: '#6a11cb'
  };

  const iconStyle = {
    fontSize: '20px'
  };

  const mainContent = {
    padding: '24px 40px',
    background: '#ffffff'
  };

  const userSection = {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
  };

  const userProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get user info from localStorage for display
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : {};
  const currentUser = {
    first_name: parsedUser.first_name || 'John',
    last_name: parsedUser.last_name || 'Doe',
    role: parsedUser.role || 'Parent'
  };

  return (
    <div style={layout}>
      <aside style={sidebar}>
        <div>
          <div style={navItem} onClick={() => navigate('/std_dashboard')}>
            <span style={iconStyle}>🏠</span>
            Dashboard
          </div>
          <div style={navItem} onClick={() => navigate('/children')}>
            <span style={iconStyle}>👶</span>
            My Children
          </div>
          <div style={navActive}>
            <span style={iconStyle}>📋</span>
            Milestones
          </div>
          <div style={navItem} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem} onClick={() => navigate('/activities')}>
            <span style={iconStyle}>💡</span>
            Activities
          </div>
        </div>
        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>
              {currentUser.first_name.charAt(0)}{currentUser.last_name.charAt(0)}
            </div>
            <div style={userInfo2}>
              <div style={userName}>
                {currentUser.first_name} {currentUser.last_name}
              </div>
              <div style={userRole}>
                {currentUser.role}
              </div>
            </div>
            <div style={logoutIcon} onClick={handleLogout} title="Logout">
              ⎋
            </div>
          </div>
        </div>
      </aside>
      <main style={mainContent}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 5px 0', color: '#333' }}>
            Milestones - {child?.name || 'Child'}
          </h1>
          <p style={{ color: '#666', margin: '0' }}>Track developmental milestones with photos</p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '600',
              marginRight: '10px',
              color: '#333'
            }}>
              Select Child:
            </label>
            <select
              value={selectedChildId || ''}
              onChange={(e) => setSelectedChildId(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Choose a child --</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Add Milestone Button */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 20px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          + Add Milestone
        </button>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Milestones Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(categoryConfig).map(([category, config]) => (
            <div
              key={category}
              style={{
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {/* Category Header */}
              <div style={{
                background: config.color,
                color: 'white',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{config.icon}</span>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    {config.title}
                  </h2>
                </div>
                <span style={{
                  background: 'rgba(255,255,255,0.3)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {milestones[category].length}
                </span>
              </div>

              {/* Milestones List */}
              <div style={{ padding: '16px' }}>
                {milestones[category].length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', margin: 0 }}>
                    No milestones yet
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {milestones[category].map((milestone) => (
                      <div
                        key={milestone.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          padding: '12px',
                          background: '#fafafa'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#333',
                            flex: 1
                          }}>
                            {milestone.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                            <button
                              onClick={() => handleEditMilestone(milestone)}
                              style={{
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {milestone.description && (
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            margin: '8px 0',
                            lineHeight: '1.6'
                          }}>
                            {milestone.description.split('\n').map((line, idx) => {
                              if (line.startsWith('👉')) {
                                return (
                                  <p key={idx} style={{
                                    margin: '8px 0 0 0',
                                    color: '#059669',
                                    fontWeight: '500',
                                    background: '#d1fae5',
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    borderLeft: '3px solid #059669'
                                  }}>
                                    {line}
                                  </p>
                                );
                              }
                              return line ? <p key={idx} style={{ margin: '4px 0' }}>{line}</p> : null;
                            })}
                          </div>
                        )}

                        {milestone.image && (
                          <div style={{
                            marginTop: '10px',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <img
                              src={milestone.image}
                              alt={milestone.title}
                              style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}

                        {milestone.date_achieved && (
                          <p style={{
                            fontSize: '11px',
                            color: '#999',
                            margin: '8px 0 0 0'
                          }}>
                            📅 {new Date(milestone.date_achieved).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Milestone Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>
                {editingMilestone ? 'Update Milestone' : 'Add New Milestone'}
              </h2>

              <form onSubmit={handleAddMilestone}>
                {/* Category Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    disabled={editingMilestone !== null}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: editingMilestone ? '#f9fafb' : 'white',
                      cursor: editingMilestone ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    Milestone Title *
                  </label>
                  {selectedCategory === 'cognitive' ? (
                    <select
                      name="title"
                      value={form.title}
                      onChange={handleTitleChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Select a Cognitive Milestone --</option>
                      {cognitiveMilestones.map((milestone, idx) => (
                        <option key={idx} value={milestone.title}>
                          {milestone.title}
                        </option>
                      ))}
                    </select>
                  ) : selectedCategory === 'physical' ? (
                    <select
                      name="title"
                      value={form.title}
                      onChange={handleTitleChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Select a Physical Milestone --</option>
                      {physicalMilestones.map((milestone, idx) => (
                        <option key={idx} value={milestone.title}>
                          {milestone.title}
                        </option>
                      ))}
                    </select>
                  ) : selectedCategory === 'social-emotional' ? (
                    <select
                      name="title"
                      value={form.title}
                      onChange={handleTitleChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Select a Social-Emotional Milestone --</option>
                      {socialEmotionalMilestones.map((milestone, idx) => (
                        <option key={idx} value={milestone.title}>
                          {milestone.title}
                        </option>
                      ))}
                    </select>
                  ) : selectedCategory === 'language' ? (
                    <select
                      name="title"
                      value={form.title}
                      onChange={handleTitleChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Select a Language Milestone --</option>
                      {languageMilestones.map((milestone, idx) => (
                        <option key={idx} value={milestone.title}>
                          {milestone.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g., Speaks in complete sentences"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Add details about this milestone..."
                    readOnly={form.title !== '' && ['cognitive', 'physical', 'social-emotional', 'language'].includes(selectedCategory)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      minHeight: '120px',
                      resize: 'vertical',
                      background: (form.title !== '' && ['cognitive', 'physical', 'social-emotional', 'language'].includes(selectedCategory)) ? '#f9fafb' : 'white',
                      cursor: (form.title !== '' && ['cognitive', 'physical', 'social-emotional', 'language'].includes(selectedCategory)) ? 'not-allowed' : 'text'
                    }}
                  />
                </div>

                {/* Date */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    Date Achieved
                  </label>
                  <input
                    type="date"
                    name="date_achieved"
                    value={form.date_achieved}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Image Upload */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    Upload Photo
                  </label>
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '6px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#f9fafb',
                    transition: 'all 0.3s'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="image-input"
                    />
                    <label htmlFor="image-input" style={{
                      cursor: 'pointer',
                      display: 'block'
                    }}>
                      {form.imagePreview ? (
                        <div>
                          <img
                            src={form.imagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '4px',
                              marginBottom: '10px'
                            }}
                          />
                          <p style={{
                            margin: '0',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: '#666'
                          }}>
                            📸 Click to upload or drag and drop
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#999'
                          }}>
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMilestone(null);
                      setForm({
                        title: '',
                        description: '',
                        date_achieved: '',
                        image: null,
                        imagePreview: null
                      });
                      setError('');
                    }}
                    style={{
                      padding: '10px 16px',
                      background: '#e5e7eb',
                      color: '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: '10px 16px',
                      background: uploading ? '#ccc' : '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {uploading ? (editingMilestone ? 'Updating...' : 'Adding...') : (editingMilestone ? 'Update Milestone' : 'Add Milestone')}
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

export default Milestones;
