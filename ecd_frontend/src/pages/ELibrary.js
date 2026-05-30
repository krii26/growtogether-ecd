import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import ParentSidebar from '../components/ParentSidebar';

const isTeacherRole = (role) => {
  const normalized = (role || '').toString().trim().toLowerCase();
  return normalized === 'teacher';
};

const isAdminRole = (role) => {
  const normalized = (role || '').toString().trim().toLowerCase();
  return normalized === 'admin' || normalized === 'super_admin';
};

const ELibrary = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });

  const categories = [
    'All Categories',
    'Nutrition',
    'Psychology',
    'Behavior',
    'Sleep',
    'Language',
    'Safety'
  ];

  const fallbackImages = [
    'https://images.unsplash.com/photo-1491013516836-7db643ee1254?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541696454087-5c2d5d0d6c3c?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=900&q=80&auto=format&fit=crop'
  ];

  const hashString = (value) => {
    const text = (value || '').toString();
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }
    return hash;
  };

  const getFallbackImage = (resource) => {
    const seed = `${resource?.category || ''}-${resource?.title || ''}`;
    return fallbackImages[hashString(seed) % fallbackImages.length];
  };

  const getCanonicalContentUrl = (resource) => {
    const title = (resource?.title || '').toLowerCase();

    if (title.includes('social-emotional milestone support guide')) {
      return 'https://www.virtuallabschool.org/infant-toddler/social-and-emotional-development/lesson-2';
    }
    if (title.includes('executive function milestone support guide')) {
      return 'https://developingchild.harvard.edu/resource-guides/guide-executive-function/';
    }
    if (title.includes('language milestone support guide')) {
      return 'https://www.asha.org/public/developmental-milestones/communication-milestones/';
    }
    if (title.includes('cognitive milestone support guide')) {
      return 'https://www.cdc.gov/act-early/milestones/index.html';
    }
    if (title.includes('self-care milestone support guide')) {
      return 'https://www.zerotothree.org/resource/supporting-early-development-one-milestone-at-a-time/';
    }
    if (title.includes('physical milestone support guide')) {
      return 'https://www.healthychildren.org/English/family-life/health-management/Pages/Milestones-Matter.aspx';
    }
    if (title.includes('understanding child anxiety')) {
      return 'https://childmind.org/topics/anxiety/';
    }
    if (title.includes('encouraging positive behavior')) {
      return 'https://www.cdc.gov/parents/essentials/toddlersandpreschoolers/positive/index.html';
    }
    if (title.includes('bilingual development in young children')) {
      return 'https://www.asha.org/public/developmental-milestones/communication-milestones/';
    }
    if (title.includes('building resilience in young children')) {
      return 'https://www.apa.org/topics/resilience/children';
    }
    if (title.includes('reading aloud to young children')) {
      return 'https://www.readingrockets.org/topics/reading-aloud';
    }

    return null;
  };

  const getContentUrl = (resource) => {
    const canonical = getCanonicalContentUrl(resource);
    if (canonical) {
      return canonical;
    }

    const preferred = (resource?.link || '').trim();
    if (preferred && preferred !== '#') {
      return preferred;
    }

    const query = encodeURIComponent(`${resource?.title || 'child development resource'} ${resource?.category || ''}`.trim());
    return `https://www.google.com/search?q=${query}`;
  };

  const mockResources = [
    {
      id: 1,
      title: 'Healthy Eating for Toddlers',
      category: 'Nutrition',
      description: 'Essential nutrition guidelines and meal planning tips for children aged 1-3 years.',
      image: 'https://res.cloudinary.com/ddcmtilho/image/upload/v1779921990/growtogether/frontend_assets/healthyeating.jpg',
      link: 'https://www.healthychildren.org/English/ages-stages/toddler/nutrition/Pages/default.aspx',
      source: 'HealthyChildren.org (AAP)',
      sourceUrl: 'https://www.healthychildren.org'
    },
    {
      id: 2,
      title: 'Emotional Development Stages',
      category: 'Psychology',
      description: "Understanding your child's emotional growth and how to support it effectively.",
      image: 'https://res.cloudinary.com/ddcmtilho/image/upload/v1779921991/growtogether/frontend_assets/social-emotional.jpg',
      link: 'https://www.virtuallabschool.org/infant-toddler/social-and-emotional-development/lesson-2',
      source: 'Virtual Lab School',
      sourceUrl: 'https://www.virtuallabschool.org'
    },
    {
      id: 3,
      title: 'Managing Tantrums Effectively',
      category: 'Behavior',
      description: 'Practical strategies for handling challenging behaviors in young children.',
      image: 'https://res.cloudinary.com/ddcmtilho/image/upload/v1779921992/growtogether/frontend_assets/traumakid.jpg',
      link: 'https://developingchild.harvard.edu/resource-guides/guide-executive-function/',
      source: 'Harvard Center on Developing Child',
      sourceUrl: 'https://developingchild.harvard.edu'
    },
    {
      id: 4,
      title: 'Healthy Sleep Habits',
      category: 'Sleep',
      description: 'Creating bedtime routines and ensuring quality sleep for optimal development.',
      image: 'https://res.cloudinary.com/ddcmtilho/image/upload/v1779921992/growtogether/frontend_assets/healthySleep.webp',
      link: 'https://www.asha.org/public/developmental-milestones/communication-milestones/',
      source: 'ASHA',
      sourceUrl: 'https://www.asha.org'
    },
    {
      id: 5,
      title: 'Language Development Milestones',
      category: 'Language',
      description: 'Supporting your child\'s communication skills from birth to age 6.',
      image: 'https://res.cloudinary.com/ddcmtilho/image/upload/v1779921994/growtogether/frontend_assets/languageDev.png',
      link: 'https://www.asha.org/public/developmental-milestones/communication-milestones/',
      source: 'ASHA',
      sourceUrl: 'https://www.asha.org'
    },
    {
      id: 6,
      title: 'Child Safety Essentials',
      category: 'Safety',
      description: 'Comprehensive guide to keeping your child safe at home and outdoors.',
      image: 'https://res.cloudinary.com/ddcmtilho/image/upload/v1779921995/growtogether/frontend_assets/safety.jpg',
      link: 'https://www.cdc.gov/act-early/milestones/index.html',
      source: 'CDC',
      sourceUrl: 'https://www.cdc.gov'
    },
    {
      id: 7,
      title: 'Understanding Child Anxiety',
      category: 'Psychology',
      description: 'How to recognize signs of anxiety in young children and practical ways to support their emotional well-being at home and in school.',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80&auto=format&fit=crop',
      link: 'https://childmind.org/topics/anxiety/',
      source: 'Child Mind Institute',
      sourceUrl: 'https://childmind.org'
    },
    {
      id: 8,
      title: 'Encouraging Positive Behavior',
      category: 'Behavior',
      description: 'Evidence-based techniques for reinforcing good behavior and reducing challenging conduct in early childhood.',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.cdc.gov/parents/essentials/toddlersandpreschoolers/positive/index.html',
      source: 'CDC',
      sourceUrl: 'https://www.cdc.gov'
    },
    {
      id: 9,
      title: 'Iron & Calcium for Growing Kids',
      category: 'Nutrition',
      description: 'Why iron and calcium are critical for brain development and bone growth, with food sources and meal ideas for toddlers.',
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.healthychildren.org/English/ages-stages/toddler/nutrition/Pages/Selecting-Snacks-for-Toddlers.aspx',
      source: 'HealthyChildren.org (AAP)',
      sourceUrl: 'https://www.healthychildren.org'
    },
    {
      id: 10,
      title: 'Screen Time Guidelines for Under 5s',
      category: 'Behavior',
      description: 'WHO and AAP recommendations on healthy screen time limits and how to manage digital exposure in the early years.',
      image: 'https://images.unsplash.com/photo-1536337005238-94b997371b40?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more',
      source: 'World Health Organization',
      sourceUrl: 'https://www.who.int'
    },
    {
      id: 11,
      title: 'Sleep and Brain Development',
      category: 'Sleep',
      description: 'How quality sleep during the first 5 years directly impacts memory, learning, emotional regulation and physical growth.',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.sleepfoundation.org/children-and-sleep',
      source: 'Sleep Foundation',
      sourceUrl: 'https://www.sleepfoundation.org'
    },
    {
      id: 12,
      title: 'Bilingual Development in Young Children',
      category: 'Language',
      description: 'What research says about raising bilingual children, common myths debunked, and strategies to support dual language growth.',
      image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.asha.org/public/developmental-milestones/communication-milestones/',
      source: 'ASHA',
      sourceUrl: 'https://www.asha.org'
    },
    {
      id: 13,
      title: 'Home Safety for Toddlers',
      category: 'Safety',
      description: 'Room-by-room safety checklist for parents of toddlers — covering kitchens, bathrooms, stairs, and outdoor spaces.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.healthychildren.org/English/safety-prevention/at-home/Pages/default.aspx',
      source: 'HealthyChildren.org (AAP)',
      sourceUrl: 'https://www.healthychildren.org'
    },
    {
      id: 14,
      title: 'Building Resilience in Young Children',
      category: 'Psychology',
      description: 'Practical strategies parents and teachers can use to help children bounce back from setbacks, stress, and change.',
      image: 'https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.apa.org/topics/resilience/children',
      source: 'American Psychological Association',
      sourceUrl: 'https://www.apa.org'
    },
    {
      id: 15,
      title: 'Introducing Solids and Food Allergies',
      category: 'Nutrition',
      description: 'When and how to introduce solid foods safely, spotting allergic reactions, and foods to avoid in the first two years.',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.nhs.uk/conditions/baby/weaning-and-feeding/what-to-feed-young-children/',
      source: 'NHS',
      sourceUrl: 'https://www.nhs.uk'
    },
    {
      id: 16,
      title: 'Reading Aloud to Young Children',
      category: 'Language',
      description: 'Research-backed benefits of reading together daily and tips for making story time engaging from birth to age 5.',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80&auto=format&fit=crop',
      link: 'https://www.readingrockets.org/topics/reading-aloud',
      source: 'Reading Rockets',
      sourceUrl: 'https://www.readingrockets.org'
    },
  ];

  useEffect(() => {
    loadUserInfo();
    fetchResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matchesResourceFilter = (resource) => {
    const normalize = (value) => (value || '').toString().trim().toLowerCase();
    const normalizedCategory = normalize(selectedCategory);
    const normalizedQuery = normalize(searchQuery);
    const queryTerms = normalizedQuery.split(/[^a-z0-9]+/i).filter(Boolean);

    const resourceCategory = normalize(resource?.category);
    const categoryMatch = normalizedCategory === 'all categories' || resourceCategory === normalizedCategory;

    if (!categoryMatch) {
      return false;
    }

    if (queryTerms.length === 0) {
      return true;
    }

    const searchableText = [
      resource?.title,
      resource?.description,
      resource?.category,
      resource?.source,
      resource?.sourceUrl,
      resource?.link,
      getCanonicalContentUrl(resource),
    ]
      .map(normalize)
      .join(' ');

    return queryTerms.every((term) => searchableText.includes(term));
  };

  const filteredResources = (resources || []).filter(matchesResourceFilter);

  const loadUserInfo = () => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo({
        first_name: user.first_name || 'John',
        last_name: user.last_name || 'Doe',
        role: user.role || 'Parent'
      });
    }
  };

  const fetchResources = async () => {
    try {
      const response = await API.get('elibrary/', { skipCache: true });
      let apiResources = response.data;

      // Map API response to match frontend format
      apiResources = apiResources.map(resource => ({
        ...resource,
        image: resource.image || resource.image_file || getFallbackImage(resource),
        link: resource.file_url || resource.sourceUrl || '#',
        source: resource.source || (resource.file_url ? 'Uploaded resource' : 'GrowTogether Library'),
        sourceUrl: resource.sourceUrl || resource.file_url || '#',
      }));

      // Merge: API-only resources are included, but built-in mock resources
      // always take priority to preserve correct category/image data.
      const uniqueByTitle = new Map();
      apiResources.forEach((resource) => {
        uniqueByTitle.set((resource.title || '').trim().toLowerCase(), resource);
      });
      mockResources.forEach((resource) => {
        uniqueByTitle.set((resource.title || '').trim().toLowerCase(), resource);
      });

      const dataToUse = Array.from(uniqueByTitle.values());
      setResources(dataToUse);
    } catch (error) {
      console.error('Error fetching E-Library resources:', error);
      // Fallback to built-in resources if API fails
      setResources(mockResources.map((resource) => ({
        ...resource,
        image: resource.image || getFallbackImage(resource),
      })));
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const teacherView = isTeacherRole(userInfo.role);
  const adminView = isAdminRole(userInfo.role);
  const staffView = teacherView || adminView;
  const initials = `${userInfo.first_name?.[0] || 'J'}${userInfo.last_name?.[0] || 'D'}`.toUpperCase();

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

  const getSourceLabel = (resource) => {
    if (resource?.source) return resource.source;
    if (resource?.sourceUrl) {
      try {
        return new URL(resource.sourceUrl).hostname.replace(/^www\./, '');
      } catch (_) {
        return 'External Source';
      }
    }
    if (resource?.link && resource.link !== '#') {
      try {
        return new URL(resource.link).hostname.replace(/^www\./, '');
      } catch (_) {
        return 'External Source';
      }
    }
    return 'GrowTogether Library';
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

  const teacherSidebar = {
    background: '#fff',
    borderRight: '1px solid #e5e7eb',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    height: '100vh'
  };

  const teacherLogoSection = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    marginBottom: 32
  };

  const teacherLogoIcon = {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '20px'
  };

  const teacherLogoText = { fontWeight: 700, fontSize: 18, color: '#111827' };

  const teacherNavItem = (active = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    color: active ? '#7c3aed' : '#374151',
    background: active ? '#f3e8ff' : 'transparent',
    fontWeight: active ? 700 : 500,
    transition: 'all 0.2s ease'
  });

  const teacherIconStyle = { width: 20, textAlign: 'center' };

  const teacherUserSection = {
    borderTop: '1px solid #e5e7eb',
    paddingTop: 16,
    marginTop: 'auto'
  };

  const teacherUserProfile = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#f9fafb',
    borderRadius: 12
  };

  const teacherUserAvatar = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700
  };

  const teacherUserName = { fontWeight: 600, color: '#111827' };
  const teacherUserRole = { fontSize: 12, color: '#6b7280' };
  const teacherLogoutIcon = {
    marginLeft: 'auto',
    cursor: 'pointer',
    color: '#9ca3af',
    fontSize: 16
  };

  const dashboardPath = adminView ? '/admin_dashboard' : '/teacher_dashboard';
  const dashboardLabel = adminView ? 'Admin Dashboard' : 'Dashboard';

  return (
    <div style={layout}>
      {staffView ? (
        <aside style={teacherSidebar}>
          <div>
            <div style={teacherLogoSection}>
              <div style={teacherLogoIcon}>👶</div>
              <div style={teacherLogoText}>GrowTogether</div>
            </div>

            <div style={teacherNavItem()} onClick={() => navigate(dashboardPath)}>
              <span style={teacherIconStyle}>🏠</span>
              {dashboardLabel}
            </div>
            {!adminView && (
              <>
                <div style={teacherNavItem()} onClick={() => navigate('/students')}>
                  <span style={teacherIconStyle}>👥</span>
                  Students
                </div>
                <div style={teacherNavItem(true)}>
                  <span style={teacherIconStyle}>📚</span>
                  E-Library
                </div>
                <div style={teacherNavItem()} onClick={() => navigate('/publish-results')}>
                  <span style={teacherIconStyle}>📊</span>
                  Publish Results
                </div>
                <div style={teacherNavItem()} onClick={() => navigate('/chat')}>
                  <span style={teacherIconStyle}>💬</span>
                  Chat Room
                </div>
              </>
            )}
            {adminView && (
              <div style={teacherNavItem(true)}>
                <span style={teacherIconStyle}>📚</span>
                E-Library
              </div>
            )}
          </div>

          <div style={teacherUserSection}>
            <div style={teacherUserProfile}>
              <div style={teacherUserAvatar}>{initials}</div>
              <div>
                <div style={teacherUserName}>{userInfo.first_name} {userInfo.last_name}</div>
                <div style={teacherUserRole}>{userInfo.role || (adminView ? 'Admin' : 'Teacher')}</div>
              </div>
              <div style={teacherLogoutIcon} onClick={handleLogout}>↗</div>
            </div>
          </div>
        </aside>
      ) : (
        <ParentSidebar activeKey="elibrary" userInfo={userInfo} onLogout={handleLogout} />
      )}

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
            placeholder="Search by title, description, category, or source..."
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

        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Showing {filteredResources.length} result{filteredResources.length === 1 ? '' : 's'}
          {searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ''}
          {selectedCategory !== 'All Categories' ? ` in ${selectedCategory}` : ''}
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div style={resourcesGrid}>
            {resources.map(resource => {
              if (!matchesResourceFilter(resource)) {
                return null;
              }
              const categoryColors = getCategoryColor(resource.category);
              return (
                <div key={`${resource.id}-${resource.title}`} style={resourceCard}>
                  <img
                    src={resource.image || getFallbackImage(resource)}
                    alt={resource.title}
                    style={resourceImage}
                    onError={(event) => {
                      event.currentTarget.src = getFallbackImage(resource);
                    }}
                  />
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
                    <div style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, color: '#aaa' }}>🔗</span>
                      <span style={{ fontSize: 13, color: '#555' }}>
                        <span style={{ fontWeight: 600 }}>Source: </span>
                        {resource.sourceUrl && resource.sourceUrl !== '#' ? (
                          <a
                            href={resource.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#7b2cbf', textDecoration: 'none', fontWeight: 500 }}
                          >
                            {getSourceLabel(resource)}
                          </a>
                        ) : (
                          <span style={{ color: '#7b2cbf', fontWeight: 500 }}>
                            {getSourceLabel(resource)}
                          </span>
                        )}
                      </span>
                    </div>
                    <a href={getContentUrl(resource)} target="_blank" rel="noopener noreferrer" style={readMoreLink}>
                      Read More
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
