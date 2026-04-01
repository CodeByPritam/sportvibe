import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

// Make Router instance
const router = express.Router();

// @route   GET /api/notifications
router.get('/', protect, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 20;
        const [notifications, unreadCount] = await Promise.all([
        Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate('sender','name username avatar').populate('reel','title thumbnailUrl'),
        Notification.countDocuments({ recipient: req.user._id, isRead: false }),
        ]);
        res.json({ success: true, data: { notifications, unreadCount } });
    } catch (err) { 
        next(err); 
    }
});

// @route   PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) { 
        next(err); 
    }
});

// @route   PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
        res.json({ success: true });
    } catch (err) { 
        next(err); 
    }
});

// Export
export default router;