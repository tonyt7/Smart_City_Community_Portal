import React from "react";
import "./Leaderboard.css";

const dummyLeaders = [
  { name: "Alice Smith", reports: 18, badge: "🏅 Helpful Citizen" },
  { name: "John Doe", reports: 12, badge: "🥈 Consistent Reporter" },
  { name: "Priya Patel", reports: 9, badge: "🌟 First Reporter" },
  { name: "Carlos Reyes", reports: 7, badge: "🛠️ Quick Spotter" },
  { name: "Lina Zhou", reports: 6, badge: "🔍 Keen Observer" },
];

const Leaderboard = () => {
  return (
    <section className="leaderboard-container">
      <h2>🏆 Top Contributors</h2>
      <p>Celebrating our most active community reporters</p>
      <ul className="leaderboard-list">
        {dummyLeaders.map((user, index) => (
          <li key={index} className="leaderboard-item">
            <div className="rank-badge">#{index + 1}</div>
            <div className="leader-info">
              <h3>{user.name}</h3>
              <p>{user.reports} reports • {user.badge}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Leaderboard;
