import { useState, useEffect } from 'react';
import questionsData from './questions.json';
import './App.css';

function App() {
  const [step, setStep] = useState('form'); // form, test, result
  const [userInfo, setUserInfo] = useState({ name: '', dob: '', yearJoined: '' });
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1000);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let timer;
    if (step === 'test' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === 'test') {
      handleSubmit(true);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleStart = (e) => {
    e.preventDefault();
    if (userInfo.name && userInfo.dob && userInfo.yearJoined) {
      window.scrollTo(0, 0);
      setStep('test');
      setTimeLeft(1000);
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

  const handleSubmit = (isAuto = false) => {
    if (!isAuto && Object.keys(answers).length < questionsData.length) {
      const confirmSubmit = window.confirm(`You have only answered ${Object.keys(answers).length} out of ${questionsData.length} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }
    setScore(calculateScore());
    window.scrollTo(0, 0);
    setStep('result');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (step === 'form') {
    return (
      <div className="container form-container glass">
        <div className="brand-header">
          <div className="theme-toggle-container">
            <button 
              className="theme-toggle" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title="Toggle Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <h1>KidsInspiring Nation</h1>
          <p className="subtitle">100-Question Assessment</p>
        </div>
        <form onSubmit={handleStart} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name" 
              type="text" 
              placeholder="Enter your full name"
              value={userInfo.name}
              onChange={e => setUserInfo({...userInfo, name: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input 
              id="dob" 
              type="date" 
              value={userInfo.dob}
              onChange={e => setUserInfo({...userInfo, dob: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="yearJoined">Year Joined KIN</label>
            <input 
              id="yearJoined" 
              type="number" 
              min="2000"
              max="2030"
              placeholder="e.g., 2022"
              value={userInfo.yearJoined}
              onChange={e => setUserInfo({...userInfo, yearJoined: e.target.value})}
              required 
            />
          </div>
          <button type="submit" className="btn primary-btn">Start Assessment</button>
        </form>
      </div>
    );
  }

  if (step === 'test') {
    return (
      <div className="container test-container">
        <header className="test-header glass">
          <div>
            <h2>KIN Training Assessment</h2>
            <p>Candidate: {userInfo.name}</p>
          </div>
          <div className="header-stats">
            <div className={`timer ${timeLeft < 60 ? 'urgent' : ''}`}>
              <span>⏱ {formatTime(timeLeft)}</span>
            </div>
            <div className="progress">
              <span>{Object.keys(answers).length} / {questionsData.length} Answered</span>
            </div>
          </div>
        </header>

        <div className="questions-list">
          {questionsData.map((q, index) => (
            <div key={q.id} className="question-card glass">
              <h3 className="question-text">
                <span className="q-num">{index + 1}.</span> {q.text}
              </h3>
              <div className="options-group">
                {Object.entries(q.options).map(([key, value]) => (
                  <label 
                    key={key} 
                    className={`option-label ${answers[q.id] === key ? 'selected' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name={`q-${q.id}`} 
                      value={key}
                      checked={answers[q.id] === key}
                      onChange={() => handleOptionChange(q.id, key)}
                    />
                    <span className="opt-key">{key}</span> {value}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="submit-section glass">
          <p>Please review your answers before submitting.</p>
          <button onClick={handleSubmit} className="btn primary-btn large">Submit Final Answers</button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const percentage = ((score / questionsData.length) * 100).toFixed(0);
    let message = '';
    if (percentage >= 90) message = "Excellent work! You have shown mastery of the KIN Training.";
    else if (percentage >= 70) message = "Great job! You have a solid understanding of the principles.";
    else message = "Good effort, but there is still more to learn. Keep reviewing the materials!";

    return (
      <div className="container result-container glass">
        <div className="result-header">
          <h1>Assessment Complete</h1>
          <p className="candidate-name">{userInfo.name} • Joined {userInfo.yearJoined}</p>
        </div>
        
        <div className="score-circle">
          <div className="score-value">{score}</div>
          <div className="score-total">/ {questionsData.length}</div>
        </div>
        
        <h2 className="result-msg">{message}</h2>
        
        <div className="result-actions">
          <button onClick={() => window.location.reload()} className="btn secondary-btn">Retake Assessment</button>
        </div>

        <div className="review-section">
          <h3>Review Answers</h3>
          {questionsData.map(q => {
            const isCorrect = answers[q.id] === q.answer;
            return (
              <div key={q.id} className={`review-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <p className="r-text"><strong>{q.id}.</strong> {q.text}</p>
                <div className="r-details">
                  <p>Your Answer: {answers[q.id] ? `${answers[q.id]}) ${q.options[answers[q.id]]}` : 'Skipped'}</p>
                  {!isCorrect && <p className="correct-ans">Correct Answer: {q.answer}) {q.options[q.answer]}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

export default App;
