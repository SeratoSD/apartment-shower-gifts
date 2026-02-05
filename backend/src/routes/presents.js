const express = require('express');
const router = express.Router();
const { getPresents, getPresentById, markAsBought, addPresent, deletePresent, releasePresent, updatePresent, getSiteVisible, setSiteVisible } = require('../data/presentsStore');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get all presents
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.headers['x-admin-password'] === ADMIN_PASSWORD;
    const siteVisible = await getSiteVisible();
    
    if (!siteVisible && !isAdmin) {
      return res.json({ hidden: true, presents: [] });
    }
    
    const presents = await getPresents();
    res.json({ hidden: false, presents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single present
router.get('/:id', async (req, res) => {
  try {
    const present = await getPresentById(req.params.id);
    if (!present) return res.status(404).json({ error: 'Present not found' });
    res.json(present);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark present as bought
router.post('/:id/buy', async (req, res) => {
  try {
    const { buyerName } = req.body;
    if (!buyerName) return res.status(400).json({ error: 'Buyer name is required' });
    
    const present = await markAsBought(req.params.id, buyerName);
    if (!present) return res.status(404).json({ error: 'Present not found' });
    if (present.error) return res.status(400).json({ error: present.error });
    res.json(present);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add new present
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, photo, url } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
    const present = await addPresent({ name, description, price, photo, url });
    res.status(201).json(present);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update present
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, photo, url } = req.body;
    const present = await updatePresent(req.params.id, { name, description, price, photo, url });
    if (!present) return res.status(404).json({ error: 'Present not found' });
    res.json(present);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete present
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await deletePresent(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Present not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Release bought present
router.post('/:id/release', requireAdmin, async (req, res) => {
  try {
    const present = await releasePresent(req.params.id);
    if (!present) return res.status(404).json({ error: 'Present not found' });
    if (present.error) return res.status(400).json({ error: present.error });
    res.json(present);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Get site visibility
router.get('/admin/visibility', requireAdmin, async (req, res) => {
  try {
    const visible = await getSiteVisible();
    res.json({ visible });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set site visibility
router.post('/admin/visibility', requireAdmin, async (req, res) => {
  try {
    const { visible } = req.body;
    await setSiteVisible(visible);
    res.json({ visible });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
