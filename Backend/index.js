import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1379",
    database: process.env.DB_NAME || "sportify_db",
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

// 🔹 REGISTER API
app.post("/api/signup", async (req, res) => {
    const { username, email, password, profile_picture, is_admin } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const sql =
            "INSERT INTO users (username, email, password_hash, profile_picture, is_admin) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [username, email, hashedPassword, profile_picture || null, is_admin || 0], (err, result) => {
            if (err) {
                console.error("❌ Error inserting user:", err);
                return res.status(500).json({ message: "Signup failed" });
            }
            res.status(201).json({ message: "✅ User registered successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "❌ Error processing signup" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user in database
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("❌ Error checking user:", err);
            return res.status(500).json({ message: "Login failed" });
        }

        if (results.length === 0) {
            console.log("❌ No user found with this email:", email);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        console.log("✅ User found:", user);

        // Compare entered password with hashed password from database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log("🔍 Password valid:", isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ user_id: user.user_id, is_admin: user.is_admin }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "✅ Login successful", token });
    });
});


// Start Server
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});

export default db; // ✅ Correct export for ES Modules
