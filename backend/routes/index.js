const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const ticketRoutes = require('./tickets.routes');

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);

module.exports = router;