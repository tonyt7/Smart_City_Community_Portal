import React from 'react';
import './ReportIssueSteps.css';

const steps = [
  {
    icon: 'description',
    title: 'Fill Out the Form',
    description: 'Provide the issue details, category, and optional photo',
  },
  {
    icon: 'add_location_alt',
    title: 'Choose Location',
    description: 'Click on the map or use Locate Me to pinpoint it and add to form submission',
  },
  {
    icon: 'send',
    title: 'Submit for Review',
    description: 'Your report is reviewed by an admin before publishing',
  },
  {
    icon: 'map',
    title: 'Published on Map',
    description: 'Approved issues appear with category-based colourcodes and popular icons',
  },
  {
    icon: 'how_to_vote',
    title: 'Vote in Sidebar',
    description: 'Upvote or downvote issues through the scrollable list to get the authorities to respond faster',
  },
  {
    icon: 'notifications_active',
    title: 'Authority Notified',
    description: 'Once enough votes are gathered, the issue is escalated',
  },
];

const ReportIssueSteps = () => {
  return (
    <div className="report-steps-banner">
      <h2>How to Report an Issue <i class="fa-solid fa-bullhorn"></i></h2>
      <div className="report-steps-container">
        {steps.map((step, index) => (
          <div className="report-step-card" key={index}>
            <span className="material-symbols-rounded step-icon">{step.icon}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportIssueSteps;
