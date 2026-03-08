const express = require('express');
const router = express.Router();
const { ping, getMongoClient } = require('../services/mongoClient');

router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(), 
    timestamp: new Date().toISOString() 
  });
});

router.get('/db', async (req, res) => {
  try {
    await ping();
    res.json({ dbStatus: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ 
      dbStatus: 'disconnected', 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
