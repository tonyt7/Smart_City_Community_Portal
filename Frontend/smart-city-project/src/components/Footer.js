import React from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./Footer.css"; // Import the CSS file for styling

const Footer = () => {
  return (
    <footer className="footer" style={{ backgroundImage: "url('/footerbg.jpeg')" }}>
      <div className="footer-container">
        {/* Left Section: Quick Links */}
        <div className="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#report">Report an Issue</a></li>
            <li><a href="#ideas">Submit Ideas</a></li>
            <li><a href="#projects">Community Projects</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Middle Section: Contact Info */}
        <div className="footer-section contact-info">
          <h3>Contact Us</h3>
          <p><i className="fas fa-map-marker-alt"></i> 123 Smart City Street, Techville</p>
          <p><i className="fas fa-envelope"></i> contact@smartcity.com</p>
          <p><i className="fas fa-phone"></i> +1 234 567 890</p>
        </div>

        {/* Right Section: Social Media */}
        <div className="footer-section social-media">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#" target="_blank"><i className="fab fa-facebook-f"></i></a>
            <a href="#" target="_blank"><i className="fab fa-twitter"></i></a>
            <a href="#" target="_blank"><i className="fab fa-instagram"></i></a>
            <a href="#" target="_blank"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom">
        <p>&copy; 2025 Smart City. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
