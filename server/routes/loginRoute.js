const express = require('express');
const router = express.Router(); // Initialize router
const bcrypt = require('bcrypt'); // Import bcrypt for password comparison
const db = require('../db'); // Adjust the path to your database connection file

router.post('/', async (req, res) => {
    try {
        console.log("Login Request Body:", req.body);

        const { username, password } = req.body;

        if (!username || !password) {
            console.log("Validation Failed: Missing username or password");
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Check if the user exists in the database
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        console.log("Database Query Result:", result.rows);

        if (result.rows.length === 0) {
            console.log("Validation Failed: User not found");
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = result.rows[0];
        console.log("User found:", user);

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password Validation Result:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("Validation Failed: Invalid password");
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Successful login
        console.log("Login successful");
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error("Error during login:", error.stack);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
