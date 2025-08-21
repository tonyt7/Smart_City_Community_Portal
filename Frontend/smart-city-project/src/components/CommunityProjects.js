import React from "react";
import Slider from "react-slick";
import "./CommunityProjects.css"; // Import the CSS file
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const CommunityProjects = () => {
  const projects = [
    {
      id: 1,
      title: "Green Spaces Initiative",
      description: "Creating more green parks and gardens in urban areas.",
      image: "/green_space.jpeg",
    },
    {
      id: 2,
      title: "Smart Traffic System",
      description: "Implementing AI-powered traffic lights for smooth flow.",
      image: "smart_traffic.jpeg",
    },
    {
      id: 3,
      title: "Waste Management Reform",
      description: "Developing an efficient waste recycling program.",
      image: "/waste_management.jpeg",
    },
    {
      id: 4,
      title: "Energy Conservation Drive",
      description: "Promoting renewable energy use in local communities.",
      image: '/energy_conservation.jpeg',
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0",
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1064, // Mobile view (adjust based on screen size)
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
<div className="community-projects">
  <h2 className="community-heading">Community Projects</h2>
  <Slider {...settings}>
    {projects.map((project) => (
      <div key={project.id} className="project-card">
        <img src={project.image} alt={project.title} className="project-image" />
               {console.log(project.image)}
        <div className="project-overlay">
          <div className="project-content">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <button className="view-more">View More</button>
          </div>
        </div>
      </div>
    ))}
  </Slider>
</div>
  );
};

export default CommunityProjects;
