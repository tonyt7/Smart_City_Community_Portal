import React, { useState , useEffect} from "react";
import axios from "axios";
import './AdminSystemSettings.css';

const AdminSystemSettings = () => {
  const [threshold, setThreshold] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [autoMessage, setAutoMessage] = useState('');
  const [requireLoginToVote, setRequireLoginToVote] = useState(true);
  const [allowSuggestions, setAllowSuggestions] = useState(true);
  const [votingDuration, setVotingDuration] = useState(14);
  const [emailAlerts, setEmailAlerts] = useState(false);
    const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const promoteToAdmin = async (userId) => {
    try {
      await axios.patch(`http://localhost:5000/admin/users/${userId}/promote`);
      alert("User promoted to admin");
      fetchUsers(); // refresh data
    } catch (err) {
      console.error("Error promoting user:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const handleThresholdSave = async () => {
    try {
      await axios.patch("http://localhost:5000/settings/vote_threshold", {
        value: threshold
      });
      alert("Threshold updated");
    } catch (err) {
      console.error("Error updating threshold", err);
    }
  };

  const handleToggleSave = async () => {
    try {
      await axios.patch("http://localhost:5000/settings/auto_approve", {
        value: autoApprove ? "1" : "0",
        message: autoMessage
      });
      alert("Auto-approve setting updated");
    } catch (err) {
      console.error("Error updating toggle", err);
    }
  };

  return (
    <div>
    <div className="user-management-panel">
      <h2>User Management</h2>
      <div className="admin-bar-button-container">
  <button className="admin-bar-button" onClick={() => window.location.href = "/admin"}>
    Back to Admin Dashboard
  </button>
</div>
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Role</th>
            <th>Ideas</th>
            <th>Issues</th>
            <th>Make Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td><strong>{user.username}</strong></td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>
                <span className={`role-pill ${user.Role.toLowerCase()}`}>
                  {user.Role}
                </span>
              </td>
              <td><span className="count-pill">{user.ideas_count}</span></td>
              <td><span className="count-pill">{user.issues_count}</span></td>
              <td>
                {user.Role !== "Admin" && (
                  <button className="promote-btn" onClick={() => promoteToAdmin(user.id)}>
                    Set Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  
    <div className="settings-panel">
      <h2>System Settings</h2>

      <div className="setting-item">
        <label>Idea Voting Default Threshold:</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="e.g. 10"
        />
        <button onClick={handleThresholdSave}>Save</button>
      </div>

      <div className="setting-item">
        <label>Enable Auto-Approval:</label>
        <label className="switch">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={() => setAutoApprove(!autoApprove)}
          />
          <span className="slider round"></span>
        </label>
        <button onClick={handleToggleSave}>Save</button>
      </div>

      {autoApprove && (
        <div className="setting-item">
          <label>Auto-Approval Default Message:</label>
          <textarea
            placeholder="e.g. This idea was auto-approved by system"
            value={autoMessage}
            onChange={(e) => setAutoMessage(e.target.value)}
          />
        </div>
      )}

      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={requireLoginToVote}
            onChange={() => setRequireLoginToVote(!requireLoginToVote)}
          />
          Require login to vote
        </label>
      </div>

      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={allowSuggestions}
            onChange={() => setAllowSuggestions(!allowSuggestions)}
          />
          Allow user suggestions
        </label>
      </div>

      <div className="setting-item">
        <label>Default Voting Duration (days):</label>
        <input
          type="number"
          value={votingDuration}
          onChange={(e) => setVotingDuration(e.target.value)}
          min="1"
        />
      </div>

      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={() => setEmailAlerts(!emailAlerts)}
          />
          Enable email alerts (future)
        </label>
      </div>
    </div>
    </div>
  );
};

export default AdminSystemSettings;
