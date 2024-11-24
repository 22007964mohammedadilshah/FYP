const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const db = require('../db'); // Adjust the path to your database connection file

router.post('/', async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            console.log("Validation Failed: Missing username or password");
            return res.status(400).json({ error: "Username and password are required" });
        }

        if (username.length < 3) {
            console.log("Validation Failed: Username too short");
            return res.status(400).json({ error: "Username must be at least 3 characters long" });
        }

        if (password.length < 6) {
            console.log("Validation Failed: Password too short");
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Check if the username already exists
        const existingUser = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        console.log("Existing User Query Result:", existingUser.rows);

        if (existingUser.rows.length > 0) {
            console.log("Validation Failed: Username already exists");
            return res.status(409).json({ error: "Username already exists" });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10
        console.log("Password hashed successfully");

        // Insert user into the database
        console.log("Inserting user into database...");
        const result = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, hashedPassword]
        );
        console.log("User registration successful:", result.rows[0]);

        // Exclude sensitive data from the response for security
        const { id, username: registeredUsername, created_at } = result.rows[0];
        return res.status(201).json({
            message: "User registered successfully",
            user: { id, username: registeredUsername, created_at }
        });
    } catch (error) {
        console.error("Error during registration:", error.stack);

        // Handle duplicate username error (unique constraint violation)
        if (error.code === '23505') { // PostgreSQL unique constraint error code
            return res.status(409).json({ error: "Username already exists" });
        }

        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
