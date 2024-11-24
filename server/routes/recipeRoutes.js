const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/admin/recipes', async (req, res) => {
    const { recipe_name, ingredients } = req.body;
  
    try {
      const result = await db.query(
        'INSERT INTO recipes (recipe_name, ingredients) VALUES ($1, $2) RETURNING *',
        [recipe_name, ingredients]
      );
      res.status(201).json({ message: 'Recipe added successfully', recipe: result.rows[0] });
    } catch (error) {
      console.error('Error adding recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// List Recipes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete Recipe
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
