const express = require('express');
const router = express.Router();
const { login, logout, getCurrentUser } = require('../controllers/authController');

// Route untuk login
router.post('/login', login);

// Route untuk logout
router.post('/logout', logout);

// Route untuk mendapatkan data user yang sedang login
router.get('/me', getCurrentUser);

module.exports = router;
