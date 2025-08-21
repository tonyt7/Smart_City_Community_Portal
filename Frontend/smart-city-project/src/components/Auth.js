import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // LOGIN REQUEST
        const response = await axios.post("http://localhost:5000/api/login", {
          username: formData.username,
          password: formData.password,
        });

        localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user session
        const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/";
        navigate(redirectTo, { replace: true });
        sessionStorage.removeItem("redirectAfterLogin");
      } else {
        // REGISTER REQUEST
        await axios.post("http://localhost:5000/api/register", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          password: formData.password,
          role: "user",
        });

        alert("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src="/Smart-City-Logo.png" alt="Smart City Logo" className="auth-logo" />
        <h2>Welcome to Smart City Portal</h2>
        <p>Please enter your details</p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
            </>
          )}
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          {isLogin && <a href="/forgot-password" className="forgot-password">Forgot Password?</a>}

          {error && <p className="auth-error">{error}</p>}
          {loading && <p className="auth-loading">Processing...</p>}

          <button type="submit" className="auth-btn">{isLogin ? "Sign In" : "Sign Up"}</button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}  
          <span onClick={() => setIsLogin(!isLogin)}> {isLogin ? "Sign Up" : "Sign In"}</span>
        </p>
      </div>

      <div className="auth-right">
        <img src="/Login_background.png" alt="Authentication Background" />
      </div>
    </div>
  );
};

export default Auth;
