import React from 'react';
import './IdeaSubmissionStepsBanner.css';

const steps = [
  {
    icon: 'edit',
    title: 'Fill Out the Form',
    description: 'Provide your idea, title, and details',
  },
  {
    icon: 'pin_drop',
    title: 'Click on the Map',
    description: 'Select a location for your idea',
  },
  {
    icon: 'my_location',
    title: 'Use "Locate Me"',
    description: 'Auto-fill your coordinates',
  },
  {
    icon: 'image',
    title: 'Optional Image',
    description: 'Upload an image to support your idea',
  },
  {
    icon: 'rocket_launch',
    title: 'Submit for Review',
    description: 'Admin will validate your idea',
  },
  {
    icon: 'whatshot',
    title: 'Vote and Status',
    description: 'Others vote; status shown after 2 weeks',
  },
];

const IdeaSubmissionStepsBanner = () => {
  return (
    <div className="idea-steps-banner">
      <h2>How to submit your ideas <i class="fa-regular fa-lightbulb"></i></h2>
      <div className="idea-steps-container">
        {steps.map((step, index) => (
          <div className="idea-step-card" key={index}>
            <span className="material-symbols-rounded step-icon">{step.icon}</span>
            <div className="step-number">{index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdeaSubmissionStepsBanner;
