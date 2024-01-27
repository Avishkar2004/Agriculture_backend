import mysql2 from "mysql2";


export const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "agrisite",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  db.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL database:", err);
      return;
    }
    console.log("Connected to MySQL database");
  });
  