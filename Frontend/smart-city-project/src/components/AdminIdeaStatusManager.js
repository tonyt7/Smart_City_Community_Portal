import React, { useEffect, useState } from "react";
import axios from "axios";
import './AdminIdeaStatusManager.css';

const AdminIdeaStatus = () => {
  const [ideas, setIdeas] = useState([]);
  const [statusInputs, setStatusInputs] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/ideas/all")
      .then(res => setIdeas(res.data))
      .catch(err => console.error("Error fetching approved ideas:", err));
  }, []);

  const handleChange = (id, field, value) => {
    setStatusInputs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };
  const statusStyles = {
  "Vote On":     { color: "#007bff" },
  "Processing":  { color: "#fd7e14" },
  "Completed":   { color: "#28a745"},
  "Future":      { color: "#6f42c1"},
  "Unsuccessful":{ color: "#dc3545"},
  "Not-Plausible": { color: "#6c757d"}
};
  const handleSave = async (id) => {
    const { newStatus, note } = statusInputs[id] || {};
    if (!newStatus || !note) return alert("Both status and note are required");

    try {
      await axios.patch(`http://localhost:5000/ideas/${id}/status`, {
        status: newStatus,
        message: note
      });

      alert("Status updated!");
    } catch (err) {
      console.error("Error saving status:", err);
    }
  };

  const getVotes = (ideaId, type) => {
    // Optional: if you store votes separately, you'd fetch and join them in backend.
    return ideaId.votes?.filter(v => v.vote_type === type).length || 0;
  };
  const [sortStatus, setSortStatus] = useState("All");
  const filteredIdeas = sortStatus === "All"
               ? ideas
               : ideas.filter(idea => idea.status === sortStatus);
  return (
    <div className="status-table-container">
      <h2>Update Idea Status</h2>
      <button className="admin-bar-button" onClick={() => window.location.href = "/admin"}>
    Back to Admin Dashboard
  </button>
      <div className="sort-dropdown">
  <label htmlFor="sortStatus">Sort by Status: </label>
  <select
    id="sortStatus"
    value={sortStatus}
    onChange={(e) => setSortStatus(e.target.value)}
  >
    <option value="All">All</option>
    <option value="Vote-On">Vote On</option>
    <option value="Processing">Processing</option>
    <option value="Completed">Completed</option>
    <option value="Future">Future</option>
    <option value="Unsuccessful">Unsuccessful</option>
    <option value="Not-Plausible">Not Plausible</option>
  </select>
</div>

      <div className="admin-bar-button-container">
  
</div>

      <table>
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
          
          {filteredIdeas.map(idea => (
            <tr key={idea.id}>
              <td>{idea.title}</td>
              <td>{idea.description}</td>
              <td><i class="fa-regular fa-thumbs-up" style={{ marginRight: "6px" }}></i>{idea.upvotes || 0}</td>
              <td><i class="fa-regular fa-thumbs-down" style={{ marginRight: "6px" }}></i>{idea.downvotes || 0}</td>
              <td>  <span
    style={{
      color: "#fff",
      backgroundColor: statusStyles[idea.status]?.color || "#adb5bd",
      padding: "4px 10px",
      borderRadius: "12px",
      fontWeight: "500",
      fontSize: "13px",
      display: "inline-block"
    }}
  >
    {statusStyles[idea.status]?.label || idea.status}
  </span></td>
              <td>
                <select
                  onChange={e => handleChange(idea.id, 'newStatus', e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Future">Future</option>
                  <option value="Unsuccessful">Unsuccessful</option>
                  <option value="Not-Plausible">Not Plausible</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter a note..."
                  onChange={e => handleChange(idea.id, 'note', e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => handleSave(idea.id)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminIdeaStatus;
