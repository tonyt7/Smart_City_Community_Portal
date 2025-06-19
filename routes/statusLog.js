const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: Fetch status logs with admin usernames
router.get('/', (req, res) => {
  const query = `
    SELECT 
  sl.*, 
  u.username,
  CASE 
    WHEN sl.entry_type = 'issue' THEN i.title
    WHEN sl.entry_type = 'idea' THEN d.title
    ELSE NULL
  END AS entry_title
FROM status_logs sl
JOIN userdb u ON sl.updated_by = u.id
LEFT JOIN issues i ON sl.entry_type = 'issue' AND sl.entry_id = i.id
LEFT JOIN ideas d ON sl.entry_type = 'idea' AND sl.entry_id = d.id
ORDER BY sl.id ASC;

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching status log:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
