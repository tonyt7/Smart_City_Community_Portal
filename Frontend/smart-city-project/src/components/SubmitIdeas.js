import React from "react";
import "./SubmitIdeas.css";

const SubmitIdeas = () => {
  return (
    <section
      className="submit-ideas-section"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/SubmitIdeas.jpeg)`,
      }}
    >
      <div className="submit-ideas-content">
        <h2 className="submit-ideas-heading">Submit Your Ideas</h2>
        <p className="submit-ideas-description">
          Got a vision for a better community? Share your innovative ideas and help us shape a smarter city together.
        </p>
        <button className="submit-ideas-button">Share Your Idea</button>
      </div>
    </section>
  );
};

export default SubmitIdeas;
