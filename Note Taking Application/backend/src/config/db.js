import mysql from "mysql2";

// Create connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456", 
  database: "crud_app"
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error(" Database connection failed:", err);
  } else {
    console.log(" Connected to MySQL database");
  }
});

export default db;