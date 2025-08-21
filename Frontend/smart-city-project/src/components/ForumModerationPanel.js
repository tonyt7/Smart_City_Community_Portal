import React, { useEffect, useState } from "react";
import "./ForumModerationPanel.css";
import axios from "axios";

const ForumModerationPanel = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");


  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/forum");
      const filtered = filterType === "all"
        ? res.data
        : res.data.filter(post => post.type === filterType);
      setPosts(filtered);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/forum/${postId}`);
      setComments(res.data.comments);
      setSelectedPostId(postId);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const deletePost = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/forum/${id}`, {
        data: { admin_id: 1 }  // You can fetch this from auth context/localStorage
      });
      fetchPosts();
      setSelectedPostId(null);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/forum/comments/${commentId}`, {
        data: { admin_id: 1 }
      });
      if (selectedPostId) fetchComments(selectedPostId);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };
const handleSaveEdit = async (commentId) => {
  try {
    await axios.put(`http://localhost:5000/api/forum/comments/${commentId}`, {
      content: editContent,
      admin_id: 1  // Or from session
    });
    setEditCommentId(null);
    fetchComments(selectedPostId);
  } catch (err) {
    console.error("Error saving edited comment:", err);
  }
};

  const editComment = async (commentId, newContent) => {
    try {
      await axios.put(`http://localhost:5000/api/forum/comments/${commentId}`, {
        content: newContent,
        admin_id: 1
      });
      fetchComments(selectedPostId);
    } catch (err) {
      console.error("Error editing comment:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterType]);

  return (
    <div className="forum-moderation-panel">
      <h2>Forum Moderation</h2>
      <div className="admin-bar-button-container">
  <button className="admin-bar-button" onClick={() => window.location.href = "/admin"}>
    Back to Admin Page
  </button>
</div>

      <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
        <option value="all">All</option>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>

      <table className="moderation-table">
        <thead>
          <tr>
            <th> Forum Title</th>
            <th>Type</th>
            <th>Author</th>
            <th>Created</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>{post.title}</td>
              <td>
  <span
    className="status-pill"
    style={{
      backgroundColor: post.type === "public" ? "#17a2b8" : "#6c757d",
      color: "#fff"
    }}
  >
    {post.type}
  </span>
</td>
              <td>
  <span className="user-tag">
    <i className="fa-regular fa-user"></i> {post.username}
  </span>
</td>
              <td>
  <span className="timestamp-badge">
    <i className="fa-regular fa-clock"></i> {new Date(post.created_at).toLocaleString()}
  </span>
</td>

              <td>{post.content}</td>
              <td>
  <button className="view-btn" onClick={() => fetchComments(post.id)}>View</button>
  <button className="delete-btn" onClick={() => deletePost(post.id)}>Delete</button>
</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPostId && (
        <div className="comments-section">
          <h3>💬 Comments for Post #{selectedPostId}</h3>
         {comments.map(comment => (
  <div key={comment.id} className="comment-box">
    <div className="comment-header">
  <div className="avatar-circle">{comment.username.charAt(0).toUpperCase()}</div>
  <strong>{comment.username}</strong>
</div>

    {editCommentId === comment.id ? (
      <>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={3}
        />
        <button onClick={() => handleSaveEdit(comment.id)}>💾 Save</button>
        <button onClick={() => setEditCommentId(null)}>❌ Cancel</button>
      </>
    ) : (
      <>
        <p>{comment.content}</p>
        <button onClick={() => {
          setEditCommentId(comment.id);
          setEditContent(comment.content);
        }}>✏️ Edit</button>
        <button onClick={() => deleteComment(comment.id)}>🗑️ Delete</button>
      </>
    )}
  </div>
))}
        </div>
      )}
    </div>
  );
};

export default ForumModerationPanel;
