import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ELibrary = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });
  const [activeNav, setActiveNav] = useState('E-Library');

  const categories = [
    'All Categories',
    'Nutrition',
    'Psychology',
    'Behavior',
    'Sleep',
    'Language',
    'Safety'
  ];

  const mockResources = [
    {
      id: 1,
      title: 'Healthy Eating for Toddlers',
      category: 'Nutrition',
      description: 'Essential nutrition guidelines and meal planning tips for children aged 1-3 years.',
      image: '/healthyeating.jpg',
      link: '#'
    },
    {
      id: 2,
      title: 'Emotional Development Stages',
      category: 'Psychology',
      description: "Understanding your child's emotional growth and how to support it effectively.",
      image: '/social-emotional.jpg',
      link: '#'
    },
    {
      id: 3,
      title: 'Managing Tantrums Effectively',
      category: 'Behavior',
      description: 'Practical strategies for handling challenging behaviors in young children.',
      image: 'https://images.unsplash.com/photo-1503454537688-e0cecad2476a?w=400&h=300&fit=crop',
      link: '#'
    },
    {
      id: 4,
      title: 'Healthy Sleep Habits',
      category: 'Sleep',
      description: 'Creating bedtime routines and ensuring quality sleep for optimal development.',
      image: 'https://images.unsplash.com/photo-1503454537688-e0cecad2476a?w=400&h=300&fit=crop',
      link: '#'
    },
    {
      id: 5,
      title: 'Language Development Milestones',
      category: 'Language',
      description: 'Supporting your child\'s communication skills from birth to age 6.',
      image: 'https://images.unsplash.com/photo-1503454537688-e0cecad2476a?w=400&h=300&fit=crop',
      link: '#'
    },
    {
      id: 6,
      title: 'Child Safety Essentials',
      category: 'Safety',
      description: 'Comprehensive guide to keeping your child safe at home and outdoors.',
      image: 'https://images.unsplash.com/photo-1503454537688-e0cecad2476a?w=400&h=300&fit=crop',
      link: '#'
    },
  ];

  useEffect(() => {
    loadUserInfo();
    setResources(mockResources);
    filterResources(mockResources, 'All Categories', '');
  }, []);

  useEffect(() => {
    filterResources(resources, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, resources]);

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

  const filterResources = (allResources, category, query) => {
    let filtered = allResources;

    if (category !== 'All Categories') {
      filtered = filtered.filter(r => r.category === category);
    }

    if (query.trim()) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navigateTo = (path, navName) => {
    setActiveNav(navName);
    navigate(path);
  };

  // Inline Styles
  const layout = {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 0,
    minHeight: '100vh',
    background: '#f8f9fa',
    '@media (maxWidth: 768px)': {
      gridTemplateColumns: '1fr'
    }
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
    justifyContent: 'space-between',
    '@media (maxWidth: 768px)': {
      position: 'relative',
      height: 'auto',
      borderRight: 'none',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '10px'
    }
  };

  const navItem = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    background: isActive ? '#e8d5f2' : 'transparent',
    color: isActive ? '#7b2cbf' : '#333',
    fontWeight: isActive ? '600' : '500',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  });

  const mainContent = {
    padding: '32px',
    background: '#fff',
    '@media (maxWidth: 768px)': {
      padding: '20px'
    }
  };

  const header = {
    marginBottom: '24px'
  };

  const headerTitle = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
    '@media (maxWidth: 768px)': {
      fontSize: '22px'
    }
  };

  const headerSubtitle = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px'
  };

  const filterSection = {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    alignItems: 'center',
    flexWrap: 'wrap',
    '@media (maxWidth: 768px)': {
      flexDirection: 'column',
      gap: '12px'
    }
  };

  const searchBar = {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    maxWidth: '400px',
    '@media (maxWidth: 768px)': {
      maxWidth: '100%',
      width: '100%'
    }
  };

  const dropdown = {
    padding: '10px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px',
    '@media (maxWidth: 768px)': {
      width: '100%',
      minWidth: 'auto'
    }
  };

  const resourcesGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  };

  const resourceCard = {
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  };

  const resourceCardHover = {
    ...resourceCard,
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
  };

  const resourceImage = {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  };

  const resourceContent = {
    padding: '16px'
  };

  const resourceCategory = {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '4px',
    marginBottom: '8px',
    textTransform: 'capitalize'
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Nutrition': { bg: '#e8f5e9', color: '#2e7d32' },
      'Psychology': { bg: '#f3e5f5', color: '#6a1b9a' },
      'Behavior': { bg: '#ede7f6', color: '#512da8' },
      'Sleep': { bg: '#e0f2f1', color: '#00796b' },
      'Language': { bg: '#fce4ec', color: '#c2185b' },
      'Safety': { bg: '#fff3e0', color: '#e65100' }
    };
    return colors[category] || { bg: '#f0f0f0', color: '#333' };
  };

  const resourceTitle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  };

  const resourceDescription = {
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px',
    lineHeight: '1.5'
  };

  const readMoreLink = {
    color: '#7b2cbf',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease'
  };

  const userProfile = {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '16px',
    marginTop: 'auto'
  };

  const profileInfo = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const profileAvatar = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#d8a5d8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px'
  };

  const profileText = {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500'
  };

  const profileRole = {
    fontSize: '12px',
    color: '#999'
  };

  const emptyState = {
    textAlign: 'center',
    padding: '60px 20px'
  };

  const emptyStateTitle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  };

  return (
    <div style={layout}>
      {/* Sidebar */}
      <div style={sidebar}>
        <div>
          <div
            style={navItem(activeNav === 'Dashboard')}
            onClick={() => navigateTo('/std_dashboard', 'Dashboard')}
          >
            📊 Dashboard
          </div>
          <div
            style={navItem(activeNav === 'My Children')}
            onClick={() => navigateTo('/children', 'My Children')}
          >
            👨‍👩‍👧‍👦 My Children
          </div>
          <div
            style={navItem(activeNav === 'Checklist')}
            onClick={() => navigateTo('/children', 'Checklist')}
          >
            ✓ Checklist
          </div>
          <div
            style={navItem(activeNav === 'E-Library')}
            onClick={() => navigateTo('/e-library', 'E-Library')}
          >
            📚 E-Library
          </div>
          <div
            style={navItem(activeNav === 'Activities')}
            onClick={() => navigateTo('/children', 'Activities')}
          >
            🎯 Activities
          </div>
        </div>

        {/* User Profile */}
        <div style={userProfile}>
          <div style={profileInfo}>
            <div style={profileAvatar}>
              {userInfo.first_name.charAt(0)}
              {userInfo.last_name.charAt(0)}
            </div>
            <div>
              <div style={profileText}>
                {userInfo.first_name} {userInfo.last_name}
              </div>
              <div style={profileRole}>{userInfo.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContent}>
        <div style={header}>
          <h1 style={headerTitle}>E-Library</h1>
          <p style={headerSubtitle}>Welcome back! Here's what's happening today.</p>
        </div>

        {/* Filter Section */}
        <div style={filterSection}>
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchBar}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={dropdown}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div style={resourcesGrid}>
            {filteredResources.map(resource => {
              const categoryColors = getCategoryColor(resource.category);
              return (
                <div key={resource.id} style={resourceCard}>
                  <img src={resource.image} alt={resource.title} style={resourceImage} />
                  <div style={resourceContent}>
                    <div
                      style={{
                        ...resourceCategory,
                        background: categoryColors.bg,
                        color: categoryColors.color
                      }}
                    >
                      {resource.category}
                    </div>
                    <h3 style={resourceTitle}>{resource.title}</h3>
                    <p style={resourceDescription}>{resource.description}</p>
                    <a href={resource.link} style={readMoreLink}>
                      Read More →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={emptyState}>
            <div style={emptyStateTitle}>No resources found</div>
            <p style={{ color: '#999' }}>Try adjusting your search or category filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ELibrary;
