import React, { useEffect, useState } from 'react';
import './StatusLog.css';

const StatusLog = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/status-log');
        const data = await res.json();
        const sortedData = data.sort((a, b) => a.id - b.id); // ASC sort by ID
        setLogs(sortedData);
        setFilteredLogs(sortedData);
      } catch (error) {
        console.error('Failed to load status logs:', error);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.entry_type === filterType);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.new_status === filterStatus);
    }
    setFilteredLogs(filtered);
  }, [filterType, filterStatus, logs]);

  const uniqueStatuses = [...new Set(logs.map(log => log.new_status))];

  return (
    <div className="status-log-container">
      <h2>Status Change Log</h2>
      <div className="admin-bar-button-container">
  <button className="admin-bar-button" onClick={() => window.location.href = "/admin"}>
    Back To Admin Dashboard
  </button>
</div>


      <div className="status-log-filters">
        <label>
          Filter by Type:
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="issue">Issue</option>
            <option value="idea">Idea</option>
          </select>
        </label>

        <label>
          Filter by Status:
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            {uniqueStatuses.map((status, idx) => (
              <option key={idx} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      <table className="status-log-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Entry ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Note</th>
            <th>Updated By</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.entry_id}</td>
              <td>{log.entry_title || '-'}</td>
              <td>
  <span className={`status-pill status-${log.new_status.toLowerCase().replace(/\s/g, '')}`}>
    {log.new_status}
  </span>
</td>
              <td>{log.note}</td>
              <td>
  <span className="user-pill">{log.username}</span>
</td>
              <td>
  <span className="date-pill">{new Date(log.updated_at).toLocaleString()}</span>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatusLog;
