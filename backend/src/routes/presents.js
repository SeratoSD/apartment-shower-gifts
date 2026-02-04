const express = require('express');
const router = express.Router();
const { getPresents, getPresentById, markAsBought, addPresent, deletePresent, updatePresent } = require('../data/presentsStore');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get all presents
router.get('/', (req, res) => {
  const presents = getPresents();
  res.json(presents);
});

// Get single present
router.get('/:id', (req, res) => {
  const present = getPresentById(req.params.id);
  if (!present) {
    return res.status(404).json({ error: 'Present not found' });
  }
  res.json(present);
});

// Mark present as bought
router.post('/:id/buy', (req, res) => {
  const { buyerName } = req.body;
  if (!buyerName) {
    return res.status(400).json({ error: 'Buyer name is required' });
  }
  
  const present = markAsBought(req.params.id, buyerName);
  if (!present) {
    return res.status(404).json({ error: 'Present not found' });
  }
  if (present.error) {
    return res.status(400).json({ error: present.error });
  }
  res.json(present);
});

// Admin: Add new present
router.post('/', requireAdmin, (req, res) => {
  const { name, description, price, photo, url } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const present = addPresent({ name, description, price, photo, url });
  res.status(201).json(present);
});

// Admin: Update present
router.put('/:id', requireAdmin, (req, res) => {
  const { name, description, price, photo, url } = req.body;
  const present = updatePresent(req.params.id, { name, description, price, photo, url });
  if (!present) {
    return res.status(404).json({ error: 'Present not found' });
  }
  res.json(present);
});

// Admin: Delete present
router.delete('/:id', requireAdmin, (req, res) => {
  const deleted = deletePresent(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Present not found' });
  }
  res.json({ success: true });
});

// Verify admin password
router.post('/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
