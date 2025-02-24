import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

export const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // You can adjust this bases on traffic
  queueLimit: 0,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to Database:", err);
    return;
  }
  console.log("Connected to Database");
});
