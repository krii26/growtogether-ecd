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
  const [selectedStoryId, setSelectedStoryId] = useState('little-seed');
  const [storyPageIndex, setStoryPageIndex] = useState(0);
  const [storyWordsLearned, setStoryWordsLearned] = useState(0);
  const [storyMood, setStoryMood] = useState('');
  const [storyShowConfetti, setStoryShowConfetti] = useState(false);
  const [kitchenMode, setKitchenMode] = useState('quick');
  const [kitchenRole, setKitchenRole] = useState('Chef');
  const [kitchenMissionStep, setKitchenMissionStep] = useState(0);
  const [kitchenPromptIndex, setKitchenPromptIndex] = useState(0);
  const [kitchenOrdersServed, setKitchenOrdersServed] = useState(0);
  const [kitchenPoliteWords, setKitchenPoliteWords] = useState(0);
  const [kitchenQuestionsAsked, setKitchenQuestionsAsked] = useState(0);
  const [kitchenFeelingWordUsed, setKitchenFeelingWordUsed] = useState(false);
  const [kitchenMood, setKitchenMood] = useState('');
  const [kitchenShowConfetti, setKitchenShowConfetti] = useState(false);
  const [playdoughType, setPlaydoughType] = useState('Animals');
  const [beadPatternMode, setBeadPatternMode] = useState('easy');
  const [emotionFace, setEmotionFace] = useState('Happy');
  const [scienceRoundIndex, setScienceRoundIndex] = useState(0);
  const [scienceScore, setScienceScore] = useState(0);
  const [scienceFeedback, setScienceFeedback] = useState('Pick the color you think will appear after mixing.');
  const [scienceShowConfetti, setScienceShowConfetti] = useState(false);
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

  const playdoughCreationsPlans = {
    Animals: {
      label: 'Animals 🐢',
      steps: [
        { instruction: 'Roll a large ball of playdough for the body.', coaching: 'Say: squeeze and roll, squeeze and roll. Watch your child\'s hands closely.' },
        { instruction: 'Roll a smaller ball for the head and press it gently onto the body.', coaching: 'Ask: where does the head go? Let them place it all by themselves.' },
        { instruction: 'Roll tiny sausage shapes for legs and attach them underneath.', coaching: 'Count the legs together out loud: one, two, three, four!' },
        { instruction: 'Add pinch details — ears, tail, or spots — using fingertips.', coaching: 'Say: use your pinch fingers to make tiny dots. Celebrate every detail they add.' }
      ]
    },
    Fruits: {
      label: 'Fruits 🍎',
      steps: [
        { instruction: 'Choose a fruit to make — apple, banana, or strawberry.', coaching: 'Show a real fruit if available. Ask: what shape is it? Round or long?' },
        { instruction: 'Roll the right base shape — ball for apple, curved log for banana.', coaching: 'Guide hand-over-hand if needed. Keep encouraging: great job shaping!' },
        { instruction: 'Add a small blended piece of a different color for texture or blush.', coaching: 'Ask: what color is a ripe banana? Talk about colors and names together.' },
        { instruction: 'Press a tiny green stem or leaf on top to finish.', coaching: 'Say: every fruit has a stem. Can you find a stem on a real fruit at home?' }
      ]
    },
    Letters: {
      label: 'Letters 🔤',
      steps: [
        { instruction: 'Choose the first letter of your child\'s name to start with.', coaching: 'Say the letter name aloud and its sound. Repeat together two or three times.' },
        { instruction: 'Roll a long sausage of playdough for the straight lines of the letter.', coaching: 'Ask: is this line long or short? Describe while building together.' },
        { instruction: 'Curve or bend the sausage into the letter shape on a flat surface.', coaching: 'Trace the letter with a finger first, then guide shaping the playdough.' },
        { instruction: 'Press lightly to flatten and display the finished letter proudly.', coaching: 'Celebrate together! Ask: what word starts with this letter?' }
      ]
    }
  };

  const playdoughMaterials = [
    'Playdough in 3 or more colors',
    'Rolling pin or smooth round bottle',
    'Cookie cutters or safe plastic knife',
    'Flat tray or clean table surface',
    'Wipes or damp cloth for cleanup'
  ];

  const playdoughSkills = ['Fine Motor Control', 'Creativity', 'Shape Recognition', 'Language Development', 'Concentration'];

  const beadStringingPlans = {
    easy: {
      label: 'Easy',
      pattern: 'Red - Blue - Red - Blue',
      steps: [
        'Choose two large bead colors and place them in separate bowls.',
        'Model the first two beads slowly: red, blue.',
        'Let your child thread the same two-color pattern along the string.',
        'Check the finished string together by pointing and naming each color.'
      ],
      coaching: 'Say each color aloud before threading it so your child hears the pattern and movement together.'
    },
    medium: {
      label: 'Medium',
      pattern: 'Red - Yellow - Blue - Red - Yellow - Blue',
      steps: [
        'Set out three bead colors in a clear left-to-right order.',
        'Start the pattern with three beads and pause for your child to continue.',
        'Encourage your child to look back at the pattern before choosing the next bead.',
        'Read the completed sequence aloud together from start to finish.'
      ],
      coaching: 'If your child loses track, cover the extra beads and guide attention back to the repeating order.'
    },
    challenge: {
      label: 'Challenge',
      pattern: 'Green - Green - Orange - Green - Green - Orange',
      steps: [
        'Show the repeating pattern using two same-color beads and one different bead.',
        'Ask your child to predict which bead comes next before threading.',
        'Thread the pattern together in short groups of three beads.',
        'Review the bracelet or string and ask where the pattern repeats.'
      ],
      coaching: 'Use phrases like same, same, different to make the pattern structure easier to notice.'
    }
  };

  const beadMaterials = ['Large colorful beads', 'String or shoelace', 'Small bowls for sorting colors'];
  const beadSkills = ['Sequencing', 'Fine Motor Control', 'Color Recognition', 'Attention'];

  const emotionFacesPlans = {
    Happy: {
      emoji: '😊',
      faceCue: 'Big smile, bright eyes, relaxed cheeks.',
      prompt: 'What makes you feel happy?',
      support: 'Smile first and invite your child to copy you in the mirror.'
    },
    Sad: {
      emoji: '😢',
      faceCue: 'Turn lips down a little and soften the eyes.',
      prompt: 'What can we do when someone feels sad?',
      support: 'Keep your voice calm and talk about comforting actions like a hug or kind words.'
    },
    Angry: {
      emoji: '😠',
      faceCue: 'Tight mouth, strong eyebrows, tense face.',
      prompt: 'What helps your body calm down when you feel angry?',
      support: 'Model one slow breath after making the face so the child links emotion with calming.'
    },
    Surprised: {
      emoji: '😮',
      faceCue: 'Round mouth, wide eyes, lifted eyebrows.',
      prompt: 'What surprised you today?',
      support: 'Exaggerate the expression a little so the child can clearly notice eyes and mouth changes.'
    }
  };

  const emotionSteps = [
    'Pick one feeling face below.',
    'Make the same face together in a mirror.',
    'Talk about what the eyes, mouth, and eyebrows look like.',
    'Ask when your child has felt that emotion before.'
  ];

  const emotionSkills = ['Emotion Recognition', 'Self-Expression', 'Empathy', 'Language Development'];

  const scienceMixingRounds = [
    {
      id: 'sunset-orange',
      colors: ['Red', 'Yellow'],
      target: 'Orange',
      options: ['Orange', 'Green', 'Purple', 'Brown']
    },
    {
      id: 'garden-green',
      colors: ['Blue', 'Yellow'],
      target: 'Green',
      options: ['Purple', 'Green', 'Orange', 'Pink']
    },
    {
      id: 'grape-purple',
      colors: ['Red', 'Blue'],
      target: 'Purple',
      options: ['Purple', 'Brown', 'Orange', 'Green']
    },
    {
      id: 'muddy-brown',
      colors: ['Red', 'Yellow', 'Blue'],
      target: 'Brown',
      options: ['Brown', 'Purple', 'Green', 'Orange']
    }
  ];

  const scienceMaterials = ['Water cups or clear bowls', 'Food coloring or paint', 'Spoon or dropper', 'Paper towel for cleanup'];
  const scienceSkills = ['Prediction', 'Observation', 'Color Recognition', 'Scientific Thinking'];
  const scienceColorMap = {
    Red: '#ef4444',
    Yellow: '#facc15',
    Blue: '#3b82f6',
    Orange: '#f97316',
    Green: '#22c55e',
    Purple: '#8b5cf6',
    Brown: '#92400e',
    Pink: '#ec4899'
  };

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

  const storyBooks = [
    {
      id: 'little-seed',
      title: 'The Little Seed',
      duration: '5-7 min',
      wordGoal: 3,
      pages: [
        {
          scene: 'A tiny seed sleeps in soft soil.',
          text: 'This is a tiny seed. It is sleeping under the warm soil. Good night, little seed.',
          parentPrompt: 'Can you point to the seed?'
        },
        {
          scene: 'Rain drops fall and the sun shines.',
          text: 'Raindrops fall. The sun shines. The seed drinks water and wakes up slowly.',
          parentPrompt: 'Can you find rain and sun?'
        },
        {
          scene: 'A small green sprout appears.',
          text: 'Pop. A small sprout comes out. It stretches up and says hello to the sky.',
          parentPrompt: 'Show me the green sprout.'
        },
        {
          scene: 'The sprout becomes a flower.',
          text: 'The sprout grows into a pretty flower. A butterfly visits and says wow.',
          parentPrompt: 'Where is the flower?'
        }
      ]
    },
    {
      id: 'bunny-ball',
      title: 'Bunny and the Red Ball',
      duration: '6-8 min',
      wordGoal: 4,
      pages: [
        {
          scene: 'Bunny finds a red ball.',
          text: 'Bunny sees a red ball near the tree. Bunny smiles and hops closer.',
          parentPrompt: 'Can you point to the red ball?'
        },
        {
          scene: 'Ball rolls down a hill.',
          text: 'Oh no. The ball rolls down the hill. Bunny says stop, stop, little ball.',
          parentPrompt: 'Can you show rolling with your hand?'
        },
        {
          scene: 'Bird helps Bunny.',
          text: 'A bird friend helps Bunny. Together they stop the ball beside a rock.',
          parentPrompt: 'Who helped Bunny?'
        },
        {
          scene: 'Friends play together.',
          text: 'Now Bunny and Bird play catch with the red ball. They laugh and laugh.',
          parentPrompt: 'Can you say ball and catch?'
        }
      ]
    },
    {
      id: 'morning-cat',
      title: 'Milo Morning Cat',
      duration: '5-6 min',
      wordGoal: 3,
      pages: [
        {
          scene: 'Milo wakes up and stretches.',
          text: 'Milo the cat wakes up. He stretches his paws and opens his sleepy eyes.',
          parentPrompt: 'Can you stretch like Milo?'
        },
        {
          scene: 'Milo drinks milk.',
          text: 'Milo drinks warm milk from a blue bowl. Yum, says Milo.',
          parentPrompt: 'Where is the blue bowl?'
        },
        {
          scene: 'Milo greets neighbors.',
          text: 'Milo walks outside and says meow to dog, bird, and butterfly.',
          parentPrompt: 'Can you say meow?'
        },
        {
          scene: 'Milo returns home to nap.',
          text: 'After a happy morning, Milo comes home and curls up for a nap.',
          parentPrompt: 'Is Milo sleepy or excited?'
        }
      ]
    }
  ];

  const kitchenPlayModes = {
    quick: {
      label: 'Quick 10 Min',
      ordersGoal: 2,
      politeGoal: 2,
      questionGoal: 1,
      badge: 'Little Chef'
    },
    full: {
      label: 'Full 25 Min',
      ordersGoal: 4,
      politeGoal: 3,
      questionGoal: 2,
      badge: 'Kind Server'
    }
  };

  const kitchenMenu = ['Tea', 'Soup', 'Fruit Salad', 'Sandwich'];
  const kitchenPrompts = [
    'What would you like to order today?',
    'Please wait, your food is coming soon.',
    'Would you like tea or soup?',
    'How does your food taste?',
    'Thank you for visiting our kitchen.'
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

  useEffect(() => {
    if (!storyShowConfetti) {
      return;
    }

    const timer = setTimeout(() => {
      setStoryShowConfetti(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [storyShowConfetti]);

  useEffect(() => {
    if (!kitchenShowConfetti) {
      return;
    }

    const timer = setTimeout(() => {
      setKitchenShowConfetti(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [kitchenShowConfetti]);

  useEffect(() => {
    if (!scienceShowConfetti) {
      return;
    }

    const timer = setTimeout(() => {
      setScienceShowConfetti(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [scienceShowConfetti]);

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
    if (activity.title === 'Story Time Circle') {
      setSelectedStoryId('little-seed');
      setStoryPageIndex(0);
      setStoryWordsLearned(0);
      setStoryMood('');
      setStoryShowConfetti(false);
    }
    if (activity.title === 'Pretend Kitchen Play') {
      setKitchenMode('quick');
      setKitchenRole('Chef');
      setKitchenMissionStep(0);
      setKitchenPromptIndex(0);
      setKitchenOrdersServed(0);
      setKitchenPoliteWords(0);
      setKitchenQuestionsAsked(0);
      setKitchenFeelingWordUsed(false);
      setKitchenMood('');
      setKitchenShowConfetti(false);
    }
    if (activity.title === 'Pattern Bead Stringing') {
      setBeadPatternMode('easy');
    }
    if (activity.title === 'Emotion Faces Game') {
      setEmotionFace('Happy');
    }
    if (activity.title === 'Science Experiment') {
      setScienceRoundIndex(0);
      setScienceScore(0);
      setScienceFeedback('Pick the color you think will appear after mixing.');
      setScienceShowConfetti(false);
    }
  };

  const closeDetails = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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

  const currentScienceRound = scienceMixingRounds[scienceRoundIndex] || null;
  const scienceDone = scienceRoundIndex >= scienceMixingRounds.length;

  const handleScienceGuess = (guess) => {
    if (!currentScienceRound || scienceDone) {
      return;
    }

    if (guess === currentScienceRound.target) {
      const nextScore = scienceScore + 1;
      const nextRound = scienceRoundIndex + 1;

      setScienceScore(nextScore);
      setReactionEmoji('🧪');

      if (nextRound >= scienceMixingRounds.length) {
        setScienceFeedback(`Correct. ${currentScienceRound.colors.join(' + ')} makes ${currentScienceRound.target}. You finished the experiment.`);
        setScienceRoundIndex(nextRound);
        setScienceShowConfetti(true);
        return;
      }

      setScienceFeedback(`Correct. ${currentScienceRound.colors.join(' + ')} makes ${currentScienceRound.target}. Ready for the next mix?`);
      setScienceRoundIndex(nextRound);
      return;
    }

    setScienceFeedback(`Not quite. Try again: what do ${currentScienceRound.colors.join(' + ')} make together?`);
    setReactionEmoji('🤔');
  };

  const resetScienceGame = () => {
    setScienceRoundIndex(0);
    setScienceScore(0);
    setScienceFeedback('Pick the color you think will appear after mixing.');
    setScienceShowConfetti(false);
  };

  const selectStoryBook = (storyId) => {
    setSelectedStoryId(storyId);
    setStoryPageIndex(0);
    setStoryWordsLearned(0);
    setStoryMood('');
    setStoryShowConfetti(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const readPageAloud = () => {
    if (!selectedStory || !currentStoryPage || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const buildExpressiveNarration = (text) => {
      const sentenceParts = text.match(/[^.!?]+[.!?]*/g) || [text];
      const withPauses = sentenceParts
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part, index, arr) => {
          let expressive = part
            .replace(/\b(oh no)\b/gi, 'oh no...')
            .replace(/\b(wow)\b/gi, 'wow...')
            .replace(/\b(hello)\b/gi, 'hello...')
            .replace(/\b(good night)\b/gi, 'good night...')
            .replace(/\b(yum)\b/gi, 'yum...');

          if (index < arr.length - 1 && !/[.!?]$/.test(expressive)) {
            expressive = `${expressive}...`;
          }

          return expressive;
        });

      return withPauses.join(' ');
    };

    window.speechSynthesis.cancel();
    const expressiveText = buildExpressiveNarration(currentStoryPage.text);
    const utterance = new SpeechSynthesisUtterance(expressiveText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoiceKeywords = [
      'female',
      'girl',
      'child',
      'kids',
      'neural',
      'samantha',
      'zira',
      'aria',
      'jenny',
      'serena',
      'google us english'
    ];
    const matchedVoice = voices.find((voice) =>
      preferredVoiceKeywords.some((keyword) => voice.name.toLowerCase().includes(keyword))
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    }

    utterance.rate = 0.64;
    utterance.pitch = 1.05;
    utterance.volume = 0.72;
    utterance.lang = utterance.lang || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const goToNextStoryPage = () => {
    if (!selectedStory) {
      return;
    }

    if (storyPageIndex < selectedStory.pages.length - 1) {
      setStoryPageIndex((prev) => prev + 1);
      return;
    }

    setStoryShowConfetti(true);
  };

  const goToPreviousStoryPage = () => {
    setStoryPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const resetStorySession = () => {
    setStoryPageIndex(0);
    setStoryWordsLearned(0);
    setStoryMood('');
    setStoryShowConfetti(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const resetKitchenSession = () => {
    setKitchenRole('Chef');
    setKitchenMissionStep(0);
    setKitchenPromptIndex(0);
    setKitchenOrdersServed(0);
    setKitchenPoliteWords(0);
    setKitchenQuestionsAsked(0);
    setKitchenFeelingWordUsed(false);
    setKitchenMood('');
    setKitchenShowConfetti(false);
  };

  const completeKitchenStep = () => {
    setKitchenMissionStep((prev) => {
      const next = Math.min(prev + 1, 3);
      if (next === 3 && prev < 3) {
        setKitchenShowConfetti(true);
      }
      return next;
    });
  };

  const nextKitchenPrompt = () => {
    setKitchenPromptIndex((prev) => prev + 1);
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
  const beadPlan = beadStringingPlans[beadPatternMode];
  const selectedEmotionPlan = emotionFacesPlans[emotionFace];
  const stackSteps = [
    `Build a ${stackPlan.targetStacks}-block tower`,
    `Copy pattern: ${stackPlan.pattern.join(' - ')}`,
    'Celebrate with claps and name the colors used'
  ];
  const stackProgress = Math.round((stackStep / stackSteps.length) * 100);
  const ballPlan = ballRollPlans[ballMode];
  const ballAccuracy = ballRound > 0 ? Math.round((ballCatches / ballRound) * 100) : 0;
  const ballDone = ballRound >= ballPlan.rounds;
  const selectedStory = storyBooks.find((book) => book.id === selectedStoryId) || storyBooks[0];
  const currentStoryPage = selectedStory.pages[storyPageIndex];
  const storyProgress = Math.round(((storyPageIndex + 1) / selectedStory.pages.length) * 100);
  const storyDone = storyPageIndex === selectedStory.pages.length - 1;
  const kitchenPlan = kitchenPlayModes[kitchenMode];
  const kitchenSteps = ['Choose menu and roles', 'Cook and serve', 'Thank customer and clean up'];
  const kitchenProgress = Math.round((kitchenMissionStep / kitchenSteps.length) * 100);
  const currentKitchenPrompt = kitchenPrompts[kitchenPromptIndex % kitchenPrompts.length];
  const kitchenDone = kitchenMissionStep >= kitchenSteps.length;
  const kitchenGoalsMet =
    kitchenOrdersServed >= kitchenPlan.ordersGoal &&
    kitchenPoliteWords >= kitchenPlan.politeGoal &&
    kitchenQuestionsAsked >= kitchenPlan.questionGoal &&
    kitchenFeelingWordUsed;

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
              ) : selectedActivity.title === 'Pretend Kitchen Play' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #fef3c7 0%, #d9f99d 100%)', border: '1px solid #facc15' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#713f12' }}>
                      Pretend Kitchen Play Guide
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#854d0e', lineHeight: 1.6 }}>
                      Role-play cooking and serving to build social interaction and expressive language.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(kitchenPlayModes).map(([key, mode]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setKitchenMode(key);
                          resetKitchenSession();
                        }}
                        style={{
                          border: key === kitchenMode ? '2px solid #ca8a04' : '1px solid #fde68a',
                          background: key === kitchenMode ? '#fef3c7' : '#ffffff',
                          color: '#78350f',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                    <div style={{ borderRadius: '12px', border: '1px solid #fcd34d', background: '#fffbeb', padding: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>Choose Role</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Chef', 'Server', 'Cashier'].map((role) => (
                          <button
                            key={role}
                            onClick={() => setKitchenRole(role)}
                            style={{
                              border: role === kitchenRole ? '2px solid #f59e0b' : '1px solid #fcd34d',
                              background: role === kitchenRole ? '#fef3c7' : '#ffffff',
                              color: '#78350f',
                              borderRadius: '999px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderRadius: '12px', border: '1px solid #d9f99d', background: '#f7fee7', padding: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#3f6212', marginBottom: '8px' }}>Menu Ideas</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {kitchenMenu.map((item) => (
                          <span key={item} style={{ padding: '6px 10px', borderRadius: '999px', background: '#ecfccb', color: '#3f6212', fontSize: '12px', fontWeight: 600 }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Mission Progress</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{kitchenMissionStep}/{kitchenSteps.length}</div>
                    </div>
                    <div style={{ height: '10px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${kitchenProgress}%`, height: '100%', background: 'linear-gradient(90deg, #84cc16 0%, #f59e0b 100%)' }}></div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                    {kitchenSteps.map((step, index) => {
                      const done = index < kitchenMissionStep;
                      const current = index === kitchenMissionStep;
                      return (
                        <div
                          key={step}
                          style={{
                            borderRadius: '12px',
                            border: done ? '1px solid #86efac' : current ? '1px solid #f59e0b' : '1px solid #e5e7eb',
                            background: done ? '#f0fdf4' : current ? '#fffbeb' : '#ffffff',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{ width: '24px', height: '24px', borderRadius: '999px', background: done ? '#16a34a' : current ? '#f59e0b' : '#cbd5e1', color: '#fff', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {done ? '✓' : index + 1}
                          </div>
                          <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: current ? 700 : 500 }}>{step}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '14px', borderRadius: '12px', border: '1px solid #fed7aa', background: '#fff7ed', padding: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>Talking Prompt</div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#7c2d12', lineHeight: 1.6 }}>
                      {currentKitchenPrompt}
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={nextKitchenPrompt}
                        style={{ border: 'none', background: '#f97316', color: '#fff', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Next Prompt
                      </button>
                      <button
                        onClick={() => setKitchenQuestionsAsked((prev) => prev + 1)}
                        style={{ border: 'none', background: '#2563eb', color: '#fff', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Asked Question
                      </button>
                      <button
                        onClick={() => setKitchenPoliteWords((prev) => prev + 1)}
                        style={{ border: 'none', background: '#16a34a', color: '#fff', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Polite Word Used
                      </button>
                      <button
                        onClick={() => setKitchenOrdersServed((prev) => prev + 1)}
                        style={{ border: 'none', background: '#7c3aed', color: '#fff', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Order Served
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                    <span>Orders: {kitchenOrdersServed}/{kitchenPlan.ordersGoal}</span>
                    <span>Polite words: {kitchenPoliteWords}/{kitchenPlan.politeGoal}</span>
                    <span>Questions: {kitchenQuestionsAsked}/{kitchenPlan.questionGoal}</span>
                    <span>Feeling word: {kitchenFeelingWordUsed ? 'Done' : 'Pending'}</span>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={completeKitchenStep}
                      disabled={kitchenDone}
                      style={{
                        border: 'none',
                        background: kitchenDone ? '#94a3b8' : '#ea580c',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: kitchenDone ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Mark Step Complete
                    </button>
                    <button
                      onClick={() => setKitchenFeelingWordUsed(true)}
                      style={{
                        border: 'none',
                        background: '#0891b2',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Feeling Word Used
                    </button>
                    <button
                      onClick={resetKitchenSession}
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
                      Model one sentence first, then let your child repeat. Praise effort and switch roles if child loses focus.
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>How did your child feel?</div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Happy', 'Shy', 'Excited', 'Tired'].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setKitchenMood(mood)}
                          style={{
                            border: mood === kitchenMood ? '2px solid #22c55e' : '1px solid #86efac',
                            background: mood === kitchenMood ? '#dcfce7' : '#f0fdf4',
                            color: '#14532d',
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

                  {kitchenDone && kitchenGoalsMet && (
                    <div style={{ marginTop: '14px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '12px', fontWeight: 700, fontSize: '13px' }}>
                      Badge Unlocked: {kitchenPlan.badge} | Great social play session completed.
                    </div>
                  )}
                </>
              ) : selectedActivity.title === 'Story Time Circle' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #fef9c3 0%, #ffedd5 100%)', border: '1px solid #fcd34d' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#92400e' }}>
                      In-App Story Book Reader
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#78350f', lineHeight: 1.6 }}>
                      Parents can read short story books directly here, page by page, with guided prompts.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
                    <label style={{ fontSize: '13px', color: '#7c2d12', fontWeight: 700 }}>Choose Story Book</label>
                    <select
                      value={selectedStoryId}
                      onChange={(e) => selectStoryBook(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #fcd34d',
                        fontSize: '13px',
                        background: '#ffffff',
                        color: '#7c2d12',
                        outline: 'none'
                      }}
                    >
                      {storyBooks.map((book) => (
                        <option key={book.id} value={book.id}>{book.title} ({book.duration})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
                        {selectedStory.title} - Page {storyPageIndex + 1}/{selectedStory.pages.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a16207', fontWeight: 700 }}>{storyProgress}%</div>
                    </div>
                    <div style={{ height: '10px', borderRadius: '999px', background: '#fef3c7', overflow: 'hidden' }}>
                      <div style={{ width: `${storyProgress}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)' }}></div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', borderRadius: '14px', border: '1px solid #fed7aa', background: '#fff7ed', padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>Scene</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#7c2d12' }}>{currentStoryPage.scene}</div>
                    <div style={{ marginTop: '10px', fontSize: '15px', lineHeight: 1.7, color: '#431407', background: '#ffffff', border: '1px solid #fdba74', borderRadius: '12px', padding: '12px' }}>
                      {currentStoryPage.text}
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', borderRadius: '12px', border: '1px solid #fed7aa', background: '#fff7ed', padding: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>Prompt Card</div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#7c2d12', lineHeight: 1.6 }}>
                      {currentStoryPage.parentPrompt}
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={readPageAloud}
                        style={{ border: 'none', background: '#f97316', color: '#fff', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Read Page Aloud
                      </button>
                      <button
                        onClick={() => setStoryWordsLearned((prev) => prev + 1)}
                        style={{ border: 'none', background: '#16a34a', color: '#fff', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Learned Word
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                    <span>Words learned today: {storyWordsLearned}/{selectedStory.wordGoal}</span>
                    <span>{storyWordsLearned >= selectedStory.wordGoal ? 'Word goal achieved' : 'Keep reading to reach word goal'}</span>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={goToPreviousStoryPage}
                      disabled={storyPageIndex === 0}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: storyPageIndex === 0 ? '#e2e8f0' : '#ffffff',
                        color: '#334155',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: storyPageIndex === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Previous Page
                    </button>
                    <button
                      onClick={goToNextStoryPage}
                      style={{
                        border: 'none',
                        background: '#ea580c',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {storyDone ? 'Finish Story' : 'Next Page'}
                    </button>
                    <button
                      onClick={resetStorySession}
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
                      Read slowly, point to one object at a time, and let your child answer before helping.
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>How did your child feel?</div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Happy', 'Focused', 'Distracted', 'Tired'].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setStoryMood(mood)}
                          style={{
                            border: mood === storyMood ? '2px solid #22c55e' : '1px solid #86efac',
                            background: mood === storyMood ? '#dcfce7' : '#f0fdf4',
                            color: '#14532d',
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

                  {storyDone && storyShowConfetti && (
                    <div style={{ marginTop: '14px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '12px', fontWeight: 700, fontSize: '13px' }}>
                      Badge Unlocked: Story Explorer | Word Goal: {storyWordsLearned}/{selectedStory.wordGoal}
                    </div>
                  )}
                </>
              ) : selectedActivity.title === 'Pattern Bead Stringing' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%)', border: '1px solid #93c5fd' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1d4ed8' }}>
                      Pattern Bead Stringing Guide
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
                      Create repeating color patterns one bead at a time to build sequencing and careful hand control.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(beadStringingPlans).map(([key, plan]) => (
                      <button
                        key={key}
                        onClick={() => setBeadPatternMode(key)}
                        style={{
                          border: key === beadPatternMode ? '2px solid #2563eb' : '1px solid #bfdbfe',
                          background: key === beadPatternMode ? '#dbeafe' : '#ffffff',
                          color: '#1e3a8a',
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

                  <div style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>Materials</div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {beadMaterials.map((item) => (
                          <div key={item} style={{ fontSize: '13px', color: '#475569' }}>• {item}</div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#eff6ff', border: '1px solid #93c5fd' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>Pattern To Copy</div>
                      <div style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 700 }}>{beadPlan.pattern}</div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>How To Do It</div>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {beadPlan.steps.map((step, index) => (
                          <div key={step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ minWidth: '24px', height: '24px', borderRadius: '999px', background: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {index + 1}
                            </div>
                            <div style={{ fontSize: '13px', color: '#713f12', lineHeight: 1.6 }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fdba74' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>Parent Coaching Tip</div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#7c2d12', lineHeight: 1.6 }}>
                        {beadPlan.coaching}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Skills Built</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {beadSkills.map((skill) => (
                          <span key={skill} style={{ padding: '6px 10px', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedActivity.title === 'Emotion Faces Game' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #fef2f2 0%, #ffedd5 100%)', border: '1px solid #fdba74' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#c2410c' }}>
                      Emotion Faces Mirror Play
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#9a3412', lineHeight: 1.6 }}>
                      Explore happy, sad, angry, and surprised faces with a mirror and simple feeling questions.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.keys(emotionFacesPlans).map((emotion) => (
                      <button
                        key={emotion}
                        onClick={() => setEmotionFace(emotion)}
                        style={{
                          border: emotion === emotionFace ? '2px solid #f97316' : '1px solid #fdba74',
                          background: emotion === emotionFace ? '#ffedd5' : '#ffffff',
                          color: '#9a3412',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {emotion} {emotionFacesPlans[emotion].emoji}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>What You Need</div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {['Mirror', 'Quiet space', 'Adult modeling the face first'].map((item) => (
                          <div key={item} style={{ fontSize: '13px', color: '#475569' }}>• {item}</div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#fff7ed', border: '1px solid #fdba74' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#9a3412', marginBottom: '8px' }}>How To Do It</div>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {emotionSteps.map((step, index) => (
                          <div key={step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ minWidth: '24px', height: '24px', borderRadius: '999px', background: '#f97316', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {index + 1}
                            </div>
                            <div style={{ fontSize: '13px', color: '#7c2d12', lineHeight: 1.6 }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#fefce8', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#854d0e', marginBottom: '8px' }}>Face Clue</div>
                      <div style={{ fontSize: '13px', color: '#713f12', lineHeight: 1.6 }}>
                        {selectedEmotionPlan.faceCue}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#eff6ff', border: '1px solid #93c5fd' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px' }}>Talk Together</div>
                      <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
                        {selectedEmotionPlan.prompt}
                      </div>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>Parent Coaching Tip</div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#166534', lineHeight: 1.6 }}>
                        {selectedEmotionPlan.support}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Skills Built</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {emotionSkills.map((skill) => (
                          <span key={skill} style={{ padding: '6px 10px', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedActivity.title === 'Science Experiment' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)', border: '1px solid #7dd3fc' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0c4a6e' }}>
                      Color Mixing Lab
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
                      Predict what new color appears when 2 or 3 colors mix together, then test your guess like a mini scientist.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>Materials</div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {scienceMaterials.map((item) => (
                          <div key={item} style={{ fontSize: '13px', color: '#475569' }}>• {item}</div>
                        ))}
                      </div>
                    </div>

                    {!scienceDone && currentScienceRound && (
                      <div style={{ padding: '16px', borderRadius: '16px', background: '#eff6ff', border: '1px solid #93c5fd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a' }}>Mixing Round {scienceRoundIndex + 1}/{scienceMixingRounds.length}</div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8' }}>Score: {scienceScore}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                          {currentScienceRound.colors.map((color) => (
                            <span
                              key={color}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '999px',
                                background: scienceColorMap[color] || '#d1d5db',
                                color: color === 'Yellow' ? '#1f2937' : '#ffffff',
                                fontSize: '13px',
                                fontWeight: 700
                              }}
                            >
                              {color}
                            </span>
                          ))}
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
                          What color will appear after mixing these together?
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(160px, 1fr))', gap: '10px' }}>
                          {currentScienceRound.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleScienceGuess(option)}
                              aria-label={`Choose ${option}`}
                              title={option}
                              style={{
                                border: '2px solid #bfdbfe',
                                background: scienceColorMap[option] || '#e5e7eb',
                                borderRadius: '12px',
                                padding: '14px',
                                minHeight: '56px',
                                cursor: 'pointer'
                              }}
                            >
                              <span
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  height: '18px',
                                  borderRadius: '999px',
                                  border: '1px solid rgba(255, 255, 255, 0.6)',
                                  background: 'rgba(255, 255, 255, 0.2)'
                                }}
                              ></span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#854d0e',
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: 1.6
                    }}>
                      {scienceFeedback}
                    </div>

                    <div style={{ padding: '12px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fdba74' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>Parent Coaching Tip</div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#7c2d12', lineHeight: 1.6 }}>
                        Ask for a prediction before each mix, then let your child explain why they chose that color.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={resetScienceGame}
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
                        Restart Experiment
                      </button>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Skills Built</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {scienceSkills.map((skill) => (
                          <span key={skill} style={{ padding: '6px 10px', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {scienceDone && (
                      <div style={{ marginTop: '4px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '12px', fontWeight: 700, fontSize: '13px' }}>
                        Experiment Complete: {scienceScore}/{scienceMixingRounds.length} correct predictions.
                      </div>
                    )}
                  </div>
                </>
              ) : selectedActivity.title === 'Playdough Creations' ? (
                <>
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #fdf4ff 0%, #ede9fe 100%)', border: '1px solid #d8b4fe' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#6b21a8' }}>
                      Creation Theme: Animals, Fruits &amp; Letters
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#581c87', lineHeight: 1.6 }}>
                      Let children explore shapes and textures by sculpting with playdough. Switch between creation types using the tabs below.
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>Materials</div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {playdoughMaterials.map((item) => (
                          <div key={item} style={{ fontSize: '13px', color: '#475569' }}>• {item}</div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#fdf4ff', border: '1px solid #e9d5ff' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#6b21a8', marginBottom: '10px' }}>Choose Creation Type</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {Object.entries(playdoughCreationsPlans).map(([key, plan]) => (
                          <button
                            key={key}
                            onClick={() => setPlaydoughType(key)}
                            style={{
                              border: key === playdoughType ? '2px solid #7c3aed' : '1px solid #ddd6fe',
                              background: key === playdoughType ? '#ede9fe' : '#ffffff',
                              color: key === playdoughType ? '#4c1d95' : '#6b7280',
                              borderRadius: '999px',
                              padding: '8px 14px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {plan.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gap: '12px' }}>
                        {playdoughCreationsPlans[playdoughType].steps.map((step, index) => (
                          <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', borderRadius: '12px', background: '#ffffff', border: '1px solid #ede9fe' }}>
                            <div style={{ minWidth: '26px', height: '26px', borderRadius: '999px', background: '#7c3aed', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: 600, lineHeight: 1.6 }}>{step.instruction}</div>
                              <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '13px' }}>💬</span>
                                <div style={{ fontSize: '12px', color: '#7c3aed', fontStyle: 'italic', lineHeight: 1.5 }}>{step.coaching}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Skills Built</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {playdoughSkills.map((skill) => (
                          <span key={skill} style={{ padding: '6px 10px', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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

      {storyShowConfetti && (
        <div style={reactionOverlay}>
          <div style={reactionEmojiStyle}>📚</div>
        </div>
      )}

      {kitchenShowConfetti && (
        <div style={reactionOverlay}>
          <div style={reactionEmojiStyle}>👩‍🍳</div>
        </div>
      )}

      {scienceShowConfetti && (
        <div style={reactionOverlay}>
          <div style={reactionEmojiStyle}>🧪</div>
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
