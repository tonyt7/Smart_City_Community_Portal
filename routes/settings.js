const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: fetch all system settings
router.get("/", (req, res) => {
  db.query("SELECT * FROM system_settings", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch settings" });
    res.json(results);
  });
});

// PATCH: update a setting by key
router.patch("/:key", (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value) return res.status(400).json({ error: "No value provided" });

  db.query(
    "UPDATE system_settings SET setting_value = ? WHERE setting_key = ?",
    [value, key],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update setting" });
      res.json({ message: "Setting updated" });
    }
  );
});

module.exports = router;
