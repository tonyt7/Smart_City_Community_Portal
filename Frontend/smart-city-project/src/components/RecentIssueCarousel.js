import React, { useEffect, useState } from "react";
import "./RecentIssuesCarousel.css";
import Slider from 'react-slick';
import axios from "axios";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const RecentIssuesCarousel = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/issues/approved");
        setIssues(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    fetchIssues();
  }, []);

  const settings = {
    dots: true,
    customPaging: () => <div className="custom-dot" />,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ],
  };

  return (
    <div className="issues-carousel-container">
      <h3>Most Recent</h3>
      <Slider {...settings}>
        {issues.map((issue) => (
          <div key={issue.id} className="slide-wrapper">
            <div className="issue-card">
              <img
  src={
    issue.image_path
      ? `http://localhost:5000/uploads/${issue.image_path}`
      : "/placeholder.jpg"
  }
  alt={issue.title}
  className="issue-image"
/>      
               <div className="issue-content">
                <h4>{issue.title}</h4>
                <p className="issue-date">{new Date(issue.date_reported).toLocaleDateString()}</p>
                <p className="issue-description">{issue.description}</p>
                <span className={`status-badge status-${issue.status.toLowerCase().replace(' ', '-')}`}>
  {issue.status}
</span>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RecentIssuesCarousel;
