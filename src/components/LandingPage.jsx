import React from 'react';

const LandingPage = ({ userInfo, setUserInfo, onStart, onAdminAccess, theme, toggleTheme }) => {
  return (
    <div className="container form-container glass fade-in">
      <div className="brand-header">
        <div className="theme-toggle-container">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <h1 className="brand-logo">KidsInspiring Nation</h1>
        <p className="subtitle">100-Question Training Assessment</p>
      </div>
      
      <div className="landing-content">
        <div className="info-card glass">
          <h3>Welcome, Candidate</h3>
          <p>This assessment evaluation consists of 100 questions covering the core principles of KIN. You will have approximately 16 minutes to complete it.</p>
        </div>

        <form onSubmit={onStart} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name" 
              type="text" 
              placeholder="e.g. John Doe"
              value={userInfo.name}
              onChange={e => setUserInfo({...userInfo, name: e.target.value})}
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="dob">Date of Birth</label>
              <input 
                id="dob" 
                type="date" 
                value={userInfo.dob}
                onChange={e => setUserInfo({...userInfo, dob: e.target.value})}
                required 
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="yearJoined">Year Joined KIN</label>
              <input 
                id="yearJoined" 
                type="number" 
                min="2000"
                max="2030"
                placeholder="2024"
                value={userInfo.yearJoined}
                onChange={e => setUserInfo({...userInfo, yearJoined: e.target.value})}
                required 
              />
            </div>
          </div>
          <button type="submit" className="btn primary-btn large pulse-on-hover">
            Begin Assessment
          </button>
        </form>
      </div>

      <div className="admin-access-footer">
        <button onClick={onAdminAccess} className="link-btn">
          Access Admin Dashboard
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
