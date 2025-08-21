import React, { useState, useEffect} from "react";
import axios from "axios";
import Header from "../components/SimpleHeader";
import Footer from "../components/Footer";
import IdeaMap from "../components/IdeaMap";
import IdeaSubmissionStepsBanner from "./IdeaSubmissionStepsBanner";
import "./SubmitIdeaPage.css";



const user = JSON.parse(localStorage.getItem("user"));





const SubmitIdeaPage = () => {
const [ideas, setIdeas] = useState([]);
const [activeFilter, setActiveFilter] = useState("Vote On");
const filteredIdeas = ideas.filter(idea => idea.status === activeFilter);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.id) return;

  axios.get(`http://localhost:5000/ideas/user-votes/${user.id}`)
      .then(res => {
      console.log("User votes:", res.data); // ✅ Debug this
      setUserVotes(res.data);
    }) // [{idea_id: 1}, ...]
    .catch(err => console.error("Error fetching user votes:", err));
}, []);

useEffect(() => {
  axios.get("http://localhost:5000/ideas/approved")
    .then(res => setIdeas(res.data))
    .catch(err => console.error("Error fetching ideas:", err));
}, []);
  const [idea, setIdea] = useState({
    title: "",
    description: "",
    photo: null,
    location: "",
  });


const [voteData, setVoteData] = useState([]);
const [userVotes, setUserVotes] = useState([]);

useEffect(() => {
  axios.get("http://localhost:5000/ideas/votes")
    .then(res => setVoteData(res.data))
    .catch(err => console.error("Error fetching vote data:", err));
}, []);

const getVotes = (ideaId, type) => {
  const record = voteData.find(v => v.idea_id === ideaId);
  return record ? (type === "upvote" ? record.upvotes : record.downvotes) : 0;
};
const handleVote = async (ideaId, type) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("You must be logged in to vote.");

  try {
    await axios.post(`http://localhost:5000/ideas/${ideaId}/vote`, {
      user_id: user.id,
      vote_type: type,
    });

    // Refresh votes
    const res = await axios.get("http://localhost:5000/ideas/votes");
    setVoteData(res.data);
    setUserVotes(prev => [...prev, { idea_id: ideaId }]);
  } catch (err) {
    alert(err.response?.data?.error || "Voting failed.");
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIdea((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setIdea((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleLocate = () => {
    if (selectedCoords) {
      const [lat, lng] = selectedCoords;
      const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setLocationDisplay(formatted);
    } else {
      alert("Please click a location on the map first.");
    }
  };
  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedCoords) {
    alert("Please select a location on the map.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id) {
    alert("User not logged in.");
    return;
  }

  // 👉 Use FormData to send file + fields
  const formData = new FormData();
  formData.append("title", idea.title);
  formData.append("description", idea.description);
  formData.append("latitude", selectedCoords[0]);
  formData.append("longitude", selectedCoords[1]);
  formData.append("user_id", user.id);

  if (idea.photo) {
    formData.append("image", idea.photo); // 👈 Must match multer field name
  }

  try {
    const res = await axios.post("http://localhost:5000/ideas/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    console.log("Submitted successfully:", res.data);
    alert("Idea submitted for review!");

    setIdea({ title: "", description: "", location: "", photo: null });
    setSelectedCoords(null);
    setLocationDisplay("");
  } catch (err) {
    console.error("Error submitting idea:", err);
    alert("Submission failed. Please try again.");
  }
};
  
  
  
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [locationDisplay, setLocationDisplay] = useState("");
  return (
    <div className="submit-idea-page">
      <Header />
      <main className="submit-main">
        <div className="submit-header">
          <h2>Share Your Smart City Spark!</h2>
          <p>Your ideas can power a better city for everyone.</p>
      <div className="idea-tags">
        <span><i className="material-symbols-rounded">eco</i>Cleaner streets</span>
        <span><i className="material-symbols-rounded">park</i>Safer parks</span>
        <span><i className="material-symbols-rounded">directions_bus</i>Smarter transport</span>
      </div>
      <p>
        Got a vision for cleaner streets, safer parks, smarter transport or anything else?<br></br>
      
        Drop an idea, tag it on the map, and join other's in shaping the future of your city.
        Whether it's a bold innovation or a quick fix every voice matters in building a more connected, inclusive, and responsive community
      </p>
      <p className="voice-impact">
  <i className="material-symbols-rounded">record_voice_over</i>
  <spacer> </spacer> “Your voice = real impact”
</p>

</div>
<IdeaSubmissionStepsBanner />

<div className="ideamap-form-container">
  <div className="ideamap-section">
    <h4>Map of Ideas<i class="fa-regular fa-map"></i> </h4>
    
    <div className="ideamap-instruction">🖱️ Click anywhere on the map to choose a location</div>
    <div className="ideamap-placeholder">
    <IdeaMap onMapClick={(coords) => setSelectedCoords(coords)} selectedCoords={selectedCoords} />


    </div>
      </div>

  <div className="form-section">
  <h3>Submit an Idea <i className="fa-solid fa-file-import"></i></h3>

  {!user && (
    <div className="form-overlay">
      <p className="overlay-message">
        <i className="fa-solid fa-lock"></i> Only registered users can submit ideas.
      </p>
    </div>
  )}

  <form onSubmit={handleSubmit} >
    <input
      type="text"
      name="title"
      placeholder="Title"
      value={idea.title}
      onChange={handleInputChange}
      required
      disabled={!user}
    />
    <textarea
      name="description"
      placeholder="Describe your idea..."
      value={idea.description}
      onChange={handleInputChange}
      required
      disabled={!user}
    />
    <label className="photo-upload">
      <p><i className="fa-solid fa-camera-retro"></i> Upload a photo (optional):</p>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={!user} />
    </label>
    <div className="location-row">
      <button type="button" className="locate-button" onClick={handleLocate} disabled={!user}>
        <i className="fa-solid fa-location-dot"></i> Locate
      </button>
      <input
        type="text"
        readOnly
        placeholder="Latitude, Longitude"
        value={locationDisplay}
        disabled
      />
    </div>
    <button type="submit" className="submit-button" disabled={!user}>
      Submit Idea
    </button>
  </form>
</div>
</div>


<div className="status-filters">
  {["Vote On", "Processing", "Completed", "Future", "Unsuccessful", "Not Plausible"].map(status => (
    <button
      key={status}
      className={`status-button ${activeFilter === status ? "active" : ""}`}
      onClick={() => setActiveFilter(status)}
    >
      {status === "Vote On" && <i className="fas fa-fire"></i>}
      {status === "Processing" && <i className="fas fa-spinner"></i>}
      {status === "Completed" && <i className="fas fa-check-circle"></i>}
      {status === "Future" && <i className="fas fa-lightbulb"></i>}
      {status === "Unsuccessful" && <i className="fas fa-times-circle"></i>}
      {status === "Not Plausible" && <i className="fas fa-ban"></i>}
      {` ${status}`}
    </button>
  ))}
</div>
<div className="idea-list-container">
  <h3>🗳️ {activeFilter} Ideas</h3>
  <div className="idea-card-grid">
    {filteredIdeas.map((idea) => {
      
      const hasVoted = userVotes.some(v => v.idea_id === idea.id);
      const votingOpen = idea.status === "Vote On";
      const votingDisabled = !user|| hasVoted || !votingOpen;

      return (
      <div className="idea-card" key={idea.id}>
        <img src={idea.image_url ? `http://localhost:5000/uploads/${idea.image_url}` : "/placeholder.jpg"} alt="Idea" />
        <div className="idea-info">
          <h4>{idea.title}</h4>
          <p>{idea.description.slice(0, 80)}...</p>
          <p><strong>Status:</strong> <span className={`status-badge status-${idea.status.toLowerCase().replace(" ", "-")}`}>{idea.status}</span></p>
          <p><i className="fa-solid fa-calendar"></i> {new Date(idea.created_at).toLocaleDateString()}</p>
          <div className="votes">
            <div className="tooltip-wrapper">
  <button
  className={`vote-button ${votingDisabled ? 'disabled' : ''}`}
  disabled={votingDisabled}
  onClick={() => handleVote(idea.id, "upvote")}
>
    <i className="fas fa-thumbs-up vote-icon"></i>
    <span className="vote-count">{getVotes(idea.id, "upvote")}</span>
  </button>
  {votingDisabled && !user && <span className="tooltip-text">Login to vote</span>}
  </div>
<div className="tooltip-wrapper">
  <button
  className={`vote-button ${votingDisabled ? 'disabled' : ''}`}
  disabled={votingDisabled}
  onClick={() => handleVote(idea.id, "downvote")}
>
    <i className="fas fa-thumbs-down vote-icon"></i>
    <span className="vote-count">{getVotes(idea.id, "downvote")}</span>
  </button>
  {votingDisabled && !user && <span className="tooltip-text">Login to vote</span>}
  </div>
</div>
        </div>
      </div>
  );
    })}
  </div>
</div>


      </main>
      <Footer />
    </div>
  );
};

export default SubmitIdeaPage;
