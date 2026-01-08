// include the required modules
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();
const port = process.env.PORT || 3000;

// database connection configuration
const dbConfig = {
  host: (process.env.DB_HOST || "").trim(),
  user: (process.env.DB_USER || "").trim(),
  password: process.env.DB_PASSWORD,
  database: (process.env.DB_NAME || "").trim(),
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

// initialize express app
const app = express();
app.use(express.json());

// start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// get all cards
app.get("/allcards", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM defaultdb.cards");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error for getting all cards" });
  }
});

app.get("/debug-env", (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    hostLen: process.env.DB_HOST?.length,
  });
});
