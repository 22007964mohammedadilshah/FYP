const express = require('express');
const pool = require('../db');
const router = express.Router();

// Add Grocery
router.post('/', async (req, res) => {
  const { item_name, quantity, price_per_quantity, date_purchased, date_of_expiry } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO groceries (item_name, quantity, price_per_quantity, date_purchased, date_of_expiry) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [item_name, quantity, price_per_quantity, date_purchased, date_of_expiry]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding grocery:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List Groceries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groceries');
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving groceries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete Grocery
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM groceries WHERE id = $1', [id]);
    res.json({ message: 'Grocery deleted successfully' });
  } catch (error) {
    console.error('Error deleting grocery:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
