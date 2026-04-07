import express from 'express';
import Reel from '../models/Reel.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect, optionalAuth } from '../middleware/auth.js';

// Make Router instance
const router = express.Router();

// Helper to add like/comment counts and isLiked flag
const withLikeInfo = (reel, userId) => {
    const obj = reel.toObject ? reel.toObject() : { ...reel };
    obj.likesCount = (obj.likes || []).length;
    obj.commentsCount = (obj.comments || []).length;
    obj.isLiked = userId ? (obj.likes || []).some(id => id.toString() === userId.toString()) : false;
    return obj;
};

// Get feed of reels
router.get('/feed', optionalAuth, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 10;
        const reels = await Reel.find({ isPublished: true }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate('user','name username avatar location');
        const total = await Reel.countDocuments({ isPublished: true });

        // Response
        res.json({ 
            success: true, 
            data: { 
                reels: reels.map(r => withLikeInfo(r, req.user?._id)), total, page, pages: Math.ceil(total/limit) 
            } 
        });

    } catch (err) { next(err); }
});

// Scroll feed sorted by views
router.get('/scroll', optionalAuth, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip  = (page - 1) * limit;

        // Removed videoType filter
        const reels = await Reel.find({ isPublished: true })
            .sort({ createdAt: -1, views: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name username avatar location bio');

        // Response
        res.json({ 
            success: true, 
            data: { 
                reels: reels.map(r => withLikeInfo(r, req.user?._id)) 
            } 
        });

    } catch (err) { next(err); }
});

// Get reels by sport
router.get('/sport/:sport', optionalAuth, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 10;
        const filter = { isPublished: true, sport: req.params.sport };
        const reels = await Reel.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate('user','name username avatar');
        const total = await Reel.countDocuments(filter);

        // Response
        res.json({ 
            success: true, 
            data: { 
                reels: reels.map(r => withLikeInfo(r, req.user?._id)), 
                total, 
                page, 
                pages: Math.ceil(total/limit) 
            } 
        });

    } catch (err) { next(err); }
});

// Get single reel by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const reel = await Reel.findById(req.params.id).populate('user','name username avatar location bio').populate('comments.user','name username avatar');
        
        // Reels not found
        if (!reel) { 
            return res.status(404).json({ 
                success: false, 
                message: 'Reel not found' 
            });
        }

        Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

        // Response
        res.json({ 
            success: true, 
            data: { 
                reel: withLikeInfo(reel, req.user?._id) 
            } 
        });

    } catch (err) { next(err); }
});

// Create new reel
router.post('/', protect, async (req, res, next) => {
    try {
        const { title, caption, videoUrl, videoKey, thumbnailUrl, sport, videoType, tags, location, duration } = req.body;
        
        // Check required fields
        if (!title || !videoUrl || !videoKey) {
            return res.status(400).json({ 
                success: false, 
                message: 'title, videoUrl and videoKey are required' 
            });
        }

        const parsedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().replace(/^#/,''))) : [];
        const reel = await Reel.create({ user: req.user._id, title, caption, videoUrl, videoKey, thumbnailUrl, sport: sport||'general', videoType: videoType||'sports', tags: parsedTags, location: location||'', duration: duration||0 });
        await User.findByIdAndUpdate(req.user._id, { $inc: { reelsCount: 1 } });
        await reel.populate('user','name username avatar');

        // Response
        res.status(201).json({ 
            success: true, 
            data: { 
                reel: withLikeInfo(reel, req.user._id) 
            } 
        });

    } catch (err) { next(err); }
});

// Like/unlike reel
router.post('/:id/like', protect, async (req, res, next) => {
    try {
        const reel = await Reel.findById(req.params.id).populate('user','name _id');

        // Reels not found
        if (!reel) {
            return res.status(404).json({ 
                success: false, 
                message: 'Reel not found' 
            });
        }

        // isLiked check and update
        const isLiked = reel.likes.some(id => id.toString() === req.user._id.toString());
        if (isLiked) {
            await Reel.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } });
        } else {
            await Reel.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user._id } });
                if (reel.user._id.toString() !== req.user._id.toString()) {
                await Notification.create({ 
                    recipient: reel.user._id, 
                    sender: req.user._id, 
                    type: 'like', 
                    reel: reel._id, 
                    message: `${req.user.name} liked your reel "${reel.title}"` 
                });
            }
        }

        // Updated
        const updated = await Reel.findById(req.params.id);

        // Response
        res.json({ 
            success: true, 
            data: { 
                likesCount: updated.likes.length, 
                isLiked: !isLiked 
            } 
        });

    } catch (err) { next(err); }
});

// Add comment to reel
router.post('/:id/comment', protect, async (req, res, next) => {
    try {
        const { text } = req.body;

        // Check comment text
        if (!text?.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Comment text is required' 
            });
        }

        // Find Reel
        const reel = await Reel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ 
                success: false, 
                message: 'Reel not found' 
            });
        }

        // Create notification
        reel.comments.push({ user: req.user._id, text: text.trim() });
        await reel.save();
        if (reel.user.toString() !== req.user._id.toString()) {
            await Notification.create({ 
                recipient: reel.user, 
                sender: req.user._id, 
                type: 'comment', 
                reel: reel._id, 
                message: `${req.user.name} commented: "${text.trim().slice(0,60)}"` 
            });
        }

        // Populate & add comment count
        await reel.populate('comments.user','name username avatar');
        const newComment = reel.comments[reel.comments.length - 1];

        // Response
        res.status(201).json({ 
            success: true, 
            data: { 
                comment: newComment, 
                commentsCount: reel.comments.length 
            } 
        });
    } catch (err) { next(err); }
});

// Delete reel
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const reel = await Reel.findById(req.params.id);

        // Reel not found
        if (!reel) {
            return res.status(404).json({ 
                success: false, 
                message: 'Reel not found' 
            });
        }

        // Authorization check
        if (reel.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized' 
            });
        }

        // Delete reel
        await reel.deleteOne();
        await User.findByIdAndUpdate(req.user._id, { $inc: { reelsCount: -1 } });

        // Response
        res.json({ 
            success: true, 
            message: 'Reel deleted' 
        });

    } catch (err) { next(err); }
});

// Epxort
export default router;