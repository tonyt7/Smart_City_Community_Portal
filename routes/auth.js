const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const db = require("../db"); // Import MariaDB connection pool

const router = express.Router();

// Serve uploads folder statically (ensure this is also in server.js)
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });


// ✅ REGISTER ROUTE
router.post("/register", (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required!" });
  }

  console.log("🟢 Register request received:", req.body);

  db.query("SELECT * FROM userdb WHERE username = ?", [username], (err, result) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ success: false, message: "Database error!" });
    }

    if (result.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists!" });
    }

    const query = "INSERT INTO userdb (username, password, firstName, lastName) VALUES (?, ?, ?, ?)";
    db.query(query, [username, password, firstName, lastName], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Failed to register user!", error: err.sqlMessage });
      }

      res.status(201).json({ success: true, message: "🎉 User registered successfully!" });
    });
  });
});


// ✅ LOGIN ROUTE
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM userdb WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const user = results[0];
      res.json({ message: `Welcome, ${user.firstName}!`, user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});


// ✅ UPLOAD PROFILE PICTURE ROUTE
router.post('/upload-profile/:id', upload.single('profilePic'), (req, res) => {
  const userId = req.params.id;
  const filename = req.file.filename;

  db.query("UPDATE userdb SET profile_picture = ? WHERE id = ?", [filename, userId], (err, result) => {
    if (err) {
      console.error("❌ Failed to update profile_picture:", err);
      return res.status(500).json({ success: false, message: "Failed to save profile picture!" });
    }

    res.json({ success: true, message: "Profile picture updated!", filename });
  });
});

module.exports = router;
