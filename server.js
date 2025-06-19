const express = require("express");
const cors = require("cors");
const multer = require("multer");
const issuesRoutes = require('./routes/issues');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const forumRoutes = require('./routes/forum');
const ideasRoutes = require("./routes/ideas");
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const adminUserRoutes = require("./routes/adminUsers");






const { pool } = require("./db"); 

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve images
app.use('/api/issues', issuesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/ideas", ideasRoutes);
app.use('/api/forum', forumRoutes);
app.use("/settings", settingsRoutes);
app.use('/api/status-log', require('./routes/statusLog'));
app.use("/admin", adminUserRoutes);
// Multer storage settings
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ API to Upload Profile Picture
app.post("/api/upload-profile", upload.single("profilePic"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const { username } = req.body;
  const profilePicPath = `/uploads/${req.file.filename}`;

  const query = "UPDATE userdb SET profilePicture = ? WHERE username = ?";
  db.query(query, [profilePicPath, username], (err) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json({ success: true, profilePic: profilePicPath });
  });
});

// ✅ API to Get User Profile
app.get("/api/profile/:username", (req, res) => {
  const { username } = req.params;
  const query = "SELECT firstName, lastName, profilePicture FROM userdb WHERE username = ?";

  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(results[0]);
  });
});


// ✅ REGISTER ROUTE (Without Password Hashing for Now)
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required!" });
  }

  try {
    const conn = await pool.getConnection(); // Get database connection

    const query = "INSERT INTO userdb (firstName, lastName, username, password, role) VALUES (?, ?, ?, ?, 'user')";
    const [result] = await conn.query(query, [firstName, lastName, username, password]);

    conn.release(); // Release the connection

    res.status(201).json({ success: true, message: "🎉 User registered successfully!" });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ success: false, message: "Database error!", error: err.message });
  }
});




// ✅ Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const conn = await pool.getConnection();

    // Fetch user from database
    const [rows] = await conn.query("SELECT * FROM userdb WHERE username = ?", [username]);
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", role: user.role });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
