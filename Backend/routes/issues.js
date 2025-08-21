const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");



// 📁 Multer config for image upload
const storage = multer.diskStorage({
  destination: "./uploads", // ensure this folder exists
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// GET top 5 most upvoted issues
router.get("/popular", (req, res) => {
  const query = `
       SELECT 
      i.id,
      i.title,
      i.description,
      i.status,
      COALESCE(SUM(CASE WHEN v.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvotes,
      COALESCE(SUM(CASE WHEN v.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvotes
    FROM issues i
    LEFT JOIN issue_votes v ON i.id = v.issue_id
    GROUP BY i.id
    ORDER BY upvotes DESC
    LIMIT 5
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching popular issues", error: err });
    res.json(results);
  });
});

router.get('/stats/issues', async (req, res) => {
  try {
    const [typeRows] = await db.promise().query(`
      SELECT category, COUNT(*) AS count
      FROM issues
      GROUP BY category
    `);

    const [monthSummary] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status != 'Resolved' THEN 1 ELSE 0 END) AS pending
      FROM issues
      WHERE MONTH(date_reported) = MONTH(CURRENT_DATE()) 
        AND YEAR(date_reported) = YEAR(CURRENT_DATE())
    `);

    const [weeklyData] = await db.promise().query(`
      SELECT 
        WEEK(date_reported, 1) - WEEK(DATE_SUB(date_reported, INTERVAL DAYOFMONTH(date_reported)-1 DAY), 1) + 1 AS week_number,
        COUNT(*) AS total_issues
      FROM issues
      WHERE MONTH(date_reported) = MONTH(CURRENT_DATE()) 
        AND YEAR(date_reported) = YEAR(CURRENT_DATE())
      GROUP BY week_number
      ORDER BY week_number
    `);

    res.json({
      byCategory: typeRows,
      monthStatus: monthSummary[0],
      weekly: weeklyData
    });
  } catch (err) {
    console.error('Error fetching issue stats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ GET all approved issues with vote counts
router.get('/approved', (req, res) => {
  const query = `
    SELECT 
      i.id, i.title, i.description, i.category, i.status,
      i.date_reported, i.latitude, i.longitude, i.location_text, i.image_path,
      u.firstName, u.lastName, 
      IFNULL(SUM(v.vote_type = 'upvote'), 0) AS upvotes,
      IFNULL(SUM(v.vote_type = 'downvote'), 0) AS downvotes
    FROM issues i
    JOIN userdb u ON i.reporter_id = u.id
    LEFT JOIN issue_votes v ON i.id = v.issue_id
    WHERE i.approved = 1
    GROUP BY i.id
    ORDER BY i.date_reported DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching approved issues:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.status(200).json(results);
  });
});

// ✅ Get all issues with vote counts
router.get("/all", (req, res) => {
  const query = `
    SELECT 
      i.*, 
      IFNULL(SUM(v.vote_type = 'upvote'), 0) AS upvotes,
      IFNULL(SUM(v.vote_type = 'downvote'), 0) AS downvotes
    FROM issues i
    LEFT JOIN issue_votes v ON v.issue_id = i.id
    GROUP BY i.id
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching issues", error: err });
    res.json(results);
  });
});

router.get("/user-votes/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT issue_id, vote_type
    FROM issue_votes
    WHERE user_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch user votes:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json(results);
  });
});

router.post("/:id/vote", (req, res) => {
  const issue_id = req.params.id;
  const { user_id, vote_type } = req.body;

  if (!user_id || !vote_type) {
    return res.status(400).json({ message: "Missing user_id or vote_type" });
  }

  // 🛑 Check if user has already voted on this issue
  const checkQuery = `SELECT * FROM issue_votes WHERE issue_id = ? AND user_id = ?`;
  db.query(checkQuery, [issue_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "You have already voted on this issue." });
    }

    // ✅ Insert vote if not already voted
    const insertVote = `
      INSERT INTO issue_votes (issue_id, user_id, vote_type, voted_at)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(insertVote, [issue_id, user_id, vote_type], (err) => {
      if (err) return res.status(500).json({ error: "Vote failed" });
      res.json({ message: "Vote recorded" });
    });
  });
});


// 🧪 Test route
router.get("/test", (req, res) => {
  res.json({ message: "✅ /api/issues/test route is working!" });
});

router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      title,
      category,
      status,
      approved
    FROM issues
    WHERE reporter_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching reported issues:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Report issue submission
router.post('/report/submit', upload.single('image'), (req, res) => {
  const {
    title,
    location_text,
    category,
    description,
    reporter_id,
    latitude,
    longitude
  } = req.body;

  const image_path = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO issues 
    (title, location_text, category, description, reporter_id, latitude, longitude, image_path, status, date_reported)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'In-Review', NOW())
  `;

  const values = [
    title,
    location_text,
    category,
    description,
    reporter_id,
    latitude,
    longitude,
    image_path
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Database insert error:", err);
      return res.status(500).json({ error: "Failed to submit issue" });
    }

    return res.status(200).json({ 
      message: "✅ Issue submitted and sent for review",
      issueId: result.insertId 
    });
  });
});


// GET unapproved issues with reporter name
router.get('/unapproved', (req, res) => {
  const query = `
    SELECT 
      i.id, i.title, i.description, i.latitude, i.longitude, 
      i.date_reported, i.image_path,
      u.username,
      CONCAT(i.latitude, ',', i.longitude) AS latlng
    FROM issues i
    JOIN userdb u ON i.reporter_id = u.id
    WHERE i.approved = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching unapproved issues:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(results);
  });
});

router.put('/:id/approve', (req, res) => {
  const issueId = req.params.id;
  const { approved } = req.body;

  // Step 1: Update approval status
  db.query('UPDATE issues SET approved = ? WHERE id = ?', [approved, issueId], (err) => {
    if (err) {
      console.error('Error updating issue approval:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    // Step 2: Get reporter to notify
    db.query('SELECT reporter_id FROM issues WHERE id = ?', [issueId], (err2, result) => {
      if (err2 || result.length === 0) {
        console.error('Error retrieving reporter ID:', err2);
        return res.status(500).json({ message: 'Server error' });
      }

      const reporterId = result[0].reporter_id;
      const status = approved == 1 ? 'Approved' : 'Rejected';
      const message = `Your reported issue has been ${status.toLowerCase()} by the admin.`;

      // Step 3: Insert notification
      const insertNotification = `
        INSERT INTO notifications (user_id, type, reference_id, status, message)
        VALUES (?, 'issue', ?, ?, ?)
      `;

      db.query(insertNotification, [reporterId, issueId, status, message], (err3) => {
        if (err3) {
          console.error('Error inserting notification:', err3);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({ message: `Issue ${status.toLowerCase()} and user notified` });
      });
    });
  });
});


router.put('/:id/status', (req, res) => {
  const issueId = req.params.id;
  const { newStatus, note } = req.body;
  const adminId = req.user?.id || 1; // Replace with real auth later

  // 1. Update the issue status
  db.query('UPDATE issues SET status = ? WHERE id = ?', [newStatus, issueId], (err) => {
    if (err) {
      console.error('Error updating issue status:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    // 2. Log the status change
    db.query(
      'INSERT INTO status_logs (entry_id, new_status, note, updated_by) VALUES (?, ?, ?, ?)',
      [issueId, newStatus, note, adminId],
      (err2) => {
        if (err2) {
          console.error('Error inserting status log:', err2);
          return res.status(500).json({ message: 'Server error' });
        }

        // 3. Get the reporter of the issue
        db.query('SELECT reporter_id FROM issues WHERE id = ?', [issueId], (err3, result) => {
          if (err3 || result.length === 0) {
            console.error('Error retrieving reporter ID:', err3);
            return res.status(500).json({ message: 'Server error' });
          }

          const reporterId = result[0].reporter_id;

          // 4. Insert notification for the user using the admin's note
          const insertNotification = `
            INSERT INTO notifications (user_id, type, reference_id,status, message)
            VALUES (?, 'issue', ?,?, ?)
          `;
          db.query(insertNotification, [reporterId, issueId,newStatus, note], (err4) => {
            if (err4) {
              console.error('Error inserting notification:', err4);
              return res.status(500).json({ message: 'Server error' });
            }

            res.json({ message: 'Issue updated, logged, and user notified' });
          });
           
        });
      }
    );
  });
});


module.exports = router;
