import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Header from "../components/SimpleHeader";
import Footer from "../components/Footer";
import './ForumPage.css';

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState("public");
  const [filter, setFilter] = useState("date");
  const [posts, setPosts] = useState([]);
    // 🧠 At the top of your component
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setUserId(storedUser.id); // or storedUser.user_id depending on your login payload
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/forum")
      .then((res) => res.json())
      .then((data) => {
        // Add placeholder likes + comment count = 0 by default
        const postsWithExtras = data.map(post => ({
          ...post,
          likes: Math.floor(Math.random() * 100), // Random for now
          comments: 0,
        }));

        // Fetch comment counts per post
        const fetchCommentCounts = postsWithExtras.map(post =>
          fetch(`http://localhost:5000/api/forum/${post.id}`)
            .then(res => res.json())
            .then(details => ({
              ...post,
              comments: details.comments.length
            }))
        );

        Promise.all(fetchCommentCounts).then(results => {
          setPosts(results);
        });
      })
      .catch((err) => console.error("Error loading forum posts", err));
  }, []);

  // Filter + Sort
  const filteredPosts = posts
    .filter(post => post.type === activeTab)
    .sort((a, b) => {
      if (filter === "likes") return b.likes - a.likes;
      if (filter === "comments") return b.comments - a.comments;
      return new Date(b.created_at) - new Date(a.created_at); // date
    });

  return (
    <>
      <Header />

      {/* Banner Section */}
      <section className="forum-banner">
        <img src="/ForumBanner.jpeg" alt="Forum Banner" className="banner-image" />
      </section>

      {/* Main Forum Section */}
      <main className="forum-main">
        {/* Tabs + Filter */}
        <div className="forum-controls">
          <div className="forum-tabs">
            {["public", "private"].map(tab => (
              <button
                key={tab}
                className={`forum-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="forum-filter">
            <label>Sort by: </label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="date">Date</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
            </select>
          </div>
        </div>

        {/* Forum Post Cards */}
        <div className="forum-grid">
        {filteredPosts.map(post => {
  const isPrivate = post.type === "private";
  const showBlur = isPrivate && !user;

  return (
    <div key={post.id} className="forum-card-wrapper">
    {/* Lock overlay */}
    {showBlur && (
      <div className="lock-overlay">
        🔒
        <span className="lock-tooltip">Registered members only</span>
      </div>
    )}
  
    <Link
      to={showBlur ? "#" : `/forum/${post.id}`}
      className={`forum-card ${showBlur ? "blurred" : ""}`}
      onClick={(e) => { if (showBlur) e.preventDefault(); }}
    >
      <img src={`http://localhost:5000/uploads/${post.image_url}`} alt="Forum Topic" className="forum-thumbnail" />
      <h2 className="forum-title">{post.title}</h2>
      <div className="forum-meta">
      <span>
  <span className="material-symbols-rounded">chat_bubble</span> {post.comments}
</span>
<span>
  <span className="material-symbols-rounded">thumb_up</span> {post.likes}
</span>
      </div>
      <p className="forum-date">on {post.created_at?.substring(0, 10)}</p>
    </Link>
  </div>
  
  );
})}

        </div>

        {user ? (
  <Link to="/forum/new" className="new-post-button">Create New Forum</Link>
) : (
  <div className="new-post-button disabled-button" title="Only registered members can create a forum">
    Create New Forum
  </div>
)}
      </main>

      <Footer />
    </>
  );
}
