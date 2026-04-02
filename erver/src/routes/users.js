import express from 'express';
import User from '../models/User.js';
import Reel from '../models/Reel.js';
import Notification from '../models/Notification.js';
import { protect, optionalAuth } from '../middleware/auth.js';

// Make Router instance
const router = express.Router();

// Trending creators
router.get('/trending/creators', optionalAuth, async (req, res, next) => {
    try {
        const users = await User.aggregate([
            { $addFields: { followerCount: { $size: '$followers' } } },
            { $sort: { followerCount: -1, reelsCount: -1 } },
            { $limit: 12 },
            { $project: { name:1, username:1, avatar:1, bio:1, sport:1, followerCount:1, reelsCount:1 } },
        ]);

        // Response
        res.json({ 
            success: true, 
            data: { users } 
        });

    } catch (err) { next(err); }
});

// Get user profile by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        // If user ID not found
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Get user's reels
        const reels = await Reel.find({ 
            user: user._id, 
            isPublished: true 
        }).sort({ createdAt: -1 }).limit(12).select('title thumbnailUrl videoUrl sport likes views createdAt');

        // Pub
        const pub = user.toPublicJSON();
        pub.isFollowing = req.user ? user.followers.some(f => f.toString() === req.user._id.toString()) : false;

        // Response
        res.json({ 
            success: true, 
            data: { 
                user: pub, 
                reels 
            } 
        });

    } catch (err) { next(err); }
});

// Update user profile
router.put('/profile', protect, async (req, res, next) => {
    try {
        const { name, bio, location, sport, avatar } = req.body;
        const updated = await User.findByIdAndUpdate(req.user._id, { name, bio, location, sport, avatar }, { new: true, runValidators: true });

        // Response
        res.json({ 
            success: true, 
            data: { 
                user: updated.toPublicJSON() 
            } 
        });

    } catch (err) { next(err); }
});

// Follow/unfollow user
router.post('/:id/follow', protect, async (req, res, next) => {
    try {

        // Prevent following self
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot follow yourself' 
            });
        }

        // Check if target user exists and if not exist return 404
        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check if already following
        const isFollowing = target.followers.some(f => f.toString() === req.user._id.toString());
        if (isFollowing) {
            await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id,  { $pull: { following: req.params.id } });
        } else {
            await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id,  { $addToSet: { following: req.params.id } });
            await Notification.create({ recipient: req.params.id, sender: req.user._id, type: 'follow', message: `${req.user.name} started following you` });
        }

        // Get updated followers count
        const updated = await User.findById(req.params.id);

        // Response
        res.json({ 
            success: true, 
            data: { 
                isFollowing: !isFollowing, 
                followersCount: updated.followers.length 
            } 
        });

    } catch (err) { next(err); }
});

// Export
export default router;