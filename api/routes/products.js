import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Create product (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, image_url, category, dimensions, featured } = req.body;
    
    const result = await pool.query(
      `INSERT INTO products (name, description, image_url, category, dimensions, featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, image_url, category, dimensions, featured]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Update product (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, category, dimensions, featured } = req.body;
    
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, image_url = $3, category = $4, 
           dimensions = $5, featured = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, image_url, category, dimensions, featured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Delete product (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

export default router;