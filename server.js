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
});

// -------------------- JWT -------------------- //
const JWT_SECRET = process.env.JWT_SECRET;

// -------------------- CORS -------------------- //
app.use(cors({ origin: "https://c219-ca2-2212ka9oe-jasons-projects-dee748ed.vercel.app" }));

// -------------------- TABLE -------------------- //
async function ensureTables() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS certs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cert_name VARCHAR(255) NOT NULL,
        cert_pic TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);
  } finally {
    conn.release();
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

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    await pool.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, password]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// PUBLIC: view certs (no login needed)
app.get("/allcerts", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM certs");
  res.json(rows);
});

// ADMIN ONLY: add cert
app.post("/addcert", authenticateAdmin, async (req, res) => {
  const { cert_name, cert_pic } = req.body;
  await pool.query(
    "INSERT INTO certs (cert_name, cert_pic) VALUES (?, ?)",
    [cert_name, cert_pic]
  );
  res.sendStatus(201);
});

// ADMIN ONLY: update cert
app.put("/updatecert/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { cert_name, cert_pic } = req.body;
  await pool.query(
    "UPDATE certs SET cert_name = ?, cert_pic = ? WHERE id = ?",
    [cert_name, cert_pic, id]
  );
  res.sendStatus(200);
});

// ADMIN ONLY: delete cert
app.delete("/deletecert/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM certs WHERE id = ?", [id]);
  res.sendStatus(200);
});

// -------------------- START -------------------- //
(async () => {
  await ensureTables();
  app.listen(port, () =>
    console.log(`✅ Server running on port ${port}`)
  );
})();

