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
  const [stackMode, setStackMode] = useState('easy');
  const [stackStep, setStackStep] = useState(0);
  const [stackStars, setStackStars] = useState(0);
  const [stackMood, setStackMood] = useState('');
  const [stackShowConfetti, setStackShowConfetti] = useState(false);
  const [ballMode, setBallMode] = useState('easy');
  const [ballRound, setBallRound] = useState(0);
  const [ballCatches, setBallCatches] = useState(0);
  const [ballDrops, setBallDrops] = useState(0);
  const [ballMood, setBallMood] = useState('');
  const [ballShowConfetti, setBallShowConfetti] = useState(false);
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

  const fingerPaintingPlan = {
    theme: 'Rainbow Garden',
    materials: ['Washable finger paints', 'Large sheet of paper', 'Apron or old shirt', 'Wipes or water for cleanup'],
    steps: [
      'Help your child choose 3 to 4 paint colors.',
      'Press handprints on the paper to make flowers, trees, or butterflies.',
      'Add fingerprints for petals, raindrops, ladybugs, or balloon dots.',
      'Talk during painting by naming colors, counting prints, and pointing out circles, lines, and dots.'
    ],
    skills: ['Creativity', 'Fine motor control', 'Color recognition', 'Shape recognition', 'Language development']
  };

  const stackAndBuildPlans = {
    easy: {
      label: 'Easy',
      targetStacks: 3,
      pattern: ['Big', 'Small', 'Big'],
      badge: 'First Tower',
      coaching: 'Try saying: big block first, small block second, now copy me.'
    },
    medium: {
      label: 'Medium',
      targetStacks: 5,
      pattern: ['Red', 'Blue', 'Red', 'Blue'],
      badge: 'Pattern Builder',
      coaching: 'Encourage taking turns: your turn, my turn, then repeat the colors.'
    },
    challenge: {
      label: 'Challenge',
      targetStacks: 6,
      pattern: ['Yellow', 'Green', 'Blue', 'Yellow'],
      badge: 'Steady Hands Pro',
      coaching: 'Show the pattern once, hide it, and ask your child to rebuild from memory.'
    }
  };

  const ballRollPlans = {
    easy: {
      label: 'Easy',
      rounds: 6,
      distance: 'Short distance (about 1 meter)',
      coaching: 'Use two hands and roll slowly. Celebrate every successful catch.',
      badge: 'Gentle Roller'
    },
    medium: {
      label: 'Medium',
      rounds: 10,
      distance: 'Medium distance (about 1.5 meters)',
      coaching: 'Ask your child to watch the ball and clap once after each catch.',
      badge: 'Steady Catcher'
    },
    challenge: {
      label: 'Challenge',
      rounds: 12,
      distance: 'Longer distance (about 2 meters)',
      coaching: 'Alternate fast and slow rolls so your child reacts and adjusts body movement.',
      badge: 'Coordination Star'
    }
  };


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

  useEffect(() => {
    if (!stackShowConfetti) {
      return;
    }

    const timer = setTimeout(() => {
      setStackShowConfetti(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [stackShowConfetti]);

  useEffect(() => {
    if (!ballShowConfetti) {
      return;
    }

    const timer = setTimeout(() => {
      setBallShowConfetti(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [ballShowConfetti]);

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
    if (activity.title === 'Stack and Build') {
      setStackMode('easy');
      setStackStep(0);
      setStackMood('');
      setStackShowConfetti(false);
    }
    if (activity.title === 'Ball Roll and Catch') {
      setBallMode('easy');
      setBallRound(0);
      setBallCatches(0);
      setBallDrops(0);
      setBallMood('');
      setBallShowConfetti(false);
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

  const completeStackStep = () => {
    setStackStep((prev) => {
      const next = Math.min(prev + 1, 3);
      if (next === 3 && prev < 3) {
        setStackStars((current) => current + 1);
        setStackShowConfetti(true);
      }
      return next;
    });
  };

  const resetStackMission = () => {
    setStackStep(0);
    setStackMood('');
    setStackShowConfetti(false);
  };

  const markBallRound = (caught) => {
    const plan = ballRollPlans[ballMode];

    if (ballRound >= plan.rounds) {
      return;
    }

    setBallRound((prev) => {
      const next = Math.min(prev + 1, plan.rounds);
      if (next === plan.rounds && prev < plan.rounds) {
        setBallShowConfetti(true);
      }
      return next;
    });

    if (caught) {
      setBallCatches((prev) => prev + 1);
    } else {
      setBallDrops((prev) => prev + 1);
    }
  };

  const resetBallSession = () => {
    setBallRound(0);
    setBallCatches(0);
    setBallDrops(0);
    setBallMood('');
    setBallShowConfetti(false);
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

  const stackPlan = stackAndBuildPlans[stackMode];
  const stackSteps = [
    `Build a ${stackPlan.targetStacks}-block tower`,
    `Copy pattern: ${stackPlan.pattern.join(' - ')}`,
    'Celebrate with claps and name the colors used'
  ];
  const stackProgress = Math.round((stackStep / stackSteps.length) * 100);
  const ballPlan = ballRollPlans[ballMode];
  const ballAccuracy = ballRound > 0 ? Math.round((ballCatches / ballRound) * 100) : 0;
  const ballDone = ballRound >= ballPlan.rounds;

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
              ) : selectedActivity.title === 'Stack and Build' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)', border: '1px solid #7dd3fc' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#075985' }}>
                      Mini Mission: Stack and Build
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#0c4a6e', lineHeight: 1.6 }}>
                      Complete 3 playful steps. Your child earns a badge when all steps are done.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(stackAndBuildPlans).map(([key, plan]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setStackMode(key);
                          resetStackMission();
                        }}
                        style={{
                          border: key === stackMode ? '2px solid #0369a1' : '1px solid #cbd5e1',
                          background: key === stackMode ? '#e0f2fe' : '#ffffff',
                          color: '#0f172a',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {plan.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Mission Progress</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{stackStep}/{stackSteps.length}</div>
                    </div>
                    <div style={{ height: '10px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${stackProgress}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8 0%, #22d3ee 100%)' }}></div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                    {stackSteps.map((stepLabel, index) => {
                      const done = index < stackStep;
                      const current = index === stackStep;
                      return (
                        <div
                          key={stepLabel}
                          style={{
                            borderRadius: '12px',
                            border: done ? '1px solid #86efac' : current ? '1px solid #38bdf8' : '1px solid #e5e7eb',
                            background: done ? '#f0fdf4' : current ? '#ecfeff' : '#ffffff',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{ width: '24px', height: '24px', borderRadius: '999px', background: done ? '#16a34a' : current ? '#0891b2' : '#cbd5e1', color: '#fff', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {done ? '✓' : index + 1}
                          </div>
                          <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: current ? 700 : 500 }}>{stepLabel}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={completeStackStep}
                      disabled={stackStep >= stackSteps.length}
                      style={{
                        border: 'none',
                        background: stackStep >= stackSteps.length ? '#94a3b8' : '#0284c7',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: stackStep >= stackSteps.length ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Mark Step Complete
                    </button>
                    <button
                      onClick={resetStackMission}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Start Over
                    </button>
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fdba74' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>Parent Coaching Tip</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#7c2d12', lineHeight: 1.6 }}>
                      {stackPlan.coaching}
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fde047' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#854d0e' }}>How did your child feel?</div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Happy', 'Excited', 'Frustrated'].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setStackMood(mood)}
                          style={{
                            border: mood === stackMood ? '2px solid #f59e0b' : '1px solid #fcd34d',
                            background: mood === stackMood ? '#fef3c7' : '#fffbeb',
                            color: '#78350f',
                            borderRadius: '999px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {stackStep >= stackSteps.length && (
                    <div style={{ marginTop: '14px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '12px', fontWeight: 700, fontSize: '13px' }}>
                      Badge Unlocked: {stackPlan.badge} | Stars Earned: {stackStars}
                    </div>
                  )}
                </>
              ) : selectedActivity.title === 'Ball Roll and Catch' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #ecfccb 0%, #dcfce7 100%)', border: '1px solid #86efac' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#166534' }}>
                      Play Plan: Ball Roll and Catch
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#14532d', lineHeight: 1.6 }}>
                      Sit facing your child and complete rounds together. Mark each round as caught or dropped.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(ballRollPlans).map(([key, plan]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setBallMode(key);
                          resetBallSession();
                        }}
                        style={{
                          border: key === ballMode ? '2px solid #16a34a' : '1px solid #bbf7d0',
                          background: key === ballMode ? '#dcfce7' : '#ffffff',
                          color: '#14532d',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {plan.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                    <div style={{ borderRadius: '12px', border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#166534', fontWeight: 700 }}>Distance</div>
                      <div style={{ fontSize: '13px', color: '#14532d', marginTop: '4px' }}>{ballPlan.distance}</div>
                    </div>
                    <div style={{ borderRadius: '12px', border: '1px solid #d9f99d', background: '#fefce8', padding: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#854d0e', fontWeight: 700 }}>How To Play (Step by Step)</div>
                      <div style={{ marginTop: '6px', fontSize: '13px', color: '#713f12', lineHeight: 1.7 }}>
                        1. Sit on the floor facing each other.
                        <br />2. Say Ready, steady, roll and roll the ball softly.
                        <br />3. Child catches or stops the ball with both hands.
                        <br />4. Child rolls it back to you.
                        <br />5. Mark each round using the buttons below.
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Rounds Progress</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{ballRound}/{ballPlan.rounds}</div>
                    </div>
                    <div style={{ height: '10px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round((ballRound / ballPlan.rounds) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e 0%, #84cc16 100%)' }}></div>
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '12px', color: '#334155', fontWeight: 700, flexWrap: 'wrap' }}>
                      <span>Successful catches: {ballCatches}</span>
                      <span>Drops: {ballDrops}</span>
                      <span>Accuracy: {ballAccuracy}%</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => markBallRound(true)}
                      disabled={ballDone}
                      style={{
                        border: 'none',
                        background: ballDone ? '#94a3b8' : '#16a34a',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: ballDone ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Mark Catch
                    </button>
                    <button
                      onClick={() => markBallRound(false)}
                      disabled={ballDone}
                      style={{
                        border: 'none',
                        background: ballDone ? '#94a3b8' : '#f59e0b',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: ballDone ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Mark Drop
                    </button>
                    <button
                      onClick={resetBallSession}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Reset Session
                    </button>
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #93c5fd' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>Parent Coaching Tip</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
                      {ballPlan.coaching}
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fdba74' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>How did your child feel?</div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Happy', 'Excited', 'Tired'].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setBallMood(mood)}
                          style={{
                            border: mood === ballMood ? '2px solid #f59e0b' : '1px solid #fcd34d',
                            background: mood === ballMood ? '#fef3c7' : '#fffbeb',
                            color: '#78350f',
                            borderRadius: '999px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {ballDone && (
                    <div style={{ marginTop: '14px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '12px', fontWeight: 700, fontSize: '13px' }}>
                      Badge Unlocked: {ballPlan.badge} | Final Accuracy: {ballAccuracy}%
                    </div>
                  )}
                </>
              ) : selectedActivity.title === 'Finger Painting Fun' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', border: '1px solid #fdba74' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#9a3412' }}>
                      Creative Theme: {fingerPaintingPlan.theme}
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#7c2d12', lineHeight: 1.6 }}>
                      Let children turn messy painting time into a simple picture story using handprints and fingerprint dots.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>Materials</div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {fingerPaintingPlan.materials.map((item) => (
                          <div key={item} style={{ fontSize: '13px', color: '#475569' }}>• {item}</div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#fefce8', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#854d0e', marginBottom: '8px' }}>How To Do It</div>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {fingerPaintingPlan.steps.map((step, index) => (
                          <div key={step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ minWidth: '24px', height: '24px', borderRadius: '999px', background: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {index + 1}
                            </div>
                            <div style={{ fontSize: '13px', color: '#713f12', lineHeight: 1.6 }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Skills Built</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {fingerPaintingPlan.skills.map((skill) => (
                          <span key={skill} style={{ padding: '6px 10px', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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

      {stackShowConfetti && (
        <div style={reactionOverlay}>
          <div style={reactionEmojiStyle}>🎉</div>
        </div>
      )}

      {ballShowConfetti && (
        <div style={reactionOverlay}>
          <div style={reactionEmojiStyle}>🏅</div>
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
