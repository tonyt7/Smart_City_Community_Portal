import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("/default-avatar.png");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedIdeas, setSubmittedIdeas] = useState([]);
  const [reportedIssues, setReportedIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);


  const markAsRead = async (id) => {
  await fetch(`http://localhost:5000/api/notifications/mark-read/${id}`, {
    method: "POST",
  });

  // update frontend state
  setNotifications((prev) =>
    prev.map((n) => (n.id === id ? { ...n, read_status: 1 } : n))
  );
};
useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) {
    setUser(storedUser);
    const picture = storedUser.profile_picture || "placeholder.jpg";
    setProfilePicture(`http://localhost:5000/uploads/${picture}`);
  }
}, []);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${user.id}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  if (user) fetchNotifications();
}, [user]);

  useEffect(() => {
  const fetchReportedIssues = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/issues/user/${user.id}`);
      const data = await res.json();
      setReportedIssues(data);
    } catch (err) {
      console.error("Error fetching reported issues:", err);
    }
  };

  if (user) fetchReportedIssues();
}, [user]);


useEffect(() => {
  const fetchSubmittedIdeas = async () => {
    try {
      const res = await fetch(`http://localhost:5000/ideas/user/${user.id}`);
      const data = await res.json();
      setSubmittedIdeas(data);
    } catch (err) {
      console.error("Failed to fetch submitted ideas", err);
    }
  };

  if (user) fetchSubmittedIdeas();
}, [user]);
const handleProfilePictureChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await fetch(`http://localhost:5000/api/upload-profile/${user.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const newProfilePicPath = `http://localhost:5000/uploads/${data.filename}`;
        setProfilePicture(newProfilePicPath);

        const updatedUser = { ...user, profilePicture: data.filename };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  }
};


  if (!user) return <p>Loading profile...</p>;

  const stats = [
    { label: 'Ideas Submitted', value: 12 },
    { label: 'Issues Reported', value: 5 },
    { label: 'Approved Items', value: 8 },
    { label: 'Rejected Items', value: 2 },
    { label: 'Badges Earned', value: 3 },
  ];

 
  const badges = [
    { label: 'First Idea', icon: '🏅' },
    { label: 'Top Voted', icon: '🔥' },
    { label: 'Community Helper', icon: '🤝' },
  ];


  return (
    
    <div className="user-profile-container">
      <div className="profile-banner">
        <img src="/Profile_Banner_default.jpeg" alt="Profile Background" className="banner-image" />
      </div>

   <div className="profile-header">
  <div className="profile-left">
    <div className="profile-pic-container" onClick={() => setIsModalOpen(true)}>
      <img
  src={
    profilePicture.startsWith('http')
      ? profilePicture
      : `http://localhost:5000/uploads/${profilePicture}`
  }
  alt="Profile"
  className="profile-img"
/>

    </div>
    <div className="profile-info">
      <h2>{user.firstName} {user.lastName}</h2>
      <p className="username">@{user.username}</p>
      <span className="role-tag">{user.role || 'User'}</span>
    </div>
  </div>

  <div className="profile-right">
    <div className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
      <i className="fa-solid fa-bell"></i>
      {notifications.filter(n => !n.read_status).length > 0 && (
        <span className="badge">
          {notifications.filter(n => !n.read_status).length}
        </span>
      )}

      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n, idx) => (
              <div
  key={idx}
  className={`notification-item ${n.read_status ? 'read' : 'unread'}`}
  onClick={() => markAsRead(n.id)}
>
  <div className="notification-header">
    <strong>{n.reference_title || 'Untitled'}</strong>
    <span className="notification-type">{n.type.toUpperCase()}</span>
  </div>
  <p className="notification-message">{n.message}</p>
  <span className="notification-date">
    {new Date(n.created_at).toLocaleString()}
  </span>
</div>
            ))
          )}
        </div>
      )}
    </div>

    <button className="edit-btn">Edit Profile</button>
  </div>
</div>



      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change Profile Picture</h3>
            <img src={profilePicture} alt="Profile" className="enlarged-profile-pic" />
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-tile">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

     <div className="section">
  <h3>Submitted Ideas</h3>
  <div className="card-list">
    {submittedIdeas.map((idea, idx) => (
      <div key={idx} className="info-card">
        <h4 className="idea-title">{idea.title}</h4>
        <p>
          <span className={`status status-${idea.status.toLowerCase().replace(/\s+/g, '-')}`}>
            {idea.status}
          </span>
        </p>
        <p className="idea-date">
          <i className="fa-solid fa-calendar-days icon"></i> Submitted on {idea.date}
        </p>
         {idea.approved === 0 && (
          <p className="pending-approval">
            <i className="fa-solid fa-clock icon"></i> Waiting for admin approval
          </p>
        )}
      </div>
    ))}
  </div>
</div>

<div className="section">
  <h3>Reported Issues</h3>
  <div className="card-list">
    {reportedIssues.map((issue, idx) => (
      <div key={idx} className="info-card">
        <h4 className="idea-title">{issue.title}</h4>
        <p><i className="fa-solid fa-list icon"></i> Category: {issue.category}</p>
        <p>
          <i className="fa-solid fa-circle-info icon"></i>
          Status: 
          <span className={`status status-${issue.status.toLowerCase().replace(/\s+/g, '-')}`}>
            {issue.status}
          </span>
        </p>
        {issue.approved === 0 && (
          <p className="pending-approval">
            <i className="fa-solid fa-clock icon"></i> Waiting for admin approval
          </p>
        )}
      </div>
    ))}
  </div>
</div>



      <div className="section">
        <h3>Badges Earned</h3>
        <div className="badge-list">
          {badges.map((badge, idx) => (
            <div key={idx} className="badge-tile">
              <span className="badge-icon">{badge.icon}</span>
              <p>{badge.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
