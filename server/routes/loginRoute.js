const express = require("express");
const bcrypt = require("bcrypt");
const { supabase } = require("../db");
const router = express.Router();

// ✅ User Login Route
router.post("/", async (req, res) => {
    try {
        console.log("🔹 Login API called");
        console.log("Request Body:", req.body);

        const { username, password } = req.body;

        if (!username || !password) {
            console.log("❌ Missing Fields");
            return res.status(400).json({ error: "Username and password are required" });
        }

        console.log("🔍 Checking if user exists in Supabase...");
        const { data: user, error: findError } = await supabase
            .from("users")
            .select("userid, username, email, password, role") // ✅ Include role
            .eq("username", username)
            .single();

        if (findError) {
            console.error("❌ Supabase Query Error:", findError);
            return res.status(500).json({ error: "Database error" });
        }

        if (!user) {
            console.log("❌ User not found");
            return res.status(401).json({ error: "Invalid username or password" });
        }

        console.log("🔹 Verifying password...");
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("❌ Invalid password");
            return res.status(401).json({ error: "Invalid username or password" });
        }

        console.log("✅ Login successful");
        res.status(200).json({
            message: "Login successful",
            user: { id: user.userid, username: user.username, email: user.email, role: user.role }, // ✅ Return role
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
