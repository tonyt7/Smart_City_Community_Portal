import React from "react";
import "./ReportIssue.css";

const ReportIssue = () => {
  return (
    <section
      className="report-issue-section"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/ReportIssue.png)`,
      }}
    >
      <div className="report-issue-content">
        <h2 className="report-issue-heading">"See Something? Say Something!"</h2>
        <p className="report-issue-description">
          Help us identify and address the challenges in your community. Your feedback makes a difference. Report problems in your neighborhood. Click below to get started!
        </p>
        <button className="report-issue-button">Report an Issue</button>
      </div>
    </section>
  );
};

export default ReportIssue;
