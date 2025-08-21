import React, { useState,useEffect } from "react";
import axios from "axios";
import "./ReportForm.css";

const ReportForm = ({ latLng, onLocateMe, onSubmit, scrollToMap  }) => {
      // 🧠 At the top of your component
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    location_text: "",
    category: "",
    description: "",
    reporter_id: null, // ✅ Replace with logged-in user ID from auth context or localStorage
    latitude:  "",   // Optional: Replace with real values if available
    longitude: "",
  });



  const [image, setImage] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

// Load user ID from localStorage
useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) {
    setUser(storedUser);
    setFormData((prev) => ({
      ...prev,
      reporter_id: storedUser.id || storedUser.user_id // adjust based on your login structure
    }));
  }
}, []);

// Sync latLng updates from map
  useEffect(() => {
    if (latLng?.lat && latLng?.lng) {
      setFormData((prev) => ({
        ...prev,
        latitude: latLng.lat,
        longitude: latLng.lng
      }));
    }
  }, [latLng]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (image) {
      data.append("image", image);
    }

    try {
      
      const res = await fetch("http://localhost:5000/api/issues/report/submit", {
        method: "POST",
        body: data
      });
      setSuccessMsg("✅ Issue reported successfully!");
      setFormData({ title: "", location_text: "", category: "", description: "", reporter_id: user?.id || user?.user_id, latitude: "", longitude: "" });
      setImage(null);
      setTimeout(() => {
        window.location.reload(); // 💥 Refresh the whole page
      }, 1000);
    } catch (err) {
      console.error("❌ Error submitting issue:", err);
      alert("Something went wrong while submitting.");
    }
  };

  return (
    <div className="report-form-container">
      <h2>
        <span className="material-symbols-rounded issue_report_icon">edit_location_alt</span> Report an Issue
      </h2>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title of Issue</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="E.g. Streetlight not working" required />
        </div>
        <div className="form-row">
        <div className="form-group">
        <label>Locate on Map</label>
        <div className="map-locate-group">
          <input type="text" placeholder="Click locate or enter lat/lng" value={`${latLng.lat}, ${latLng.lng}`} readOnly />
          <button type="button" className="locate-btn" onClick={scrollToMap}>
            <span className="material-symbols-rounded">my_location</span> Locate Me
          </button>
        </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select...</option>
            <option>Pothole</option>
            <option>Broken Streetlight</option>
            <option>Fly Tipping</option>
            <option>Graffiti</option>
            <option>Other</option>
          </select>
        </div>
  </div>
        <div className="form-group">
          <label>Describe the Problem</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Add helpful details" required></textarea>
        </div>

        <div className="form-group photo-upload">
  <label htmlFor="photo">Attach a Photo <span className="optional-text">(optional)</span></label>
  <div className="photo-input-wrapper">
    <label htmlFor="photo" className="file-btn">
      <span className="material-symbols-rounded">upload</span> Upload
    </label>
    <input type="file" id="photo" className="file-input" onChange={(e) => setImage(e.target.files[0]?.name || 'No file chosen')}/>
    <span className="file-name">{image}</span>
  </div>
</div>

        <button type="submit" className="submit-btn">Submit Report</button>

        {successMsg && <p style={{ color: "green", marginTop: "10px" }}>{successMsg}</p>}
      </form>
    </div>
  );
};

export default ReportForm;
