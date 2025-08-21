import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./SimpleHeader";
import Footer from "./Footer";
import './ForumPage.css'; // Or separate CSS if needed

export default function CreateForumPost() {
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    type: "public",
    content: "",
    image: null
  });
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        setUserId(storedUser.id); // or storedUser.user_id depending on your login payload
    }
  }, []);
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    setForm(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    formData.append("content", form.content);
    formData.append("user_id", userId); // Replace with actual logged-in user ID
  
    if (form.image) {
      formData.append("image", form.image);
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/forum", {
        method: "POST",
        body: formData,
      });
  
      // ✅ Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
  
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("✅ Forum post created:", data);
        navigate("/forum");
      } else {
        console.error("❌ Unexpected response type:", await response.text());
      }
    } catch (error) {
      console.error("🚨 Network error:", error);
    }
  };
  
  return (
    <>
      <Header />

      <div className="forum-form-container">
      
        <h2><i class="fa-regular fa-lightbulb"></i>Create a New Forum Idea</h2>
        <form onSubmit={handleSubmit} className="forum-form" encType="multipart/form-data">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
          />

          <label>Type:</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <label>Description:</label>
          <textarea
            name="content"
            required
            rows={5}
            value={form.content}
            onChange={handleChange}
          />

          <label>Image (optional):</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />

          <button type="submit">Submit Idea</button>
        </form>
      </div>

      <Footer />
    </>
  );
}
