import React from 'react';

const ResultSummary = ({ score, totalQuestions, userInfo, answers, questions }) => {
  const percentage = ((score / totalQuestions) * 100).toFixed(0);
  
  const getFeedback = () => {
    if (percentage >= 90) return {
      title: "Exceptional Excellence",
      msg: "You have demonstrated complete mastery of the KIN Training modules. Outstanding performance!",
      color: "var(--success)"
    };
    if (percentage >= 75) return {
      title: "Strong Performance",
      msg: "Great job! You have a solid grasp of the core values and procedures of KidsInspiring Nation.",
      color: "var(--primary-color)"
    };
    if (percentage >= 50) return {
      title: "Good Foundation",
      msg: "You've passed the assessment, but there are areas for improvement. Review your incorrect answers.",
      color: "#f59e0b"
    };
    return {
      title: "Learning Opportunity",
      msg: "There is still much to learn. We encourage you to study the KIN principles further and retake the test.",
      color: "var(--error)"
    };
  };

  const feedback = getFeedback();

  return (
    <div className="container result-container glass fade-in">
      <div className="result-header">
        <h1>Assessment Results</h1>
        <p>{userInfo.name} • Class of {userInfo.yearJoined}</p>
      </div>

      <div className="score-summary">
        <div className="score-viz" style={{'--score-color': feedback.color}}>
          <div className="score-inner">
            <span className="score-num">{score}</span>
            <span className="score-denom">/ {totalQuestions}</span>
          </div>
          <svg className="score-svg">
             <circle className="bg" cx="80" cy="80" r="70"></circle>
             <circle className="meter" cx="80" cy="80" r="70" style={{strokeDashoffset: 440 - (440 * (score / totalQuestions))}}></circle>
          </svg>
        </div>
        <div className="score-info">
          <h2 style={{color: feedback.color}}>{feedback.title}</h2>
          <p>{feedback.msg}</p>
          <button onClick={() => window.location.reload()} className="btn secondary-btn mt-1">
             Retake Assessment
          </button>
        </div>
      </div>

      <div className="review-area">
        <h3>Detailed Review</h3>
        <div className="review-list">
          {questions.map((q, idx) => {
            const isCorrect = answers[q.id] === q.answer;
            return (
              <div key={q.id} className={`review-card-modern ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="r-header">
                  <span className="r-num">Q{idx + 1}</span>
                  <span className={`r-status-icon`}>{isCorrect ? '✓' : '✗'}</span>
                </div>
                <p className="r-question">{q.text}</p>
                <div className="r-answer-comparison">
                  <div className="r-user">
                    <small>Your Answer</small>
                    <p>{answers[q.id] ? `${answers[q.id]}) ${q.options[answers[q.id]]}` : 'Not Answered'}</p>
                  </div>
                  {!isCorrect && (
                    <div className="r-correct">
                      <small>Correct Answer</small>
                      <p>{q.answer}) {q.options[q.answer]}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultSummary;
