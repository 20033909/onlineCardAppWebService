// include the required modules
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

// initialize express app
const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// database connection configuration
const dbConfig = {
  host: (process.env.DB_HOST || "").trim(),
  user: (process.env.DB_USER || "").trim(),
  password: process.env.DB_PASSWORD,
  database: (process.env.DB_NAME || "").trim(),
  port: Number(process.env.DB_PORT) || 3306,

  // pool options (these only apply when using createPool)
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

// create ONE pool for the whole app (do this once)
const pool = mysql.createPool(dbConfig);

// start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// get all cards
app.get("/allcards", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cards");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error for getting all cards" });
  }
});

// add a new card
app.post("/addcard", async (req, res) => {
  const { card_name, card_pic } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO cards (card_name, card_pic) VALUES (?, ?)",
      [card_name, card_pic]
    );
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding card:", error);
    res.status(500).json({ error: "Internal Server Error for adding a card" });
  }
});

// app.get("/debug-env", (req, res) => {
//   res.json({
//     DB_HOST: process.env.DB_HOST,
//     DB_PORT: process.env.DB_PORT,
//     DB_NAME: process.env.DB_NAME,
//     DB_USER: process.env.DB_USER,
//     hostLen: process.env.DB_HOST?.length,
//   });
// });
