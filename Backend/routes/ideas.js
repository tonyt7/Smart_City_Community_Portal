const express = require("express");
const router = express.Router();
const db = require("../db"); // adjust if your DB config file is elsewhere
const multer = require("multer");
const path = require("path");

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});

const upload = multer({ storage });
// 🔁 GET all approved ideas
router.get("/approved", async (req, res) => {
  
    db.query("SELECT * FROM ideas WHERE approved = 1", (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch approved ideas" });
        res.json(results);
      });
       
  
});
router.get("/all", (req, res) => {
  const sql = `
    SELECT i.*, 
           SUM(CASE WHEN v.vote_type = 'upvote' THEN 1 ELSE 0 END) AS upvotes,
           SUM(CASE WHEN v.vote_type = 'downvote' THEN 1 ELSE 0 END) AS downvotes
    FROM ideas i
    LEFT JOIN idea_votes v ON i.id = v.idea_id
    GROUP BY i.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch ideas" });
    res.json(results);
  });
});

// 🔁 POST a new idea with optional image upload
router.post("/submit", upload.single("image"), async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      latitude,
      longitude
    } = req.body;

    const status = "Vote On";
    const approved = 0;
    const image_url = req.file ? req.file.filename : null;

    await db.execute(
      "INSERT INTO ideas (user_id, title, description, image_url, status, latitude, longitude, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, title, description, image_url, status, latitude, longitude, approved]
    );

    res.json({ message: "Idea submitted successfully with image!" });
  } catch (err) {
    console.error("Error submitting idea:", err);
    res.status(500).json({ error: "Failed to submit idea" });
  }
});

router.patch("/:id/approve", (req, res) => {
  const { id } = req.params;
  const { threshold } = req.body;

  const setThresholdAndApprove = (finalThreshold) => {
    const sql = `
      UPDATE ideas 
      SET approved = 1, status = 'Vote On', threshold = ? 
      WHERE id = ?
    `;
    db.query(sql, [finalThreshold, id], (err) => {
      if (err) {
        console.error("Error updating idea:", err);
        return res.status(500).json({ error: "Approval failed" });
      }
      res.json({ message: "Idea approved", threshold: finalThreshold });
    });
  };

  // If threshold was provided
  if (threshold !== undefined && threshold !== null && threshold !== '') {
    const parsed = parseInt(threshold);
    if (!isNaN(parsed)) {
      return setThresholdAndApprove(parsed);
    }
  }

  // Otherwise, get default threshold from settings
  db.query("SELECT setting_value FROM system_settings WHERE setting_key = 'vote_threshold'", (err, results) => {
    if (err || results.length === 0) {
      console.error("Error getting default threshold:", err);
      return res.status(500).json({ error: "Could not get default threshold" });
    }

    const defaultThreshold = parseInt(results[0].setting_value);
    setThresholdAndApprove(defaultThreshold);
  });
});



router.get("/unapproved", (req, res) => {
  const query = `
    SELECT 
      i.id, 
      i.title, 
      i.description, 
      i.created_at, 
      i.threshold, 
      u.username 
    FROM ideas i
    JOIN userdb u ON i.user_id = u.id
    WHERE i.approved = 0
    ORDER BY i.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching unapproved ideas:", err);
      return res.status(500).json({ error: "Failed to fetch ideas" });
    }

    res.json(results);
  });
});


router.post("/:id/vote", (req, res) => {
  const idea_id = req.params.id;
  const { user_id, vote_type } = req.body;

  if (!["upvote", "downvote"].includes(vote_type)) {
    return res.status(400).json({ error: "Invalid vote type." });
  }

  // Step 1: Check if user already voted
  db.query(
    "SELECT * FROM idea_votes WHERE user_id = ? AND idea_id = ?",
    [user_id, idea_id],
    (err, results) => {
      if (err) {
        console.error("Error checking existing vote:", err);
        return res.status(500).json({ error: "Database error." });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "You have already voted on this idea." });
      }

      // Step 2: Insert vote
      db.query(
        "INSERT INTO idea_votes (user_id, idea_id, vote_type) VALUES (?, ?, ?)",
        [user_id, idea_id, vote_type],
        (insertErr) => {
          if (insertErr) {
            console.error("Error inserting vote:", insertErr);
            return res.status(500).json({ error: "Failed to record vote." });
          }

          // Step 3: Count net votes
          const voteCountQuery = `
            SELECT 
              SUM(CASE WHEN vote_type = 'upvote' THEN 1 WHEN vote_type = 'downvote' THEN -1 ELSE 0 END) AS net_votes
            FROM idea_votes
            WHERE idea_id = ?
          `;

          db.query(voteCountQuery, [idea_id], (countErr, countResult) => {
            if (countErr) {
              console.error("Vote count error:", countErr);
              return res.status(500).json({ error: "Failed to count votes." });
            }

            const netVotes = countResult[0].net_votes || 0;

            // Step 4: Get idea threshold and current status
            db.query("SELECT threshold, status FROM ideas WHERE id = ?", [idea_id], (ideaErr, ideaResult) => {
              if (ideaErr || ideaResult.length === 0) {
                console.error("Error fetching idea:", ideaErr);
                return res.status(500).json({ error: "Idea not found." });
              }

              const { threshold, status } = ideaResult[0];

              if (status === 'Vote On' && netVotes >= threshold) {
                // Step 5: Update status to "Processing"
                db.query("UPDATE ideas SET status = 'Processing' WHERE id = ?", [idea_id], (updateErr) => {
                  if (updateErr) {
                    console.error("Failed to update idea status:", updateErr);
                    return res.status(500).json({ error: "Failed to update status." });
                  }

                  // Step 6: Log it
                  db.query(
                    "INSERT INTO status_logs (entry_id, new_status, note, updated_by,entry_type) VALUES (?, 'Processing', 'Threshold reached via voting', ?,'idea')",
                    [idea_id, user_id],
                    (logErr) => {
                      if (logErr) {
                        console.error("Error logging status change:", logErr);
                        return res.status(500).json({ error: "Failed to log status update." });
                      }

                      return res.json({ message: "Vote recorded and status updated to 'Processing'." });
                    }
                  );
                });
              } else {
                // Just voting, no threshold hit
                return res.json({ message: "Vote recorded." });
              }
            });
          });
        }
      );
    }
  );
});


router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body;
  const adminId = 1; // TEMP: Replace with req.user.id when using auth

  if (!status || !message) {
    return res.status(400).json({ error: "Status and message are required" });
  }

  // 1. Update the idea
  db.query("UPDATE ideas SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) {
      console.error("Error updating idea status:", err);
      return res.status(500).json({ error: "Failed to update status" });
    }

    // 2. Log to status_log
    const logQuery = `
      INSERT INTO status_logs (entry_id, new_status, note, updated_by,entry_type) 
      VALUES (?, ?, ?, ?,'idea')
    `;
    db.query(logQuery, [id, status, message, adminId], (logErr) => {
      if (logErr) {
        console.error("Error logging status update:", logErr);
        return res.status(500).json({ error: "Failed to log status change" });
      }

      res.json({ message: "Status updated and logged to status_log" });
    });
  });
});


router.get("/votes", (req, res) => {
  const sql = `
    SELECT 
      idea_id,
      SUM(vote_type = 'upvote') AS upvotes,
      SUM(vote_type = 'downvote') AS downvotes
    FROM idea_votes
    GROUP BY idea_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching votes:", err);
      return res.status(500).json({ error: "Failed to load vote data." });
    }

    res.json(results); // results = array of { idea_id, upvotes, downvotes }
  });
});
router.get("/user-votes/:user_id", (req, res) => {
  const userId = req.params.user_id;

  db.query(
    "SELECT idea_id FROM idea_votes WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error loading user votes:", err);
        return res.status(500).json({ error: "Failed to load vote history." });
      }

      res.json(results); // [{ idea_id: 1 }, { idea_id: 3 }, ...]
    }
  );
});

// 🔁 GET all ideas (optional: for admin)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM ideas");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching ideas:", err);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

router.put("/:id/reject", (req, res) => {
  const ideaId = req.params.id;
  const { note } = req.body;
  const adminId = req.user?.id || 7; // Update for real auth later

  // Set approved = -1
  const sql = `UPDATE ideas SET approved = -1 WHERE id = ?`;
  db.query(sql, [ideaId], (err) => {
    if (err) {
      console.error("Error rejecting idea:", err);
      return res.status(500).json({ error: "Failed to reject idea" });
    }

    // Log status
    const logSql = `
      INSERT INTO status_logs (entry_id, new_status, note, updated_by, entry_type)
      VALUES (?, 'Rejected', ?, ?, 'idea')
    `;
    db.query(logSql, [ideaId, note, adminId], (err2) => {
      if (err2) {
        console.error("Error logging rejection:", err2);
        return res.status(500).json({ error: "Log failed" });
      }

      // Notify user
      db.query("SELECT user_id FROM ideas WHERE id = ?", [ideaId], (err3, result) => {
        if (err3 || result.length === 0) return res.json({ message: "Rejected but user not found" });

        const userId = result[0].user_id;
        const notifSql = `
          INSERT INTO notifications (user_id, type, reference_id, status, message)
          VALUES (?, 'idea', ?, ?, ?)
        `;
        const message = `Your idea has been rejected. Reason: ${note}`;
        db.query(notifSql, [userId, ideaId, "Rejected", message], (err4) => {
          if (err4) console.error("Notification error:", err4);
          return res.json({ message: "Idea rejected, log and notification added." });
        });
      });
    });
  });
});

router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT 
      title, 
      status, 
      DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
      approved
    FROM ideas 
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching ideas:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});
module.exports = router;
