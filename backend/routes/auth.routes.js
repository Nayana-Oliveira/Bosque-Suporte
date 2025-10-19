const express = require('express');
const router = express.Router();
const { register, login, getProfile, refresh, logout } = require('../controllers/auth.controller');
const { auth, isSupport } = require('../middleware/auth');

router.post('/register', auth, isSupport, register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/profile', auth, getProfile);

module.exports = router;