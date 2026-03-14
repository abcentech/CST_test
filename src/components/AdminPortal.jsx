import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminPortal = ({ 
  submissions, 
  questions, 
  onExit, 
  onRefresh, 
  onRefreshQuestions,
  onDeleteSubmission,
  onUpdateSubmission,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('submissions'); // submissions, questions
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', options: ['', '', ''], answer: 'A', category: 'General' });

  const filteredSubmissions = submissions.filter(sub => 
    sub.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics Calculation
  const scoreDistribution = [
    { name: '0-49', count: 0, color: '#ef4444' },
    { name: '50-69', count: 0, color: '#f59e0b' },
    { name: '70-89', count: 0, color: '#2563eb' },
    { name: '90-100', count: 0, color: '#10b981' }
  ];

  const categoryPerformance = {};

  submissions.forEach(sub => {
    if (sub.score !== null) {
      if (sub.score < 50) scoreDistribution[0].count++;
      else if (sub.score < 70) scoreDistribution[1].count++;
      else if (sub.score < 90) scoreDistribution[2].count++;
      else scoreDistribution[3].count++;

      if (sub.answers) {
        questions.forEach(q => {
          const cat = q.category || 'General';
          if (!categoryPerformance[cat]) categoryPerformance[cat] = { correct: 0, total: 0 };
          categoryPerformance[cat].total++;
          if (sub.answers[q.id] === q.answer) categoryPerformance[cat].correct++;
        });
      }
    }
  });

  const categoryData = Object.entries(categoryPerformance).map(([name, stats]) => ({
    name,
    score: Math.round((stats.correct / stats.total) * 100)
  }));

  const exportToCSV = () => {
    const headers = ["Candidate", "DOB", "Year Joined", "Score", "Status", "Start Time", "End Time"];
    const rows = submissions.map(sub => [
      sub.candidate_name,
      sub.dob,
      sub.year_joined,
      sub.score || 0,
      sub.status,
      new Date(sub.start_time).toLocaleString(),
      sub.end_time ? new Date(sub.end_time).toLocaleString() : 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KIN_Submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveScore = async (id) => {
    await onUpdateSubmission(id, { score: parseInt(editValue) });
    setEditingId(null);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (currentQuestion.id) {
      await onUpdateQuestion(currentQuestion.id, {
        text: currentQuestion.text,
        options: currentQuestion.options,
        answer: currentQuestion.answer,
        category: currentQuestion.category
      });
    } else {
      await onCreateQuestion({
        ...currentQuestion,
        id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1
      });
    }
    setShowQuestionForm(false);
    setCurrentQuestion({ text: '', options: ['', '', ''], answer: 'A', category: 'General' });
  };

  return (
    <div className="container admin-container glass fade-in">
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <div className="tab-switcher mt-1">
            <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>Submissions</button>
            <button className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>Question Bank</button>
          </div>
        </div>
        <div className="admin-actions">
           <button onClick={activeTab === 'submissions' ? onRefresh : onRefreshQuestions} className="btn icon-btn" title="Refresh Data">🔄</button>
           {activeTab === 'submissions' && <button onClick={exportToCSV} className="btn secondary-btn">Export CSV</button>}
           <button onClick={onExit} className="btn primary-btn">Exit Admin</button>
        </div>
      </header>

      {activeTab === 'submissions' ? (
        <>
          <div className="admin-analytics mt-2">
            <div className="analytics-card glass">
              <h3>Score Distribution</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="analytics-card glass">
              <h3>Average Category Scores (%)</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.1)" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={120} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                      cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="score" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="admin-controls glass mt-2">
            <input 
              type="text" 
              placeholder="Search by candidate name..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-wrapper glass">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? filteredSubmissions.map(sub => (
                  <tr key={sub.id}>
                    <td>
                      <div className="candidate-cell">
                        <span className="name">{sub.candidate_name}</span>
                        <span className="meta">{sub.dob} • Joined {sub.year_joined}</span>
                      </div>
                    </td>
                    <td>
                      {editingId === sub.id ? (
                        <div className="edit-score">
                          <input 
                            type="number" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="small-input"
                          />
                          <button onClick={() => handleSaveScore(sub.id)} className="icon-btn">✅</button>
                        </div>
                      ) : (
                        <span className={`score-badge ${sub.score >= 70 ? 'high' : sub.score >= 50 ? 'mid' : 'low'}`} onClick={() => { setEditingId(sub.id); setEditValue(sub.score || 0); }}>
                          {sub.score !== null ? `${sub.score}/100` : '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-tag ${sub.status}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(sub.start_time).toLocaleDateString()}<br/>
                      <small>{new Date(sub.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="text-btn danger" onClick={() => onDeleteSubmission(sub.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="empty-state">No submissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="admin-controls glass mt-2 flex-spread">
            <input 
              type="text" 
              placeholder="Search questions or categories..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn primary-btn" onClick={() => { setShowQuestionForm(true); setCurrentQuestion({ text: '', options: ['', '', ''], answer: 'A', category: 'General' }); }}>
              Add Question
            </button>
          </div>

          {showQuestionForm && (
            <div className="modal-overlay">
              <div className="modal-content glass">
                <h3>{currentQuestion.id ? 'Edit Question' : 'Add New Question'}</h3>
                <form onSubmit={handleSaveQuestion}>
                  <div className="form-group">
                    <label>Question Text</label>
                    <textarea 
                      value={currentQuestion.text}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input 
                      type="text" 
                      value={currentQuestion.category} 
                      onChange={(e) => setCurrentQuestion({...currentQuestion, category: e.target.value})}
                    />
                  </div>
                  <div className="options-edit">
                    <label>Options</label>
                    {['A', 'B', 'C'].map((opt, i) => (
                      <div key={opt} className="opt-row">
                        <span>{opt}</span>
                        <input 
                          type="text" 
                          value={Array.isArray(currentQuestion.options) ? currentQuestion.options[i] : currentQuestion.options[opt]} 
                          onChange={(e) => {
                            const newOpts = Array.isArray(currentQuestion.options) ? [...currentQuestion.options] : Object.values(currentQuestion.options);
                            newOpts[i] = e.target.value;
                            setCurrentQuestion({...currentQuestion, options: newOpts});
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="form-group mt-1">
                    <label>Correct Answer</label>
                    <select value={currentQuestion.answer} onChange={(e) => setCurrentQuestion({...currentQuestion, answer: e.target.value})}>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  <div className="modal-actions mt-2">
                    <button type="button" className="btn secondary-btn" onClick={() => setShowQuestionForm(false)}>Cancel</button>
                    <button type="submit" className="btn primary-btn">Save Question</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-wrapper glass">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Question</th>
                  <th>Category</th>
                  <th>Correct</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map(q => (
                  <tr key={q.id}>
                    <td className="q-cell">{q.text}</td>
                    <td><span className="cat-badge">{q.category}</span></td>
                    <td><strong>{q.answer}</strong></td>
                    <td>
                      <div className="row-actions">
                        <button className="text-btn" onClick={() => { setCurrentQuestion(q); setShowQuestionForm(true); }}>Edit</button>
                        <button className="text-btn danger" onClick={() => onDeleteQuestion(q.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPortal;
