import React, { useState } from 'react';

const AssessmentView = ({ questions, answers, onOptionChange, timeLeft, formatTime, userInfo, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const progress = ((Object.keys(answers).length / questions.length) * 100).toFixed(0);

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container test-container fade-in">
      <header className="test-header glass">
        <div className="candidate-info">
          <h2>KIN Assessment</h2>
          <p>{userInfo.name}</p>
        </div>
        <div className="header-metrics">
          <div className={`timer-ring ${timeLeft < 60 ? 'urgent' : ''}`}>
             <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
          <div className="progress-stat">
            <div className="progress-bar-container">
               <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{Object.keys(answers).length}/{questions.length} answered</span>
          </div>
        </div>
      </header>

      <div className="assessment-layout">
        <aside className="question-nav glass hide-mobile">
          <h3>Questions</h3>
          <div className="nav-grid">
            {questions.map((q, idx) => (
              <button 
                key={q.id}
                onClick={() => jumpToQuestion(idx)}
                className={`nav-dot ${currentIndex === idx ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>

        <main className="question-focus">
          <div className="question-card-focus glass fade-in" key={currentQuestion.id}>
            <div className="q-header">
              <span className="q-index">Question {currentIndex + 1} of {questions.length}</span>
            </div>
            <h3 className="q-text">{currentQuestion.text}</h3>
            
            <div className="options-grid">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <button 
                  key={key}
                  onClick={() => onOptionChange(currentQuestion.id, key)}
                  className={`option-btn ${answers[currentQuestion.id] === key ? 'selected' : ''}`}
                >
                  <span className="opt-marker">{key}</span>
                  <span className="opt-val">{value}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="action-nav">
            <button 
              onClick={prevQuestion} 
              disabled={currentIndex === 0}
              className="btn secondary-btn"
            >
              Previous
            </button>
            
            {currentIndex === questions.length - 1 ? (
              <button onClick={() => onSubmit()} className="btn primary-btn pulse">
                Finish & Submit
              </button>
            ) : (
              <button onClick={nextQuestion} className="btn primary-btn">
                Next Question
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentView;
