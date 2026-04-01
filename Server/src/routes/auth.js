import express from 'express';
import User from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { protect } from '../middleware/auth.js';

// Make Router instance
const router = express.Router();

// Reggister User
router.post('/register', async (req, res, next) => {
    try {
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required' });
        if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        const user = await User.create({ name, username: username.replace('@','').toLowerCase(), email: email.toLowerCase(), password });
        const { accessToken, refreshToken } = generateTokens(user._id);
        await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });
        res.status(201).json({ success: true, data: { user: user.toPublicJSON(), accessToken, refreshToken } });
    } catch (err) { 
        next(err); 
    }
});

// Login User
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
        if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.json({ success: true, data: { user: user.toPublicJSON(), accessToken, refreshToken } });
    } catch (err) { 
        next(err); 
    }
});

// Refresh
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id).select('+refreshTokens');
        if (!user || !user.refreshTokens.includes(refreshToken)) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
        user.refreshTokens.push(newRefresh);
        await user.save();
        res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
    } catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        next(err);
    }
});

// Logout
router.post('/logout', protect, async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: refreshToken } });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) { next(err); }
});

// Me
router.get('/me', protect, (req, res) => {
    res.json({ success: true, data: { user: req.user.toPublicJSON() } });
});

// Export
export default router;