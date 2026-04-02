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

const milestoneOptionsByCategory = {
  'social-emotional': socialEmotionalMilestones,
  cognitive: cognitiveMilestones,
  physical: physicalMilestones,
  language: languageMilestones
};

const getCategoryMilestoneOptions = (category) => milestoneOptionsByCategory[category] || [];

const getMilestoneDescription = (category, title) => {
  const matchedMilestone = getCategoryMilestoneOptions(category).find((m) => m.title === title);
  return matchedMilestone?.description || '';
};

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
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const [completedFilter, setCompletedFilter] = useState('all'); // 'all', 'social-emotional', 'cognitive', 'physical', 'language'
  const [completedSort, setCompletedSort] = useState('recent'); // 'recent', 'rating', 'category'
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [quickViewMilestone, setQuickViewMilestone] = useState(null);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [multiDateByTitle, setMultiDateByTitle] = useState({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    date_achieved: '',
    image: null,
    imagePreview: null
  });
  const categoryMilestoneOptions = getCategoryMilestoneOptions(selectedCategory);

  useEffect(() => {
    // First, fetch all children
    fetchChildren();
  }, []);

  useEffect(() => {
    // When selectedChildId changes, fetch that child's milestones
    if (selectedChildId) {
      fetchChildAndMilestones(selectedChildId);
      // Load completed milestones from localStorage
      const storedCompleted = localStorage.getItem(`completedMilestones_${selectedChildId}`);
      if (storedCompleted) {
        setCompletedMilestones(JSON.parse(storedCompleted));
      } else {
        setCompletedMilestones([]);
      }
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
    setSelectedTitles([]);
    setMultiDateByTitle({});
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
    setForm((prev) => ({
      ...prev,
      title: selectedTitle,
      description: getMilestoneDescription(selectedCategory, selectedTitle)
    }));
    setSelectedTitles(selectedTitle ? [selectedTitle] : []);
    setError('');
  };

  const handleMultiTitleChange = (e) => {
    const titles = Array.from(e.target.selectedOptions)
      .map((option) => option.value)
      .filter(Boolean);

    setSelectedTitles(titles);
    setMultiDateByTitle((prev) => {
      const next = {};
      titles.forEach((title) => {
        next[title] = prev[title] || '';
      });
      return next;
    });
    setForm((prev) => ({
      ...prev,
      title: titles[0] || '',
      description:
        titles.length === 1
          ? getMilestoneDescription(selectedCategory, titles[0])
          : titles.length > 1
            ? 'Descriptions will be auto-filled individually for each selected milestone.'
            : ''
    }));
    setError('');
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();

    if (editingMilestone && !form.title.trim()) {
      setError('Please enter a milestone title');
      return;
    }

    if (!editingMilestone && selectedTitles.length === 0) {
      setError('Please select at least one milestone title');
      return;
    }

    setUploading(true);
    try {
      if (editingMilestone) {
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

        await API.put(`milestones/${editingMilestone.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await Promise.all(
          selectedTitles.map(async (title) => {
            const formData = new FormData();
            formData.append('child', selectedChildId);
            formData.append('category', selectedCategory);
            formData.append('title', title);
            formData.append('description', getMilestoneDescription(selectedCategory, title));
            const perTitleDate = selectedTitles.length > 1
              ? multiDateByTitle[title]
              : form.date_achieved;
            if (perTitleDate) {
              formData.append('date_achieved', perTitleDate);
            }
            if (form.image) {
              formData.append('image', form.image);
            }

            return API.post('milestones/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          })
        );
      }

      await fetchChildAndMilestones(selectedChildId);
      setShowAddModal(false);
      setEditingMilestone(null);
      setSelectedTitles([]);
      setMultiDateByTitle({});
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
    setSelectedTitles([milestone.title]);
    setMultiDateByTitle({});
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

  const getTargetDateStatus = (targetDate) => {
    if (!targetDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(targetDate);
    dueDate.setHours(0, 0, 0, 0);

    return {
      isMissed: dueDate < today,
      formattedDate: dueDate.toLocaleDateString()
    };
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
          onClick={() => {
            setShowAddModal(true);
            setEditingMilestone(null);
            setSelectedTitles([]);
            setMultiDateByTitle({});
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

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'active' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'active' ? 'white' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'active' ? '3px solid #8b5cf6' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            Active Milestones ({Object.values(milestones).flat().length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'completed' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'completed' ? 'white' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'completed' ? '3px solid #8b5cf6' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            Completed Milestones ({completedMilestones.length})
          </button>
        </div>

        {/* Stats Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
              {Object.values(milestones).flat().length}
            </div>
            <div style={{ fontSize: '13px', color: '#6b21a8', marginTop: '4px' }}>
              Active
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
              {completedMilestones.length}
            </div>
            <div style={{ fontSize: '13px', color: '#065f46', marginTop: '4px' }}>
              Completed
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c' }}>
              {completedMilestones.length > 0 
                ? ((completedMilestones.reduce((sum, m) => sum + (m.rating || 0), 0) / completedMilestones.length).toFixed(1))
                : '0'}/10
            </div>
            <div style={{ fontSize: '13px', color: '#9a3412', marginTop: '4px' }}>
              Avg Rating
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0891b2' }}>
              {Math.round((completedMilestones.length / (Object.values(milestones).flat().length + completedMilestones.length) * 100) || 0)}%
            </div>
            <div style={{ fontSize: '13px', color: '#164e63', marginTop: '4px' }}>
              Progress
            </div>
          </div>
        </div>

        {/* Filter and Sort Controls for Completed Tab */}
        {activeTab === 'completed' && completedMilestones.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Filter:
              </label>
              <select
                value={completedFilter}
                onChange={(e) => setCompletedFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Categories</option>
                <option value="social-emotional">Social-Emotional</option>
                <option value="cognitive">Cognitive</option>
                <option value="physical">Physical</option>
                <option value="language">Language</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Sort by:
              </label>
              <select
                value={completedSort}
                onChange={(e) => setCompletedSort(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rating</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Milestones Grid */}
        {activeTab === 'active' && (
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

                        {milestone.date_achieved && (() => {
                          const targetStatus = getTargetDateStatus(milestone.date_achieved);
                          return targetStatus?.isMissed ? (
                            <p style={{
                              fontSize: '11px',
                              color: '#b91c1c',
                              margin: '8px 0 0 0',
                              background: '#fee2e2',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              borderLeft: '3px solid #dc2626'
                            }}>
                              ⚠ Deadline missed (Target: {targetStatus.formattedDate})
                            </p>
                          ) : (
                            <p style={{
                              fontSize: '11px',
                              color: '#999',
                              margin: '8px 0 0 0'
                            }}>
                              🎯 Target: {targetStatus?.formattedDate}
                            </p>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Completed Milestones Section */}
        {activeTab === 'completed' && (
          <div>
            {completedMilestones.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ fontSize: '20px', color: '#374151', marginBottom: '8px' }}>
                  No Completed Milestones Yet
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Mark milestones as complete from the student profile to see them here!
                </p>
              </div>
            ) : (
              <>
                {/* Group completed milestones by timeline */}
                {(() => {
                  const now = new Date();
                  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                  // Filter and sort
                  let filtered = completedMilestones.filter(m => 
                    completedFilter === 'all' || m.category === completedFilter
                  );

                  if (completedSort === 'recent') {
                    filtered.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
                  } else if (completedSort === 'rating') {
                    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                  } else if (completedSort === 'category') {
                    filtered.sort((a, b) => a.category.localeCompare(b.category));
                  }

                  // Group by timeline
                  const thisWeek = filtered.filter(m => new Date(m.completedDate) >= oneWeekAgo);
                  const thisMonth = filtered.filter(m => {
                    const date = new Date(m.completedDate);
                    return date < oneWeekAgo && date >= oneMonthAgo;
                  });
                  const earlier = filtered.filter(m => new Date(m.completedDate) < oneMonthAgo);

                  const renderMilestoneCard = (milestone, index) => {
                    const config = categoryConfig[milestone.category];
                    const achievementBadge = index === 0 ? '🥇 First!' : 
                                            filtered.length === 10 && index === 9 ? '🎖️ 10th!' :
                                            filtered.length === 25 && index === 24 ? '🏆 25th!' : null;

                    return (
                      <div
                        key={milestone.id}
                        style={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Achievement Badge */}
                        {achievementBadge && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {achievementBadge}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                          <div style={{
                            background: config?.color || '#8b5cf6',
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '20px',
                            lineHeight: 1
                          }}>
                            {config?.icon || '📌'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              margin: '0 0 4px 0',
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#111827'
                            }}>
                              {milestone.title}
                            </h3>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              textTransform: 'capitalize'
                            }}>
                              {milestone.category.replace('-', ' ')}
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                            Rating:
                          </span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(10)].map((_, i) => (
                              <span key={i} style={{
                                fontSize: '14px',
                                color: i < (milestone.rating || 0) ? '#fbbf24' : '#e5e7eb'
                              }}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#059669'
                          }}>
                            {milestone.rating || 0}/10
                          </span>
                        </div>

                        {/* Image Preview */}
                        {milestone.image && (
                          <div style={{
                            marginBottom: '12px',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <img
                              src={milestone.image}
                              alt={milestone.title}
                              style={{
                                width: '100%',
                                maxHeight: '120px',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}

                        {/* Suggestions Preview */}
                        {milestone.suggestions && (
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            fontStyle: 'italic',
                            marginBottom: '12px',
                            maxHeight: '40px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            "{milestone.suggestions}"
                          </div>
                        )}

                        {/* Date and Actions */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '12px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ✅ {new Date(milestone.completedDate).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => setQuickViewMilestone(milestone)}
                            style={{
                              background: '#e0e7ff',
                              color: '#4338ca',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {thisWeek.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            📅 This Week
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {thisWeek.length}
                            </span>
                          </h3>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '16px'
                          }}>
                            {thisWeek.map((m, i) => renderMilestoneCard(m, i))}
                          </div>
                        </div>
                      )}

                      {thisMonth.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            📆 This Month
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {thisMonth.length}
                            </span>
                          </h3>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '16px'
                          }}>
                            {thisMonth.map((m, i) => renderMilestoneCard(m, thisWeek.length + i))}
                          </div>
                        </div>
                      )}

                      {earlier.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            📜 Earlier
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {earlier.length}
                            </span>
                          </h3>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '16px'
                          }}>
                            {earlier.map((m, i) => renderMilestoneCard(m, thisWeek.length + thisMonth.length + i))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* Quick View Modal */}
        {quickViewMilestone && (
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
            zIndex: 1001,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                background: categoryConfig[quickViewMilestone.category]?.color || '#8b5cf6',
                padding: '20px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                color: 'white',
                position: 'relative'
              }}>
                <button
                  onClick={() => setQuickViewMilestone(null)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ✕
                </button>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
                  {quickViewMilestone.title}
                </h2>
                <div style={{ fontSize: '14px', opacity: 0.9, textTransform: 'capitalize' }}>
                  {quickViewMilestone.category.replace('-', ' ')} • Completed {new Date(quickViewMilestone.completedDate).toLocaleDateString()}
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                {quickViewMilestone.image && (
                  <img
                    src={quickViewMilestone.image}
                    alt={quickViewMilestone.title}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}
                  />
                )}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Rating: {quickViewMilestone.rating || 0}/10
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(10)].map((_, i) => (
                      <span key={i} style={{
                        fontSize: '20px',
                        color: i < (quickViewMilestone.rating || 0) ? '#fbbf24' : '#e5e7eb'
                      }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                {quickViewMilestone.description && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Description
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                      {quickViewMilestone.description}
                    </div>
                  </div>
                )}
                {quickViewMilestone.suggestions && (
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Teacher's Suggestions
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      background: '#f9fafb',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #8b5cf6'
                    }}>
                      "{quickViewMilestone.suggestions}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                  <select
                    name="title"
                    value={editingMilestone ? form.title : selectedTitles}
                    onChange={editingMilestone ? handleTitleChange : handleMultiTitleChange}
                    multiple={!editingMilestone}
                    size={!editingMilestone ? 6 : undefined}
                    style={{
                      width: '100%',
                      padding: editingMilestone ? '10px 12px' : '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  >
                    {editingMilestone && (
                      <option value="">-- Select Milestone --</option>
                    )}
                    {categoryMilestoneOptions.map((milestone, idx) => (
                      <option key={idx} value={milestone.title}>
                        {milestone.title}
                      </option>
                    ))}
                  </select>
                  {!editingMilestone && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                      Hold Ctrl (or Cmd on Mac) to select multiple titles.
                    </p>
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

                {/* Target Date */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    Target Date
                  </label>
                  {!editingMilestone && selectedTitles.length > 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedTitles.map((title) => (
                        <div key={title} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          background: '#f9fafb'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#4b5563',
                            marginBottom: '6px'
                          }}>
                            {title}
                          </div>
                          <input
                            type="date"
                            value={multiDateByTitle[title] || ''}
                            onChange={(e) => setMultiDateByTitle((prev) => ({
                              ...prev,
                              [title]: e.target.value
                            }))}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
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
                  )}
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
                      setSelectedTitles([]);
                      setMultiDateByTitle({});
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
