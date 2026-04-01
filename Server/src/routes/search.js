import express from 'express';
import User from '../models/User.js';
import Reel from '../models/Reel.js';
import { optionalAuth } from '../middleware/auth.js';

// Make Router instance
const router = express.Router();

// Search
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const q = (req.query.q || '').trim();

        // q field Check
        if (!q) {
            return res.json({ 
                success: true, 
                data: { 
                    users: [], 
                    reels: [] 
                } 
            });
        }

        // Regex for case-insensitive search
        const regex = new RegExp(q, 'i');
        const [users, reels] = await Promise.all([
        User.find({ $or: [
            { name: regex }, 
            { username: regex }, 
            { bio: regex }, 
            { location: regex }
        ]}).select('name username avatar bio location sport followers reelsCount').limit(10),

        // Find
        Reel.find({ 
            isPublished: true, 
            $or: [
                { title: regex }, 
                { caption: regex }, 
                { tags: regex }, 
                { sport: regex }
            ]}).sort({ views: -1 }).limit(12).populate('user','name username avatar'),
        ]);

        // Map users to include followersCount and isFollowing
        const usersOut = users.map(u => ({ 
            ...u.toObject(), 
            followersCount: u.followers.length, 
            isFollowing: req.user ? u.followers.some(f => f.toString() === req.user._id.toString()) : false 
        }));

        // Response
        res.json({ 
            success: true, 
            data: { 
                users: usersOut, 
                reels 
            } 
        });

    } catch (err) { next(err); }
});

// Export
export default router;