import React, { useState } from 'react';

const AdminPortal = ({ submissions, onExit, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSubmissions = submissions.filter(sub => 
    sub.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="container admin-container glass fade-in">
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">{submissions.length} Total Submissions</p>
        </div>
        <div className="admin-actions">
           <button onClick={onRefresh} className="btn icon-btn" title="Refresh Data">🔄</button>
           <button onClick={exportToCSV} className="btn secondary-btn">Export CSV</button>
           <button onClick={onExit} className="btn primary-btn">Exit Admin</button>
        </div>
      </header>

      <div className="admin-controls glass">
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
                  <span className={`score-badge ${sub.score >= 70 ? 'high' : sub.score >= 50 ? 'mid' : 'low'}`}>
                    {sub.score !== null ? `${sub.score}/100` : '-'}
                  </span>
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
                   <button className="text-btn" onClick={() => alert(JSON.stringify(sub.answers, null, 2))}>
                     View Details
                   </button>
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
    </div>
  );
};

export default AdminPortal;
