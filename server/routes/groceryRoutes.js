const express = require("express");
const { supabase } = require("../db");
const Joi = require("joi");

const router = express.Router();

// ✅ Validation Schema
const grocerySchema = Joi.object({
    name: Joi.string().max(255).required(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().max(50).required(),
    price: Joi.number().min(0).required(),
    date_of_expiry: Joi.date().allow(null),
    date_of_purchase: Joi.date().required(),
});

// ✅ Middleware: Validate User ID
const validateUserId = (req, res, next) => {
    const { userid } = req.params;
    if (!userid || isNaN(userid)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    next();
};

// ✅ GET All Groceries for a User
router.get("/:userid", validateUserId, async (req, res) => {
    try {
        const { userid } = req.params;
        const { data, error } = await supabase.from("groceries").select("*").eq("userid", userid);

        if (error) return res.status(500).json({ error: "Database error" });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ POST: Add Grocery
router.post("/:userid", validateUserId, async (req, res) => {
    const { userid } = req.params;
    const { error, value } = grocerySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        await supabase.from("groceries").insert([{ ...value, userid }]);
        res.status(201).json({ message: "✅ Grocery added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ DELETE Grocery
// ✅ DELETE Grocery - FIXED
router.delete("/:userid/:groceryid", validateUserId, async (req, res) => {
    const { userid, groceryid } = req.params;

    try {
        const { error } = await supabase.from("groceries").delete().eq("groceryid", groceryid).eq("userid", userid);

        if (error) return res.status(500).json({ error: "Database error" });

        res.status(200).json({ message: "✅ Grocery deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});



router.put("/:userid/:groceryid", async (req, res) => {
    const { userid, groceryid } = req.params;
    const { error, value } = grocerySchema.validate(req.body);
    
    if (error) return res.status(400).json({ error: error.details[0].message });
  
    try {
      console.log(`🛠 Checking if Grocery exists: UserID=${userid}, GroceryID=${groceryid}`);
      
      // ✅ Ensure grocery exists before updating
      const { data: existingGrocery, error: fetchError } = await supabase
        .from("groceries")
        .select("*")
        .eq("groceryid", groceryid) 
        .eq("userid", userid)
        .single();
      
      if (fetchError || !existingGrocery) {
        return res.status(404).json({ error: "❌ Grocery not found" });
      }
  
      console.log(`✅ Grocery found, proceeding with update`);
  
      // ✅ Perform the update
      const { data, error } = await supabase
        .from("groceries")
        .update(value)
        .eq("groceryid", groceryid) 
        .eq("userid", userid)
        .select();
  
      if (error) return res.status(500).json({ error: "❌ Database error" });
  
      res.status(200).json({ message: "✅ Grocery updated successfully", grocery: data });
    } catch (err) {
      console.error("❌ Server Error:", err);
      res.status(500).json({ error: "❌ Server error" });
    }
  });
  
  


router.get("/:userid/:groceryid", async (req, res) => {
    const { userid, groceryid } = req.params;
  
    console.log(`🛠 Fetching Grocery: UserID=${userid}, GroceryID=${groceryid}`);
  
    if (!userid || !groceryid) {
      return res.status(400).json({ error: "User ID and Grocery ID are required" });
    }
  
    try {
      const { data, error } = await supabase
        .from("groceries")
        .select("*")
        .eq("groceryid", groceryid)  
        .eq("userid", userid)
        .single();
  
      if (error || !data) {
        console.error("❌ Supabase Error:", error);
        return res.status(404).json({ error: "Grocery not found" });
      }
  
      res.status(200).json(data);
    } catch (err) {
      console.error("❌ Server Error:", err);
      res.status(500).json({ error: "Server error" });
    }
});

  

module.exports = router;
