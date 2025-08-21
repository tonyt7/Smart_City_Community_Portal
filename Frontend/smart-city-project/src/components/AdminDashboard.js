import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  FaHome,
  FaLightbulb,
  FaBug,
  FaUsers,
  FaCog,
  FaChartBar
} from 'react-icons/fa';

import './AdminDashboard.css';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

// Dummy component imports
const ManageIdeas = () => <div>Manage Ideas Component</div>;
const IdeaStatus = () => <div>Idea Status Component</div>;
const ManageIssues = () => <div>Manage Issues Component</div>;
const IssueStatus = () => <div>Issue Status Component</div>;
const ForumModeration = () => <div>Forum Moderation Component</div>;
const SystemSettings = () => <div>System & User Settings Component</div>;

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.Role !== 'Admin') {
      navigate('/unauthorized');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const menuItems = [
    { label: 'Dashboard', icon: <FaChartBar />, route: '/admin' },
    { label: 'Manage Ideas', icon: <FaLightbulb />, route: '/admin/ideas' },
    { label: 'Idea Status', icon: <FaLightbulb />, route: '/admin/ideas/status' },
    { label: 'Manage Issues', icon: <FaBug />, route: '/admin/issues' },
    { label: 'Issue Status', icon: <FaBug />, route: '/admin/issues/status' },
    { label: 'Forum Moderation', icon: <FaUsers />, route: '/admin/users' },
    { label: 'System & User Settings', icon: <FaCog />, route: '/admin/settings' },
    { label: 'Status Logs', icon: <FaChartBar />, route: '/admin/logs' },
    { label: 'Home', icon: <FaHome />, route: '/' }
  ];

  const tileData = [
    {
      key: 'totalIssues',
      label: 'Total Issues',
      data: {
        labels: ['Pothole', 'Graffiti', 'Other'],
        datasets: [{
          label: 'Issues by Category',
          data: [20, 15, 23],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      },
      type: 'bar'
    },
    {
      key: 'pendingIssues',
      label: 'Pending Issues',
      data: {
        labels: ['Pending', 'Others'],
        datasets: [{
          data: [12, 46],
          backgroundColor: ['#FFCE56', '#E0E0E0']
        }]
      },
      type: 'pie',
      percentage: '21%'
    },
    {
      key: 'resolvedIssues',
      label: 'Resolved Issues',
      data: {
        labels: ['Resolved', 'Others'],
        datasets: [{
          data: [34, 24],
          backgroundColor: ['#4BC0C0', '#E0E0E0']
        }]
      },
      type: 'pie',
      percentage: '59%'
    },
    {
      key: 'totalIdeas',
      label: 'Total Ideas',
      data: {
        labels: ['Vote-on', 'Processing', 'Completed', 'Unsuccessful', 'Future', 'Not Plausible'],
        datasets: [{
          label: 'Ideas by Stage',
          data: [10, 8, 10, 5, 7, 5],
          backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0', '#9966FF', '#FFCE56', '#C9CBCF']
        }]
      },
      type: 'bar'
    },
    {
      key: 'completedIdeas',
      label: 'Completed Ideas',
      data: {
        labels: ['Completed', 'Others'],
        datasets: [{
          data: [30, 15],
          backgroundColor: ['#36A2EB', '#E0E0E0']
        }]
      },
      type: 'pie',
      percentage: '67%'
    }
  ];

  const AdminStatsDashboard = () => (
  <div className="stats-overview">
    <div className="stat-grid">
      {tileData.map((tile) => (
        <div
          key={tile.key}
          className="stat-box"
          tabIndex="0"
          role="button"
          aria-label={`View ${tile.label} chart`}
          onClick={() => setSelectedTile(tile.key)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setSelectedTile(tile.key);
          }}
        >
          <h4>{tile.label}</h4>
          <strong>Click to view</strong>
        </div>
      ))}
    </div>

    {selectedTile && (
      <div className="charts-container" aria-live="polite">
        <h3>{tileData.find(t => t.key === selectedTile)?.label} Chart</h3>
        {tileData.find(t => t.key === selectedTile)?.type === 'pie' ? (
          <Pie data={tileData.find(t => t.key === selectedTile).data} />
        ) : (
          <Bar data={tileData.find(t => t.key === selectedTile).data} />
        )}
        {tileData.find(t => t.key === selectedTile)?.percentage && (
          <p className="chart-percentage">{tileData.find(t => t.key === selectedTile).percentage} of total</p>
        )}
      </div>
    )}

    {!selectedTile && (
      <div className="charts-container" aria-live="polite">
        <div className="chart-box">
          <h3>User Engagement (by Day)</h3>
          <Line
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  label: 'Users',
                  data: [20, 35, 25, 40, 30, 15, 10],
                  fill: false,
                  borderColor: '#8884d8',
                  tension: 0.1
                }
              ]
            }}
          />
        </div>
      </div>
    )}
  </div>
);
  return (
    <div className="admin-wrapper">
  <aside className="admin-sidebar fixed-sidebar" role="navigation" aria-label="Admin Sidebar Navigation">
    <div className="logo">Admin Panel</div>
    <ul className="sidebar-menu">
      {menuItems.map((item, index) => (
        <li
          key={index}
          className={location.pathname === item.route ? 'active' : ''}
          tabIndex="0"
          role="button"
          aria-label={`Navigate to ${item.label}`}
          onClick={() => navigate(item.route)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate(item.route);
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  </aside>

  <aside className="admin-main-container">
    <main className="admin-main" id="mainContent">
      <Routes>
        <Route index element={<AdminStatsDashboard />} />
        <Route path="ideas" element={<ManageIdeas />} />
        <Route path="ideas/status" element={<IdeaStatus />} />
        <Route path="issues" element={<ManageIssues />} />
        <Route path="issues/status" element={<IssueStatus />} />
        <Route path="users" element={<ForumModeration />} />
        <Route path="settings" element={<SystemSettings />} />
      </Routes>
    </main>
  </aside>
</div>

  );
};

export default AdminDashboard;
