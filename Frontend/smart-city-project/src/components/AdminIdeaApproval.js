import React, { useEffect, useState } from "react";
import axios from "axios";
import './AdminIdeaApproval.css';

const AdminIdeaApproval = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thresholds, setThresholds] = useState({}); // track per-idea threshold inputs
  const [rejectionState, setRejectionState] = useState({});

  const fetchUnapprovedIdeas = () => {
    axios.get("http://localhost:5000/ideas/unapproved")
      .then(res => setIdeas(res.data))
      .catch(err => console.error("Failed to fetch ideas", err))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    try {
      const threshold = thresholds[id]; // optional input from admin
      await axios.patch(`http://localhost:5000/ideas/${id}/approve`, {
        threshold: threshold ? parseInt(threshold) : undefined
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setIdeas(prev => prev.filter(idea => idea.id !== id));
    } catch (err) {
      console.error("Failed to approve idea", err);
    }
  };
const handleReject = async (ideaId) => {
  const note = rejectionState[ideaId]?.note || "No reason provided";
  try {
    await fetch(`http://localhost:5000/ideas/${ideaId}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    // Remove the idea from UI after rejection
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
  } catch (error) {
    console.error("Error rejecting idea:", error);
  }
};

  useEffect(() => {
    fetchUnapprovedIdeas();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-approval-container">
      <h2>Pending Idea Approvals</h2>
      {ideas.length === 0 ? (
        <p>No unapproved ideas.</p>
      ) : (
        <table className="approval-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Custom Threshold</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea) => (
              <tr key={idea.id}>
                <td>{idea.title}</td>
                <td>{idea.description}</td>
                <td>
                  <span className="capsule user">{idea.username}</span>
                </td>
                <td><span className="capsule date">{new Date(idea.created_at).toLocaleDateString()}</span></td>
                <td>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={thresholds[idea.id] || ""}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, [idea.id]: e.target.value })
                    }
                    style={{ width: "80px" }}
                  />
                </td>
                <td>
  <button onClick={() => handleApprove(idea.id)}>Approve</button>
  <button
    className="reject-button"
    onClick={() =>
      setRejectionState({
        ...rejectionState,
        [idea.id]: { show: true, note: "" }
      })
    }
  >
    Reject
  </button>
  {rejectionState[idea.id]?.show && (
    <div style={{ marginTop: "0.5rem" }}>
      <input
        type="text"
        placeholder="Rejection reason"
        value={rejectionState[idea.id].note}
        onChange={(e) =>
          setRejectionState({
            ...rejectionState,
            [idea.id]: {
              ...rejectionState[idea.id],
              note: e.target.value
            }
          })
        }
        style={{ width: "200px", marginRight: "5px" }}
      />
      <button className="confirm-reject-button" onClick={() => handleReject(idea.id)}>Confirm Reject</button>
    </div>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminIdeaApproval;
