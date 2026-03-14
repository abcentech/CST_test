import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from './services/supabaseService';
import LandingPage from './components/LandingPage';
import AssessmentView from './components/AssessmentView';
import AdminPortal from './components/AdminPortal';
import ResultSummary from './components/ResultSummary';
import './App.css';

function App() {
  const [step, setStep] = useState('form'); // form, test, result, admin
  const [userInfo, setUserInfo] = useState({ name: '', dob: '', yearJoined: '' });
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1000);
  const [theme, setTheme] = useState('dark');
  const [submissionId, setSubmissionId] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const shuffle = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const loadQuestions = useCallback(async (shouldShuffle = false) => {
    try {
      setLoading(true);
      const data = await supabaseService.fetchQuestions();
      // Map options array back to object if needed
      const formatted = data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? {
          A: q.options[0],
          B: q.options[1],
          C: q.options[2],
          D: q.options[3]
        } : q.options
      }));
      setQuestions(shouldShuffle ? shuffle(formatted) : formatted);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    const init = async () => {
      const savedData = localStorage.getItem('kin_assessment_session');
      if (savedData) {
        const { userInfo: savedUserInfo, answers: savedAnswers, step: savedStep, submissionId: savedId, timeLeft: savedTimeLeft, questions: savedQuestions } = JSON.parse(savedData);
        if (savedStep === 'test') {
          setUserInfo(savedUserInfo);
          setAnswers(savedAnswers);
          setStep(savedStep);
          setSubmissionId(savedId);
          setTimeLeft(savedTimeLeft);
          if (savedQuestions) {
            setQuestions(savedQuestions);
            setLoading(false);
          } else {
            await loadQuestions(true);
          }
        } else {
          await loadQuestions();
        }
      } else {
        await loadQuestions();
      }
    };
    init();
  }, [loadQuestions]);

  // Save state to localStorage
  useEffect(() => {
    if (step === 'test') {
      localStorage.setItem('kin_assessment_session', JSON.stringify({
        userInfo,
        answers,
        step,
        submissionId,
        timeLeft,
        questions
      }));
    } else if (step === 'result' || step === 'form') {
      localStorage.removeItem('kin_assessment_session');
    }
  }, [userInfo, answers, step, submissionId, timeLeft, questions]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle Timer
  useEffect(() => {
    let timer;
    if (step === 'test' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === 'test') {
      handleSubmit(true);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleStart = async (e) => {
    e.preventDefault();
    if (userInfo.name && userInfo.dob && userInfo.yearJoined) {
      setLoading(true);
      try {
        const id = await supabaseService.logStartAssessment(userInfo);
        setSubmissionId(id);
        const shuffled = shuffle(questions);
        setQuestions(shuffled);
        setStep('test');
        setTimeLeft(1000);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Failed to start assessment:', err);
        alert('Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOptionChange = (qId, optionKey) => {
    setAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const calculateScore = () => {
    let s = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) s++;
    });
    return s;
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && Object.keys(answers).length < questions.length) {
      const confirmSubmit = window.confirm(`You have only answered ${Object.keys(answers).length} out of ${questions.length} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }
    
    const finalScore = calculateScore();
    setScore(finalScore);
    
    if (submissionId) {
      try {
        await supabaseService.updateSubmission(submissionId, {
          status: (isAuto ? 'timed_out' : 'completed'),
          answers,
          score: finalScore
        });
      } catch (err) {
        console.error('Failed to update submission:', err);
      }
    }

    setStep('result');
    window.scrollTo(0, 0);
  };

  const fetchSubmissions = async () => {
    try {
      const data = await supabaseService.fetchSubmissions();
      setAllSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'KIN2026') {
      setIsAdminLoggedIn(true);
      fetchSubmissions();
    } else {
      alert('Incorrect Password');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading && step !== 'admin' && step !== 'result') {
    return <div className="loading-screen">Loading Assessment...</div>;
  }

  // Rendering logic
  switch (step) {
    case 'form':
      return (
        <LandingPage 
          userInfo={userInfo} 
          setUserInfo={setUserInfo} 
          onStart={handleStart}
          onAdminAccess={() => { setStep('admin'); loadQuestions(false); }}
          theme={theme}
          toggleTheme={toggleTheme}
          loading={loading}
        />
      );
    case 'test':
      return (
        <AssessmentView 
          questions={questions}
          answers={answers}
          onOptionChange={handleOptionChange}
          timeLeft={timeLeft}
          formatTime={formatTime}
          userInfo={userInfo}
          onSubmit={handleSubmit}
        />
      );
    case 'result':
      return (
        <ResultSummary 
          score={score}
          totalQuestions={questions.length}
          userInfo={userInfo}
          answers={answers}
          questions={questions}
        />
      );
    case 'admin':
      if (!isAdminLoggedIn) {
        return (
          <div className="container form-container glass fade-in">
            <h2>Admin Security Check</h2>
            <div className="user-form mt-2">
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Enter Access Key" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="admin-input"
                />
              </div>
              <button className="btn primary-btn large" onClick={handleAdminLogin}>Unlock Dashboard</button>
              <button onClick={() => setStep('form')} className="link-btn mt-1">Return to Assessment</button>
            </div>
          </div>
        );
      }
      return (
        <AdminPortal 
          submissions={allSubmissions}
          questions={questions}
          onExit={() => { setStep('form'); setIsAdminLoggedIn(false); setAdminPassword(''); }}
          onRefresh={fetchSubmissions}
          onRefreshQuestions={() => loadQuestions(false)}
          onDeleteSubmission={async (id) => {
            if (window.confirm('Are you sure you want to delete this submission?')) {
              await supabaseService.deleteSubmission(id);
              fetchSubmissions();
            }
          }}
          onUpdateSubmission={async (id, updates) => {
            await supabaseService.updateSubmission(id, updates);
            fetchSubmissions();
          }}
          onUpdateQuestion={async (id, updates) => {
            await supabaseService.updateQuestion(id, updates);
            loadQuestions(false);
          }}
          onDeleteQuestion={async (id) => {
            if (window.confirm('Delete this question?')) {
              await supabaseService.deleteQuestion(id);
              loadQuestions(false);
            }
          }}
          onCreateQuestion={async (q) => {
            await supabaseService.createQuestion(q);
            loadQuestions(false);
          }}
        />
      );
    default:
      return null;
  }
}

export default App;
