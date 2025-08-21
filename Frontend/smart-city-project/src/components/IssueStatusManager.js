import React, { useState, useEffect } from 'react';
import './IssueStatusManager.css';

const IssueStatusManager = () => {
  const [issues, setIssues] = useState([]);
  const [statusNote, setStatusNote] = useState({});
  const [statusSelect, setStatusSelect] = useState({});

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/issues/all');
        const data = await res.json();
        setIssues(data);
      } catch (error) {
        console.error('Error fetching approved issues:', error);
      }
    };
    fetchIssues();
  }, []);
  const statusColors = {
  "Open": "#f70d1a",          // red
  "In-Review": "#ffc107",     // yellow
  "In-Progress": "#ffc107",   // optional alias
  "Resolved": "#28a745",      // green
};
  const handleStatusUpdate = async (id) => {
    const newStatus = statusSelect[id];
    const note = statusNote[id] || '';
    try {
      await fetch(`http://localhost:5000/api/issues/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, note }),
      });
      alert('Status updated and logged!');
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  return (
    <div className="issue-status-manager">
      <h2>Update Issue Status</h2>
      <div className="admin-bar-button-container">
  <button className="admin-bar-button" onClick={() => window.location.href = "/admin"}>
    Back to Admin Dashboard
  </button>
</div>

      <table className="status-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Upvotes</th>
            <th>Downvotes</th>
            <th>Current Status</th>
            <th>New Status</th>
            <th>Status Note</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.title}</td>
              <td>{issue.description}</td>
               <td><i class="fa-regular fa-thumbs-up" style={{ marginRight: "6px" }}></i>{issue.upvotes || 0}</td>
              <td><i class="fa-regular fa-thumbs-down" style={{ marginRight: "6px" }}></i>{issue.downvotes || 0}</td>
              <td>
  <span
    className="status-pill"
    style={{ backgroundColor: statusColors[issue.status] || "#6c757d" }}
  >
    {issue.status}
  </span>
</td>
              <td>
                <select
                  value={statusSelect[issue.id] || issue.status}
                  onChange={(e) =>
                    setStatusSelect({ ...statusSelect, [issue.id]: e.target.value })
                  }
                >
                  <option value="Open">Open</option>
                  <option value="In-Review">In Review</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter a note..."
                  value={statusNote[issue.id] || ''}
                  onChange={(e) =>
                    setStatusNote({ ...statusNote, [issue.id]: e.target.value })
                  }
                />
              </td>
              <td>
                <button
                  className="update-status-btn"
                  onClick={() => handleStatusUpdate(issue.id)}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssueStatusManager;
