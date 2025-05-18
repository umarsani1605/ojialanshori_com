import express from 'express';
import AuthController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Route login
router.post('/login', AuthController.login);

// Route untuk mendapatkan session user yang sedang login
router.get('/session', authMiddleware, AuthController.getSession);

export default router;
