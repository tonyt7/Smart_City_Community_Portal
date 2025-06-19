const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all notifications for a user (with issue/idea title)
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT n.*, 
           COALESCE(i.title, id.title) AS reference_title
    FROM notifications n
    LEFT JOIN issues i ON n.type = 'issue' AND n.reference_id = i.id
    LEFT JOIN ideas id ON n.type = 'idea' AND n.reference_id = id.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});

// Mark a notification as read
router.post('/mark-read/:id', (req, res) => {
  const notificationId = req.params.id;
  const query = 'UPDATE notifications SET read_status = 1 WHERE id = ?';
  db.query(query, [notificationId], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

module.exports = router; // ✅ This is the fix!
