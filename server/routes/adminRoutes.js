const express = require('express');
const router = express.Router();
require('dotenv').config(); // Load environment variables
const pool = require('../db'); // Database connection

// **1. Admin Login Route**
router.post('/recipes', async (req, res) => {
    const { recipe_name, ingredients } = req.body;
  
    try {
      const result = await pool.query(
        'INSERT INTO recipes (recipe_name, ingredients) VALUES ($1, $2) RETURNING *',
        [recipe_name, JSON.stringify(ingredients)]
      );
      res.status(201).json({ message: 'Recipe added successfully', recipe: result.rows[0] });
    } catch (error) {
      console.error('Error adding recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// **2. Add Recipe**
router.post('/recipes', async (req, res) => {
  const { recipe_name, ingredients } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO recipes (recipe_name, ingredients) VALUES ($1, $2) RETURNING *',
      [recipe_name, JSON.stringify(ingredients)]
    );
    res.status(201).json({ message: 'Recipe added successfully', recipe: result.rows[0] });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// **3. Delete Recipe**
router.delete('/recipes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM recipes WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// **4. Delete User Account**
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
