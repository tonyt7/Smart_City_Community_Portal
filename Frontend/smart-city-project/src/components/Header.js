import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css"; // Import CSS file
import "./Hero.css"; // Import the CSS file for styling
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

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

  // Detect Scroll for Sticky Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth"); // Redirect to login
  };

  return (
    <div className="header-hero" style={{ backgroundImage: "url('/Smart_City_Header.jpeg')" }}>
      {/* Header Section */}
      <header className={`header ${isSticky ? "sticky" : ""}`}>
        <div className="logo">
          <img src="/Smart-City-Logo.png" alt="Logo" />
        </div>
        <nav className={`nav-menu ${isSticky ? "sticky" : ""}`}>
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
              <button className="login-button" onClick={() => navigate("/auth")}>Login</button>
              <button className="register-button" onClick={() => navigate("/auth")}>Register</button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="highlight">Empowering Local Communities to Shape Their City</span>
          </h1>
          <div className="hero-buttons">
            <button className="hero-button report-issue">
              <i className="fas fa-exclamation-circle"></i> Report an Issue
            </button>
            <button className="hero-button submit-idea">
              <i className="fas fa-lightbulb"></i> Submit an Idea
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;
