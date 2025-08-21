import { useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import Header from './SimpleHeader';
import Footer from './Footer';
import './ForumPage.css'; // reuse same styling

function ForumDetail() {
  const { id } = useParams();
  const [userId, setUserId] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
   // 🔄 Replace with logged-in user's ID from context or props
  useEffect(() => {
    fetch(`http://localhost:5000/api/forum/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data.post);
        setComments(data.comments);
      })
      .catch(err => console.error("Error fetching post details:", err));
  }, [id]);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        setUserId(storedUser.id); // or storedUser.user_id depending on your login payload
    }
  }, []);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (userId === null) {
      alert("Only registered members can make use of forum communications.");
      return;
    }
  
    fetch(`http://localhost:5000/api/forum/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newComment, user_id: userId }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewComment(""); // Clear input
        // Refresh comments
        return fetch(`http://localhost:5000/api/forum/${id}`)
          .then(res => res.json())
          .then(data => {
            setPost(data.post);
            setComments(data.comments);
          });
      })
      .catch((err) => console.error("Failed to submit comment", err));
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="forum-detail">
      <img src="/forumbg.jpg" alt="Banner" className="banner-image" />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>Created: {post.created_at?.substring(0, 10)}</p>

      <h2>Comments</h2>
      <form onSubmit={handleSubmitComment} className="comment-form">
  <textarea
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    placeholder="Write your comment here..."
    rows={3}
    required
  />
  <button type="submit" disabled={userId === null}>
  Post Comment
</button>
</form>
<div className="comment-list">
  {comments.length === 0 && <p>No comments yet.</p>}
  {comments.map((comment) => (
    <div key={comment.id} className="comment-card">
      <div className="comment-header">
        <img 
          src={comment.profile_picture 
                ? `http://localhost:5000/uploads/${comment.profile_picture}` 
                : "/placeholder.jpg"} 
          alt="User" 
          className="comment-avatar" 
        />
        <strong>{comment.username}</strong>
      </div>
      <p>{comment.content}</p>
      <p className="comment-time">{comment.created_at?.substring(0, 16)}</p>
    </div>
  ))}
</div>
    </div>
    
  );
}

export default ForumDetail;