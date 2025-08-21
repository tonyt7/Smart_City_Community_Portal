import React, { useState, useEffect } from 'react';
import './ReportIssuesPanel.css';

const ReportIssuesPanel = () => {
  const [issues, setIssues] = useState([]);
  const fetchLocationName = async (lat, lon) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    return data.address.city || data.address.town || data.address.village || data.display_name;
  } catch (err) {
    console.error("Location fetch error:", err);
    return `${lat}, ${lon}`;
  }
};
  useEffect(() => {
  const fetchIssues = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/issues/unapproved');
      const data = await res.json();

      const enriched = await Promise.all(
        data.map(async (issue) => {
          const locationName = await fetchLocationName(issue.latitude, issue.longitude);
          return { ...issue, locationName };
        })
      );

      setIssues(enriched);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  fetchIssues();
}, []);
  
  const handleApproval = async (id, approved) => {
    try {
      await fetch(`http://localhost:5000/api/issues/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      setIssues((prev) => prev.filter((issue) => issue.id !== id));
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  return (
    <div className="report-issues-panel">
      <h2>Reported Issues (Approval Required)</h2>
      <div className="admin-bar-button-container">
  <button className="admin-bar-button" onClick={() => window.location.href = "/admin"}>
    Back To Admin Dashboard
  </button>
</div>
      <table className="issues-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Image</th>
            <th>Location</th>
            <th>Date</th>
            <th>Reporter</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.title}</td>
              <td>{issue.description}</td>
              <td>
                {issue.image_path ? (
                  <img
                    src={`http://localhost:5000/uploads/${issue.image_path}`}
                    alt="Issue"
                    style={{ width: '80px', borderRadius: '6px' }}
                  />
                ) : (
                  'No image'
                )}
              </td>
              <td>
  <span className="location-pill">
    <i className="fa-solid fa-location-dot"></i> {issue.locationName}
  </span>
</td>
                            <td>
  <span className="date-pill">{new Date(issue.date_reported).toLocaleString()}</span>
</td>

            <td>
  <div className="reporter-avatar">
    <span className="avatar-circle">{issue.username.charAt(0).toUpperCase()}</span>
    <span className="reporter-name">{issue.username}</span>
  </div>
</td>

              <td className="action-buttons">
                <button className="approve-btn" onClick={() => handleApproval(issue.id, 1)}>Approve</button>
                <button className="reject-btn" onClick={() => handleApproval(issue.id, -1)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportIssuesPanel;
