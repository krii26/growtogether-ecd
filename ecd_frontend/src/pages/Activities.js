import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Activities = () => {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState('All Ages');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [sortTargets, setSortTargets] = useState({ red: 0, yellow: 0, blue: 0 });
  const [sortComplete, setSortComplete] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [mistakesOnCurrent, setMistakesOnCurrent] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('neutral');
  const [reactionEmoji, setReactionEmoji] = useState('');
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    role: ''
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colorSortingItems = [
    { id: 'apple', label: 'Apple', color: 'red', emoji: '🍎' },
    { id: 'cherry', label: 'Cherry', color: 'red', emoji: '🍒' },
    { id: 'sun', label: 'Sun', color: 'yellow', emoji: '☀️' },
    { id: 'banana', label: 'Banana', color: 'yellow', emoji: '🍌' },
    { id: 'fish', label: 'Fish', color: 'blue', emoji: '🐟' },
    { id: 'drop', label: 'Water Drop', color: 'blue', emoji: '💧' }
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

  // Fetch activities from the API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/activities/');
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        setActivities(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    if (!reactionEmoji) {
      return;
    }

    const timer = setTimeout(() => {
      setReactionEmoji('');
    }, 2000);

    return () => clearTimeout(timer);
  }, [reactionEmoji]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ages = ['All Ages', 'Age 2-3', 'Age 3-4', 'Age 4-5', 'Age 5-6'];

  const shuffleItems = (items) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const displayedActivities = useMemo(() => {
    if (selectedAge === 'All Ages') {
      return ages
        .filter((age) => age !== 'All Ages')
        .flatMap((age) => shuffleItems(activities.filter((activity) => activity.age === age)));
    }

    return shuffleItems(activities.filter((activity) => activity.age === selectedAge));
  }, [activities, selectedAge]);

  const openDetails = (activity) => {
    setSelectedActivity(activity);
    if (activity.title === 'Color Sorting Game') {
      setSortTargets({ red: 0, yellow: 0, blue: 0 });
      setSortComplete(false);
      setCurrentItemIndex(0);
      setGameScore(0);
      setMistakesOnCurrent(0);
      setFeedbackMessage('Sort the shown item into the correct color bucket.');
      setFeedbackTone('neutral');
      setReactionEmoji('');
    }
  };

  const closeDetails = () => {
    setSelectedActivity(null);
  };

  const handleSort = (color) => {
    if (!selectedActivity || selectedActivity.title !== 'Color Sorting Game') {
      return;
    }

    if (sortComplete) {
      return;
    }

    const currentItem = colorSortingItems[currentItemIndex];
    if (!currentItem) {
      return;
    }

    if (color !== currentItem.color) {
      setMistakesOnCurrent((prev) => prev + 1);
      setFeedbackMessage(`Oops! ${currentItem.label} does not go in ${color} bucket. Try again.`);
      setFeedbackTone('error');
      setReactionEmoji('😢');
      return;
    }

    const next = {
      ...sortTargets,
      [color]: sortTargets[color] + 1
    };
    setSortTargets(next);

    const earnedPoint = mistakesOnCurrent === 0 ? 1 : 0;
    const nextScore = gameScore + earnedPoint;
    const nextIndex = currentItemIndex + 1;

    setGameScore(nextScore);
    setCurrentItemIndex(nextIndex);
    setMistakesOnCurrent(0);

    if (earnedPoint === 1) {
      setFeedbackMessage(`Great! ${currentItem.label} sorted correctly on first try.`);
      setFeedbackTone('success');
      setReactionEmoji('😄');
    } else {
      setFeedbackMessage(`Correct now. ${currentItem.label} is sorted, but this one gets 0 point because of earlier mistake.`);
      setFeedbackTone('warning');
      setReactionEmoji('😄');
    }

    if (nextIndex === colorSortingItems.length) {
      setSortComplete(true);
    }
  };

  const totalSorted = currentItemIndex;
  const remainingItems = colorSortingItems.slice(currentItemIndex + 1);
  const currentSortItem = colorSortingItems[currentItemIndex] || null;

  const getPerformanceLabel = (score) => {
    if (score === 6) {
      return 'Outstanding';
    }
    if (score === 5) {
      return 'Excellent';
    }
    if (score === 4) {
      return 'Good';
    }
    return 'Need more practice';
  };

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

  const modalOverlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 24, 39, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalCard = {
    width: '80vw',
    maxWidth: '1200px',
    minHeight: '80vh',
    maxHeight: '80vh',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
    border: '1px solid #e5e7eb',
    overflow: 'auto'
  };

  const modalHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    borderBottom: '1px solid #eef2f7',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)'
  };

  const closeBtn = {
    border: 'none',
    background: '#ffffff',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '34px',
    height: '34px',
    fontSize: '18px',
    color: '#6b7280'
  };

  const modalBody = {
    padding: '20px 22px 24px'
  };

  const gameGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
    gap: '16px',
    marginTop: '14px'
  };

  const bucketWrap = {
    minHeight: '210px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start'
  };

  const bucketTop = {
    width: '90%',
    height: '26px',
    borderRadius: '999px',
    border: '2px solid rgba(0,0,0,0.08)',
    marginBottom: '-8px',
    zIndex: 2,
    boxShadow: 'inset 0 -4px 8px rgba(255,255,255,0.5)'
  };

  const bucketBody = {
    width: '86%',
    minHeight: '140px',
    border: '2px solid rgba(0,0,0,0.1)',
    borderRadius: '14px 14px 22px 22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 12px 14px',
    boxSizing: 'border-box',
    boxShadow: '0 8px 14px rgba(15, 23, 42, 0.12)'
  };

  const bucketCount = {
    marginTop: '6px',
    fontSize: '14px',
    fontWeight: 600
  };

  const currentItemCard = {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    minHeight: '170px',
    borderRadius: '20px',
    border: '2px dashed #cbd5e1',
    background: '#f8fafc',
    boxShadow: 'inset 0 0 0 1px #ffffff'
  };

  const currentItemEmoji = {
    fontSize: '82px',
    lineHeight: 1
  };

  const currentItemLabel = {
    marginTop: '8px',
    fontSize: '28px',
    fontWeight: 600,
    color: '#1f2937'
  };

  const feedbackBox = {
    marginTop: '12px',
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '15px',
    fontWeight: 600
  };

  const gameBtn = {
    marginTop: '10px',
    width: '90%',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '22px',
    color: '#111827',
    background: '#f3f4f6',
    boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
  };

  const remainingRow = {
    marginTop: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
    gap: '14px'
  };

  const itemChip = {
    borderRadius: '18px',
    minHeight: '130px',
    padding: '14px 16px',
    fontSize: '54px',
    fontWeight: 500,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#111827',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    lineHeight: 1,
    boxShadow: '0 3px 10px rgba(15, 23, 42, 0.08)'
  };

  const itemLabel = {
    fontSize: '28px',
    fontWeight: 600,
    color: '#374151'
  };

  const progressText = {
    marginTop: '10px',
    fontSize: '18px',
    color: '#374151',
    fontWeight: 600
  };

  const queueTitle = {
    marginTop: '12px',
    marginBottom: '8px',
    fontSize: '15px',
    color: '#4b5563',
    fontWeight: 600
  };

  const doneBanner = {
    marginTop: '14px',
    borderRadius: '10px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '10px 12px',
    fontWeight: 600,
    fontSize: '14px'
  };

  const reactionOverlay = {
    position: 'fixed',
    inset: 0,
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.15)',
    pointerEvents: 'none'
  };

  const reactionEmojiStyle = {
    fontSize: '50vmin',
    lineHeight: 1,
    textShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
    animation: 'popIn 0.25s ease-out'
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
                    {loading && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>Loading activities...</div>}
                    {error && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#dc2626' }}>Error loading activities: {error}</div>}
                    {!loading && displayedActivities.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>No activities found</div>}
          {displayedActivities.map((activity) => (
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
              <button style={actionBtn} onClick={() => openDetails(activity)}>View Details</button>
            </div>
          ))}
        </div>
      </main>

      {selectedActivity && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={modalHeader}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                  {selectedActivity.title}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>
                  {selectedActivity.age} • {selectedActivity.duration} • {selectedActivity.domain}
                </div>
              </div>
              <button style={closeBtn} onClick={closeDetails} aria-label="Close details">✕</button>
            </div>

            <div style={modalBody}>
              <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
                {selectedActivity.description}
              </div>

              {selectedActivity.title === 'Color Sorting Game' ? (
                <>
                  <div style={{ marginTop: '14px', fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
                    Playable Game: sort each shown item into the correct bucket.
                  </div>

                  {!sortComplete && currentSortItem && (
                    <div style={currentItemCard}>
                      <div style={{ fontSize: '15px', color: '#475569', fontWeight: 600 }}>Sort This Item</div>
                      <div style={currentItemEmoji}>{currentSortItem.emoji}</div>
                      <div style={currentItemLabel}>{currentSortItem.label}</div>
                    </div>
                  )}

                  <div style={gameGrid}>
                    <div style={bucketWrap}>
                      <div style={{ ...bucketTop, background: '#fecaca' }}></div>
                        <div style={{ ...bucketBody, background: 'linear-gradient(180deg, #fecaca 0%, #fda4af 100%)' }}>
                        <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '18px' }}>Red Bucket</div>
                        <div style={{ ...bucketCount, color: '#7f1d1d' }}>
                          {sortTargets.red}/2
                        </div>
                      </div>
                      <button style={{ ...gameBtn, background: '#fecaca' }} onClick={() => handleSort('red')}>
                        👉 🔴
                      </button>
                    </div>

                    <div style={bucketWrap}>
                      <div style={{ ...bucketTop, background: '#fde68a' }}></div>
                        <div style={{ ...bucketBody, background: 'linear-gradient(180deg, #fde68a 0%, #facc15 100%)' }}>
                        <div style={{ fontWeight: 600, color: '#854d0e', fontSize: '18px' }}>Yellow Bucket</div>
                        <div style={{ ...bucketCount, color: '#854d0e' }}>
                          {sortTargets.yellow}/2
                        </div>
                      </div>
                      <button style={{ ...gameBtn, background: '#fef08a' }} onClick={() => handleSort('yellow')}>
                        👉 🟡
                      </button>
                    </div>

                    <div style={bucketWrap}>
                      <div style={{ ...bucketTop, background: '#bfdbfe' }}></div>
                        <div style={{ ...bucketBody, background: 'linear-gradient(180deg, #bfdbfe 0%, #60a5fa 100%)' }}>
                        <div style={{ fontWeight: 600, color: '#1d4ed8', fontSize: '18px' }}>Blue Bucket</div>
                        <div style={{ ...bucketCount, color: '#1e3a8a' }}>
                          {sortTargets.blue}/2
                        </div>
                      </div>
                      <button style={{ ...gameBtn, background: '#bfdbfe' }} onClick={() => handleSort('blue')}>
                        👉 🔵
                      </button>
                    </div>
                  </div>

                  <div style={progressText}>
                    Progress: {totalSorted}/{colorSortingItems.length} items sorted | Score: {gameScore}/{colorSortingItems.length}
                  </div>

                  <div
                    style={{
                      ...feedbackBox,
                      background:
                        feedbackTone === 'success'
                          ? '#ecfdf5'
                          : feedbackTone === 'error'
                            ? '#fef2f2'
                            : feedbackTone === 'warning'
                              ? '#fff7ed'
                              : '#f8fafc',
                      color:
                        feedbackTone === 'success'
                          ? '#065f46'
                          : feedbackTone === 'error'
                            ? '#991b1b'
                            : feedbackTone === 'warning'
                              ? '#9a3412'
                              : '#334155',
                      border:
                        feedbackTone === 'success'
                          ? '1px solid #86efac'
                          : feedbackTone === 'error'
                            ? '1px solid #fca5a5'
                            : feedbackTone === 'warning'
                              ? '1px solid #fdba74'
                              : '1px solid #cbd5e1'
                    }}
                  >
                    {feedbackMessage}
                  </div>

                  {!sortComplete && remainingItems.length > 0 && (
                    <>
                      <div style={queueTitle}>Next Items</div>
                      <div style={remainingRow}>
                      {remainingItems.map((item) => (
                        <span key={item.id} style={itemChip}>
                          <span>{item.emoji}</span>
                          <span style={itemLabel}>{item.label}</span>
                        </span>
                      ))}
                      </div>
                    </>
                  )}

                  {sortComplete && (
                    <div style={doneBanner}>
                      Final Score: {gameScore}/6 - {getPerformanceLabel(gameScore)}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ marginTop: '14px', fontSize: '14px', color: '#6b7280' }}>
                  Mini-game coming soon for this activity.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reactionEmoji && (
        <div style={reactionOverlay}>
          <div style={reactionEmojiStyle}>{reactionEmoji}</div>
        </div>
      )}

      <style>
        {`@keyframes popIn {
          from { transform: scale(0.65); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }`}
      </style>
    </div>
  );
};

export default Activities;
