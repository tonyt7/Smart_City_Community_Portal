import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css"; // Import CSS file
import '@fortawesome/fontawesome-free/css/all.min.css';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

 // Inside your component:
const location = useLocation();

const handleLoginClick = () => {
  // Save the current path in session storage
  sessionStorage.setItem("redirectAfterLogin", location.pathname);
  navigate("/auth");
};
  // Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem("user"); // Clear corrupted data
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth"); // Redirect to login
  };

  return (
    <div>
      <header className="simple-header">
        <div className="logo">
          <img src="/Smart-City-Logo.png" alt="Logo" />
        </div>
        <nav className="nav-menu">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/report">Report an Issue</a></li>
            <li><a href="/submit">Submit Ideas</a></li>
            <li><a href="#projects">Community Projects</a></li>
            <li><a href="/forum">Forum</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </nav>

        {/* Auth Buttons / Profile Avatar */}
        <div className="auth-section">
          {user ? (
            <div className="user-profile" onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
              <img
  src={
    user.profile_picture
      ? `http://localhost:5000/uploads/${user.profile_picture}`
      : "/placeholder.jpg"
  }
  alt="User Avatar"
  className="user-avatar"
/>
                {showMenu && (
                <div className="profile-menu">
                  <p>Hi, {user.firstName}!</p>
                  <ul>
                    
                    <li onClick={() => navigate("/settings")}>Settings</li>
                    <li onClick={() => navigate(`/profile/${user.username}`)}>Personal Profile</li>
                    {user.Role === 'Admin' && (
  <li onClick={() => navigate("/admin")}>Admin Dashboard</li>
)}
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
             )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-button" onClick={handleLoginClick}>Login</button>
              <button className="register-button" onClick={() => navigate("/auth")}>Register</button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default SimpleHeader;
