const express = require("express");
const router = express.Router();
const { getUsers } = require("../db"); 
const { supabase } = require("../db");  
const bcrypt = require("bcrypt");

// ✅ Debugging Log
console.log("✅ userRoutes.js loaded!");

router.get("/", async (req, res) => {
    console.log("🔹 Received request: GET /api/users");  

    try {
        const users = await getUsers();
        console.log("🔍 Supabase Response:", users);  

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ✅ DELETE /api/users/:id - Delete a user by ID
router.delete("/:id", async (req, res) => {
    const userId = req.params.id;
    console.log(`🗑️ Attempting to delete user with ID: ${userId}`);
   
    try {
        const { data, error } = await supabase
            .from("users")
            .delete()
            .eq("userid", userId)
            .select("*");
        

        if (error) {
            console.error("❌ Error deleting user:", error.message);
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "User not found" });
            
        }

        console.log("✅ User deleted successfully");
        res.status(200).json({ message: "User deleted successfully" }); // 
    } catch (error) {
        console.error("❌ Server error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/:userid/:groceryid", async (req, res) => {
    const { userid, groceryid } = req.params;
    console.log(`🛠 Checking if Grocery exists: UserID=${userid}, GroceryID=${groceryid}`);

    if (!userid || !groceryid) {
        return res.status(400).json({ error: "User ID and Grocery ID are required" });
    }

    try {
        // ✅ First, check if the grocery exists before updating
        const { data: existingGrocery, error: fetchError } = await supabase
            .from("groceries")
            .select("*")
            .eq("groceryid", groceryid)
            .eq("userid", userid)
            .single();

        if (fetchError || !existingGrocery) {
            console.error("❌ Grocery Not Found in Database.");
            return res.status(404).json({ error: "Grocery not found" });
        }

        console.log("✅ Grocery Found: ", existingGrocery);

        // ✅ Validate Request Body
        const { error, value } = grocerySchema.validate(req.body);
        if (error) {
            console.error("❌ Validation Error:", error.details[0].message);
            return res.status(400).json({ error: error.details[0].message });
        }

        // ✅ Proceed with update if grocery exists
        const { data, error: updateError } = await supabase
            .from("groceries")
            .update(value)
            .eq("groceryid", groceryid)
            .eq("userid", userid)
            .select();

        if (updateError) {
            console.error("❌ Database Error:", updateError);
            return res.status(500).json({ error: "Database error" });
        }

        console.log("✅ Grocery Updated Successfully:", data);
        res.status(200).json({ message: "✅ Grocery updated successfully", grocery: data });
    } catch (err) {
        console.error("❌ Server Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});




// ✅ Reset Password Route (Admin Only)
router.put("/reset-password/:id", async (req, res) => {
    const { id } = req.params;
    const newPassword = "Temp@123"; 
    const hashedPassword = await bcrypt.hash(newPassword, 10); 

    try {
     
        const { data, error } = await supabase
            .from("users")
            .update({ password: hashedPassword }) 
            .eq("userid", id);

        if (error) {
            console.error("❌ Supabase Update Error:", error);
            return res.status(500).json({ error: "Database error", details: error });
        }

        res.json({ message: `Password reset successful. Temporary password: ${newPassword}` });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// User Change to New Password

router.put("/change-password/:userid", async (req, res) => {
    const { userid } = req.params;
    const { newPassword } = req.body; 
  
    try {
      // 1️⃣ Fetch user by userid (just to confirm they exist)
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("userid") 
        .eq("userid", userid)
        .single();
  
      if (fetchError || !user) {
        console.error("❌ User not found or query error:", fetchError);
        return res.status(404).json({ error: "User not found" });
      }
  
      // 2️⃣ Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // 3️⃣ Update the user's password in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("userid", userid);
  
      if (updateError) {
        console.error("❌ Error updating password:", updateError);
        return res.status(500).json({ error: "Failed to update password", details: updateError });
      }
  
      return res.json({ message: "Password updated successfully!" });
    } catch (error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });




module.exports = router;
