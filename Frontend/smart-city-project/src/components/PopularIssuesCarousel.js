import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PopularIssuesCarousel.css";

const PopularIssuesCarousel = () => {
  const [popularIssues, setPopularIssues] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/issues/popular")
      .then(res => setPopularIssues(res.data))
      .catch(err => console.error("Error fetching popular issues:", err));
  }, []);

  return (
    <div className="popular-carousel-container">
      <h3>Most Popular</h3>
      <div className="carousel-scroll">
        {popularIssues.map((issue) => (
          <div className="popular-issue-card" key={issue.id}>
            <h4>{issue.title}</h4>
            <p className="issue-desc">{issue.description}</p>
            <div className="vote-stats">
             <span><i className="fas fa-thumbs-up"></i> {issue.upvotes}</span>
              <span><i className="fas fa-thumbs-down"></i> {issue.downvotes}</span>
              <span className={`status ${issue.status.toLowerCase().replace(" ", "-")}`}>{issue.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularIssuesCarousel;
