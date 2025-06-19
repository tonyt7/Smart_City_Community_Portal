const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust to your DB connection module

// GET: All users with their idea and issue counts
router.get("/users", async (req, res) => {
  const query = `
    SELECT 
      u.id, u.username, u.firstName, u.lastName, u.Role,
      (SELECT COUNT(*) FROM ideas i WHERE i.user_id = u.id) AS ideas_count,
      (SELECT COUNT(*) FROM issues iss WHERE iss.reporter_id = u.id) AS issues_count
    FROM userdb u
    ORDER BY u.id ASC
  `;

  try {
    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH: Promote user to admin
router.patch("/users/:id/promote", async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await db.promise().query(
      "UPDATE userdb SET Role = 'Admin' WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User promoted to admin successfully" });
  } catch (err) {
    console.error("Error promoting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
