import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import "./Stats.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Stats = () => {
  // Summary card data
  const summary = [
    { label: "Issues Reported", value: 120 },
    { label: "Ideas Submitted", value: 85 },
    { label: "Projects Active", value: 32 }
  ];

  // Pie chart data
  const issueCategoryData = {
    labels: ["Pothole", "Streetlight", "Graffiti", "Water Leak"],
    datasets: [
      {
        data: [40, 30, 10, 15],
        backgroundColor: ["#009990", "#3d3e41", "#f0f1f4", "#06202B"],
        borderWidth: 0
      }
    ]
  };

  const ideaStatusData = {
    labels: ["Vote On 🔥", "Completed ✅", "Future 💡", "Unsuccessful ❌"],
    datasets: [
      {
        data: [25, 30, 20, 10],
        backgroundColor: ["#007bff", "#28a745", "#6f42c1", "#dc3545"],
        borderWidth: 0
      }
    ]
  };

  // Pie chart display options
  const pieOptions = {
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#06202B"
        }
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Summary Cards */}
      <div className="summary-cards">
        {summary.map((item, idx) => (
          <div key={idx} className="summary-card">
            <p className="summary-label">{item.label}</p>
            <p className="summary-value">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Donut Charts Section */}
      <div className="donut-section">
        <div className="donut-chart">
          <Pie data={issueCategoryData} options={pieOptions} />
          <div className="center-text">Issue Types</div>
        </div>
        <div className="donut-chart">
          <Pie data={ideaStatusData} options={pieOptions} />
          <div className="center-text">Idea Statuses</div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="recent-activity">
        <h4>Recent Activity</h4>
        <ul>
          <li>✅ Jane submitted an idea for bike lanes</li>
          <li>🔧 Road pothole on Main St marked resolved</li>
          <li>🔥 Voting opened on community Wi-Fi proposal</li>
        </ul>
      </div>
    </div>
  );
};

export default Stats;
