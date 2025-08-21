const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require("../db");

// Configure storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname;
      cb(null, uniqueSuffix);
    },
  });
  
const upload = multer({ storage: storage });
  


// ✅ Get all forum posts
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      p.id, p.title, p.content, p.image_url, p.type, p.created_at, u.username
    FROM forum_posts p
    JOIN userdb u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching posts", error: err });
    res.json(results);
  });
});

// ✅ Get a specific post by ID with its comments
router.get("/:id", (req, res) => {
  const postId = req.params.id;

  const postQuery = "SELECT * FROM forum_posts WHERE id = ?";
  const commentQuery = `
    SELECT c.*, u.username, u.profile_picture 
FROM forum_comments c
JOIN userdb u ON c.user_id = u.id
WHERE c.post_id = ?
ORDER BY c.created_at ASC

  `;

  db.query(postQuery, [postId], (err, postResult) => {
    if (err || postResult.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    db.query(commentQuery, [postId], (err, commentResults) => {
      if (err) return res.status(500).json({ message: "Error fetching comments", error: err });

      res.json({ post: postResult[0], comments: commentResults });
    });
  });
});



// ✅ Add a comment to a post
router.post("/:id/comments", (req, res) => {
  const postId = req.params.id;
  const { content, user_id } = req.body;

  if (!content || !user_id) {
    return res.status(400).json({ message: "Missing content or user ID" });
  }

  const sql = `
    INSERT INTO forum_comments (post_id, user_id, content)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [postId, user_id, content], (err, result) => {
    if (err) return res.status(500).json({ message: "Error adding comment", error: err });
    res.status(201).json({ message: "Comment added", commentId: result.insertId });
  });
});


router.post("/", upload.single("image"), (req, res) => {
    const { title, type, content, user_id } = req.body;
  
    if (!title || !type || !content || !user_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    // 🔧 Only store filename, NOT full path
    const imageFilename = req.file ? req.file.filename : "sample.jpg";
    const created_at = new Date();
  
    const query = `
      INSERT INTO forum_posts (title, type, content, image_url, created_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [title, type, content, imageFilename, created_at, user_id], (err, result) => {
      if (err) {
        console.error("Error inserting forum post:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      res.status(201).json({ success: true, postId: result.insertId });
    });
  });

// 🔥 Delete a forum post and log the action
router.delete("/:id", (req, res) => {
  const postId = req.params.id;
  const { admin_id, notes } = req.body;

  db.query("DELETE FROM forum_posts WHERE id = ?", [postId], (err) => {
    if (err) return res.status(500).json({ message: "Error deleting post", error: err });

     const logQuery = `
      INSERT INTO forum_moderation_logs (moderator_id, post_id, action, action_time, notes)
      VALUES (?, ?, 'Deleted Post', NOW(), ?)
    `;
    db.query(logQuery, [admin_id, postId, notes || "No reason provided"], () => {
      res.json({ message: "Post deleted and logged" });
    });
  });
});

// 🔥 Delete a comment and log the action
router.delete("/comments/:id", (req, res) => {
  const commentId = req.params.id;
  const { admin_id, notes } = req.body;

  // Get post_id first to log it properly
  db.query("SELECT post_id FROM forum_comments WHERE id = ?", [commentId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const postId = results[0].post_id;

    db.query("DELETE FROM forum_comments WHERE id = ?", [commentId], (err) => {
      if (err) return res.status(500).json({ message: "Error deleting comment", error: err });

       const logQuery = `
        INSERT INTO forum_moderation_logs (moderator_id, post_id, comment_id, action, action_time, notes)
        VALUES (?, ?, ?, 'Deleted Comment', NOW(), ?)
      `;
      db.query(logQuery, [admin_id, postId, commentId, notes || "No reason provided"], () => {
        res.json({ message: "Comment deleted and logged" });
      });
    });
  });
});

router.put("/comments/:id", (req, res) => {
  const commentId = req.params.id;
  const { content, admin_id, notes } = req.body;

  if (!content || !admin_id) {
    return res.status(400).json({ message: "Missing content or moderator ID" });
  }

  db.query("UPDATE forum_comments SET content = ? WHERE id = ?", [content, commentId], (err) => {
    if (err) return res.status(500).json({ message: "Error editing comment", error: err });

    // Log the moderation
    db.query("SELECT post_id FROM forum_comments WHERE id = ?", [commentId], (err, result) => {
      if (err || result.length === 0) return res.status(404).json({ message: "Comment not found" });

      const postId = result[0].post_id;
      const logQuery = `
        INSERT INTO forum_moderation_logs (moderator_id, post_id, comment_id, action, action_time, notes)
        VALUES (?, ?, ?, 'Edited Comment', NOW(), ?)
      `;
      db.query(logQuery, [admin_id, postId, commentId, notes || "No reason provided"], () => {
        res.json({ message: "Comment edited and logged" });
      });
    });
  });
});

router.get('/forum/posts', (req, res) => {
  db.query('SELECT * FROM forum_posts ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.get('/forum/posts/:postId/comments', (req, res) => {
  const { postId } = req.params;
  db.query('SELECT * FROM forum_comments WHERE post_id = ?', [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.delete('/forum/posts/:id', (req, res) => {
  const { id } = req.params;
  const { admin_id } = req.body;

  db.query('DELETE FROM forum_posts WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    const logQuery = `
      INSERT INTO forum_moderation_logs (moderator_id, post_id, action, action_time)
      VALUES (?, ?, 'Deleted Post', NOW())
    `;
    db.query(logQuery, [admin_id, id]);
    res.json({ message: 'Post deleted and logged' });
  });
});

router.delete('/forum/comments/:id', (req, res) => {
  const { id } = req.params;
  const { admin_id } = req.body;

  db.query('SELECT post_id FROM forum_comments WHERE id = ?', [id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ error: 'Comment not found' });

    const postId = rows[0].post_id;

    db.query('DELETE FROM forum_comments WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err });

      const logQuery = `
        INSERT INTO forum_moderation_logs (moderator_id, post_id, comment_id, action, action_time)
        VALUES (?, ?, ?, 'Deleted Comment', NOW())
      `;
      db.query(logQuery, [admin_id, postId, id]);
      res.json({ message: 'Comment deleted and logged' });
    });
  });
});

// GET /api/forum
router.get("/forum", (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.title,
      p.content,
      p.type,
      p.created_at,
      u.username
    FROM forum_posts p
    JOIN userdb u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching forum posts:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});


module.exports = router;
