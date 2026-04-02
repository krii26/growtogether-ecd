import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Activities = () => {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState('All Ages');
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });

  const activities = [
    {
      id: 1,
      age: 'Age 2-3',
      title: 'Story Time Circle',
      description: 'Read a short picture book and ask your child to point to familiar objects and animals.',
      duration: '20 min',
      domain: 'Language'
    },
    {
      id: 2,
      age: 'Age 2-3',
      title: 'Shape Hunt',
      description: 'Find circles, squares, and triangles around the house to build early recognition skills.',
      duration: '15 min',
      domain: 'Cognitive'
    },
    {
      id: 3,
      age: 'Age 2-3',
      title: 'Ball Roll and Catch',
      description: 'Sit facing each other and roll a soft ball back and forth to improve coordination.',
      duration: '15 min',
      domain: 'Physical'
    },
    {
      id: 4,
      age: 'Age 2-3',
      title: 'Finger Painting Fun',
      description: 'Use safe paints to make hand and finger prints while naming colors and shapes.',
      duration: '20 min',
      domain: 'Creative'
    },
    {
      id: 5,
      age: 'Age 2-3',
      title: 'Stack and Build',
      description: 'Stack cups or blocks and encourage your child to copy simple tower patterns.',
      duration: '15 min',
      domain: 'Fine Motor'
    },
    {
      id: 6,
      age: 'Age 3-4',
      title: 'Color Sorting Game',
      description: 'Help your child sort objects into matching colors to strengthen attention and logic.',
      duration: '15 min',
      domain: 'Cognitive'
    },
    {
      id: 7,
      age: 'Age 3-4',
      title: 'Playdough Creations',
      description: 'Encourage creativity and fine motor skills by shaping animals, fruits, and letters.',
      duration: '20 min',
      domain: 'Fine Motor'
    },
    {
      id: 8,
      age: 'Age 3-4',
      title: 'Action Song Time',
      description: 'Sing action songs with movements like clap, jump, and spin to build motor planning.',
      duration: '15 min',
      domain: 'Physical'
    },
    {
      id: 9,
      age: 'Age 3-4',
      title: 'Pretend Kitchen Play',
      description: 'Role-play cooking and serving to improve social interaction and expressive language.',
      duration: '25 min',
      domain: 'Social-Emotional'
    },
    {
      id: 10,
      age: 'Age 3-4',
      title: 'Puzzle Match',
      description: 'Solve simple 4-8 piece puzzles to develop visual memory and problem-solving skills.',
      duration: '20 min',
      domain: 'Cognitive'
    },
    {
      id: 11,
      age: 'Age 4-5',
      title: 'Obstacle Course',
      description: 'Create a fun indoor obstacle path with cushions and cones for balance and coordination.',
      duration: '30 min',
      domain: 'Physical'
    },
    {
      id: 12,
      age: 'Age 4-5',
      title: 'Music and Movement',
      description: 'Dance and sing with rhythm patterns to improve listening and body control.',
      duration: '15 min',
      domain: 'Creative'
    },
    {
      id: 13,
      age: 'Age 4-5',
      title: 'Rhyming Word Basket',
      description: 'Pick picture cards and find rhyming pairs to build phonological awareness.',
      duration: '20 min',
      domain: 'Language'
    },
    {
      id: 14,
      age: 'Age 4-5',
      title: 'Pattern Bead Stringing',
      description: 'Create repeating color patterns with beads to support sequencing and fine motor control.',
      duration: '20 min',
      domain: 'Fine Motor'
    },
    {
      id: 15,
      age: 'Age 4-5',
      title: 'Emotion Faces Game',
      description: 'Use mirror play to identify happy, sad, angry, and surprised expressions.',
      duration: '15 min',
      domain: 'Social-Emotional'
    },
    {
      id: 16,
      age: 'Age 5-6',
      title: 'Science Experiment',
      description: 'Try simple science activities like color mixing or sink-and-float with predictions.',
      duration: '25 min',
      domain: 'Science'
    },
    {
      id: 17,
      age: 'Age 5-6',
      title: 'Story Retell Challenge',
      description: 'After reading a short story, ask your child to retell beginning, middle, and end.',
      duration: '20 min',
      domain: 'Language'
    },
    {
      id: 18,
      age: 'Age 5-6',
      title: 'Number Hopscotch',
      description: 'Play hopscotch with number calls to strengthen counting and body coordination.',
      duration: '20 min',
      domain: 'Math + Physical'
    },
    {
      id: 19,
      age: 'Age 5-6',
      title: 'Team Cleanup Mission',
      description: 'Turn cleanup into a timed mission to build responsibility and teamwork habits.',
      duration: '15 min',
      domain: 'Social-Emotional'
    },
    {
      id: 20,
      age: 'Age 5-6',
      title: 'Build a Bridge',
      description: 'Use straws or blocks to build a bridge that can hold a toy, encouraging engineering thinking.',
      duration: '30 min',
      domain: 'Cognitive'
    }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo({
        first_name: user.first_name || 'John',
        last_name: user.last_name || 'Doe',
        role: user.role || 'Parent'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ages = ['All Ages', 'Age 2-3', 'Age 3-4', 'Age 4-5', 'Age 5-6'];
  const filteredActivities = selectedAge === 'All Ages'
    ? activities
    : activities.filter((a) => a.age === selectedAge);

  const layout = {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
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

  const navItem = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    color: active ? '#6a11cb' : '#666',
    background: active ? '#e8d5f2' : 'transparent',
    cursor: 'pointer',
    marginBottom: 8,
    fontSize: '15px',
    fontWeight: active ? 600 : 500,
    transition: 'all 0.2s'
  });

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

  const userInfo2 = { flex: 1 };

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
    padding: '32px',
    background: '#fff'
  };

  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  };

  const pageTitle = {
    fontSize: '26px',
    fontWeight: 700,
    color: '#333',
    margin: 0
  };

  const pageSubtitle = {
    fontSize: '14px',
    color: '#666',
    marginTop: 6
  };

  const notificationIcon = {
    position: 'relative',
    fontSize: '20px',
    cursor: 'pointer'
  };

  const notificationDot = {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    background: '#ef4444',
    borderRadius: '50%'
  };

  const toolbar = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  };

  const sectionTitle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#333',
    margin: 0
  };

  const sectionSubtitle = {
    fontSize: '13px',
    color: '#777',
    marginTop: 4
  };

  const dropdown = {
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '13px',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none'
  };

  const cardsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))',
    gap: '18px'
  };

  const card = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    padding: '18px',
    border: '1px solid #f3f4f6'
  };

  const cardHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  };

  const ageBadge = (age) => {
    const colors = {
      'Age 2-3': { bg: '#dbeafe', color: '#2563eb' },
      'Age 3-4': { bg: '#ede9fe', color: '#7c3aed' },
      'Age 4-5': { bg: '#dcfce7', color: '#16a34a' },
      'Age 5-6': { bg: '#fee2e2', color: '#dc2626' }
    };
    const c = colors[age] || { bg: '#f3f4f6', color: '#6b7280' };
    return {
      background: c.bg,
      color: c.color,
      fontSize: '12px',
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: '999px'
    };
  };

  const bookmark = {
    fontSize: '16px',
    color: '#9ca3af'
  };

  const cardTitle = {
    fontSize: '16px',
    fontWeight: 700,
    color: '#333',
    marginBottom: 6
  };

  const cardDesc = {
    fontSize: '13px',
    color: '#666',
    lineHeight: 1.5,
    marginBottom: 12
  };

  const metaRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: 14
  };

  const actionBtn = {
    width: '100%',
    padding: '10px',
    background: '#f3e8ff',
    color: '#6a11cb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  };

  return (
    <div style={layout}>
      <aside style={sidebar}>
        <div>
          <div style={navItem(false)} onClick={() => navigate('/std_dashboard')}>
            <span style={iconStyle}>🏠</span>
            Dashboard
          </div>
          <div style={navItem(false)} onClick={() => navigate('/children')}>
            <span style={iconStyle}>👶</span>
            My Children
          </div>
          <div style={navItem(false)} onClick={() => navigate('/milestones')}>
            <span style={iconStyle}>📋</span>
            Milestones
          </div>
          <div style={navItem(false)} onClick={() => navigate('/e-library')}>
            <span style={iconStyle}>📚</span>
            E-Library
          </div>
          <div style={navItem(true)}>
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
              <div style={userRole}>{userInfo.role}</div>
            </div>
            <div style={logoutIcon} onClick={handleLogout} title="Logout">
              ⎋
            </div>
          </div>
        </div>
      </aside>

      <main style={mainContent}>
        <div style={header}>
          <div>
            <h1 style={pageTitle}>Activity Suggestions</h1>
            <div style={pageSubtitle}>Welcome back! Here's what's happening today.</div>
          </div>
          <div style={notificationIcon}>
            🔔
            <span style={notificationDot}></span>
          </div>
        </div>

        <div style={toolbar}>
          <div>
            <div style={sectionTitle}>Activity Suggestions</div>
            <div style={sectionSubtitle}>Age-appropriate activities for your child's development</div>
          </div>
          <select
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
            style={dropdown}
          >
            {ages.map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        <div style={cardsGrid}>
          {filteredActivities.map((activity) => (
            <div key={activity.id} style={card}>
              <div style={cardHeader}>
                <span style={ageBadge(activity.age)}>{activity.age}</span>
                <span style={bookmark}>🔖</span>
              </div>
              <div style={cardTitle}>{activity.title}</div>
              <div style={cardDesc}>{activity.description}</div>
              <div style={metaRow}>
                <span>🕒 {activity.duration}</span>
                <span>• {activity.domain}</span>
              </div>
              <button style={actionBtn}>View Details</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Activities;
