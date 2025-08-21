import React, { useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
import "./StatsWidget.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const StatsWidget = () => {
  const [activeChart, setActiveChart] = useState("summary");
  const [typeData, setTypeData] = useState(null);
  const [resolvedMonthData, setResolvedMonthData] = useState(null);
  const [weeklyIssuesData, setWeeklyIssuesData] = useState(null);

  useEffect(() => {
  fetch("http://localhost:5000/api/issues/stats/issues")
    .then((res) => res.json())
    .then((data) => {
      console.log("📊 Fetched stats data:", data);

      // Convert byCategory array to labels and values
      const typeLabels = data.byCategory.map(item => item.category);
      const typeCounts = data.byCategory.map(item => item.count);

      setTypeData({
        labels: typeLabels,
        datasets: [{
          label: "Total Issues by Type",
          data: typeCounts,
          backgroundColor: ["#009990", "#3d3e41", "#f0f1f4", "#06202B", "#B8DEDB", "#FFA07A", "#A9A9A9"]
        }]
      });

      // Parse resolution summary
      const { resolved = 0, pending = 0 } = data.monthStatus;
      setResolvedMonthData({
        labels: ["Resolved", "Pending"],
        datasets: [{
          label: "Resolution Status",
          data: [parseInt(resolved), parseInt(pending)],
          backgroundColor: ["#009990", "#f0f1f4"]
        }]
      });

      // Weekly chart (defaults 4 weeks, fill empty)
      const weeklyRaw = data.week || [];
      const weekMap = Object.fromEntries(weeklyRaw.map(w => [w.week_number, w.total_issues]));

      const fullWeeklyData = [1, 2, 3, 4].map(week => weekMap[week] || 0);

      setWeeklyIssuesData({
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [{
          label: "Issues Reported",
          data: fullWeeklyData,
          borderColor: "#06202B",
          backgroundColor: "#06202B",
          fill: false,
          tension: 0.4
        }]
      });
    })
    .catch(err => {
      console.error("❌ Error loading stats:", err);
    });
}, []);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#06202B" } },
      title: { display: false }
    }
  };

  return (
    <div className="stats-widget-dashboard" style={{ display: "flex", padding: "2rem", background: "#7AE2CF", borderRadius: "16px", gap: "2rem", height: "400px", overflow: "hidden" }}>
      <div className="chart-sidebar" style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
        <button className={`chart-btn ${activeChart === "summary" ? "active" : ""}`} onClick={() => setActiveChart("summary")}>Issue Summary</button>
        <button className={`chart-btn ${activeChart === "weekly" ? "active" : ""}`} onClick={() => setActiveChart("weekly")}>Weekly Reported</button>
      </div>

      <div className="chart-display" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        {activeChart === "summary" && typeData && resolvedMonthData && (
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
            <div style={{ flex: 1, maxWidth: "50%", height: "100%", position: "relative" }}>
              <h4 style={{ color: "#06202B", textAlign: "center" }}>Total Issues by Type</h4>
              <Pie data={{ ...typeData, datasets: [{ ...typeData.datasets[0], cutout: "70%" }] }} options={chartOptions} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: "8rem", color: "#06202B" }}></i>
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: "50%", height: "100%", position: "relative" }}>
              <h4 style={{ color: "#06202B", textAlign: "center" }}>Resolved This Month</h4>
              <Pie data={{ ...resolvedMonthData, datasets: [{ ...resolvedMonthData.datasets[0], cutout: "70%" }] }} options={chartOptions} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <i className="fas fa-check-circle" style={{ fontSize: "8rem", color: "#06202B" }}></i>
              </div>
            </div>
          </div>
        )}

        {activeChart === "weekly" && weeklyIssuesData && (
          <div style={{ minWidth: "600px", width: "100%", height: "100%" }}>
            <h4 style={{ color: "#06202B", textAlign: "center" }}>Weekly Reports</h4>
            <Line data={weeklyIssuesData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsWidget;
