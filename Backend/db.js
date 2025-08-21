const mysql = require("mysql2");
// Create a connection pool
const db = mysql.createConnection({
  host: "localhost",  
  user: "root",       
  password: "",       
  database: "userdb", 
  });

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to the database!');
  }
});

module.exports = db;
