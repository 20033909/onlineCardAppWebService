const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;

// -------------------- DB -------------------- //
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 5, // matches your DB user limit
  queueLimit: 0,
});

// Helper function for safe queries
async function safeQuery(sql, params = []) {
  let retries = 3;
  while (retries > 0) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      if (err.code === "ER_USER_LIMIT_REACHED") {
        await new Promise((r) => setTimeout(r, 100)); // wait 100ms
        retries--;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max user connections reached. Try again later.");
}

// -------------------- JWT -------------------- //
const JWT_SECRET = process.env.JWT_SECRET;

// -------------------- CORS -------------------- //
app.use(cors({ origin: "https://c219-ca2-card-app.vercel.app" }));

// -------------------- TABLE -------------------- //
async function ensureTables() {
  try {
    await safeQuery(`
      CREATE TABLE IF NOT EXISTS certs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cert_name VARCHAR(255) NOT NULL,
        cert_pic TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await safeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

// -------------------- AUTH MIDDLEWARE -------------------- //
function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.sendStatus(401);
  }
}

// -------------------- ROUTES -------------------- //

// User registration
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    await safeQuery("INSERT INTO users (email, password) VALUES (?, ?)", [email, password]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Email already exists" });
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const rows = await safeQuery("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// PUBLIC: view certs
app.get("/allcerts", async (req, res) => {
  try {
    const rows = await pool.query("SELECT * FROM certs");
    res.json(rows[0]); // rows[0] contains the results from mysql2
  } catch (err) {
    console.error("DB error fetching certs:", err);
    res.status(500).json({ error: "Failed to fetch certs", details: err.message });
  }
});

// ADMIN: add cert
app.post("/addcert", authenticateAdmin, async (req, res) => {
  try {
    const { cert_name, cert_pic } = req.body;
    await safeQuery("INSERT INTO certs (cert_name, cert_pic) VALUES (?, ?)", [cert_name, cert_pic]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add cert" });
  }
});

// ADMIN: update cert
app.put("/updatecert/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { cert_name, cert_pic } = req.body;
    await safeQuery("UPDATE certs SET cert_name = ?, cert_pic = ? WHERE id = ?", [cert_name, cert_pic, id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update cert" });
  }
});

// ADMIN: delete cert
app.delete("/deletecert/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await safeQuery("DELETE FROM certs WHERE id = ?", [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete cert" });
  }
});

// -------------------- START -------------------- //
(async () => {
  await ensureTables();
  app.listen(port, () => console.log(`✅ Server running on port ${port}`));
})();

