import { useState, useEffect } from 'react';
import questionsData from './questions.json';
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
  const [loading, setLoading] = useState(false);

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
    questionsData.forEach(q => {
      if (answers[q.id] === q.answer) s++;
    });
    return s;
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && Object.keys(answers).length < questionsData.length) {
      const confirmSubmit = window.confirm(`You have only answered ${Object.keys(answers).length} out of ${questionsData.length} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }
    
    const finalScore = calculateScore();
    setScore(finalScore);
    
    if (submissionId) {
      try {
        await supabaseService.updateSubmission(submissionId, {
          status: isAuto ? 'timed_out' : 'completed',
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

  // Rendering logic
  switch (step) {
    case 'form':
      return (
        <LandingPage 
          userInfo={userInfo} 
          setUserInfo={setUserInfo} 
          onStart={handleStart}
          onAdminAccess={() => setStep('admin')}
          theme={theme}
          toggleTheme={toggleTheme}
          loading={loading}
        />
      );
    case 'test':
      return (
        <AssessmentView 
          questions={questionsData}
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
          totalQuestions={questionsData.length}
          userInfo={userInfo}
          answers={answers}
          questions={questionsData}
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
          onExit={() => { setStep('form'); setIsAdminLoggedIn(false); setAdminPassword(''); }}
          onRefresh={fetchSubmissions}
        />
      );
    default:
      return null;
  }
}

export default App;
