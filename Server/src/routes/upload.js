import express from 'express';
import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '../config/r2.js';
import { protect } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

// Make Router instance
const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) return cb(new Error('Only video files allowed'), false);
        cb(null, true);
    },
});

// @route POST /api/upload/video
router.post('/video', protect, upload.single('video'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });
        const ext = req.file.originalname.split('.').pop().toLowerCase() || 'mp4';
        const key = `videos/${req.user._id}/${uuidv4()}.${ext}`;
        await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype }));
        res.json({ success: true, data: { videoUrl: `${R2_PUBLIC_URL}/${key}`, videoKey: key, originalName: req.file.originalname, size: req.file.size } });
    } catch (err) { 
        next(err); 
    }
});

// @route DELETE /api/upload/video
router.delete('/', protect, async (req, res, next) => {
    try {
        const { videoKey } = req.body;
        if (!videoKey) return res.status(400).json({ success: false, message: 'videoKey required' });
        if (!videoKey.includes(req.user._id.toString())) return res.status(403).json({ success: false, message: 'Not authorized' });
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: videoKey }));
        res.json({ success: true, message: 'File deleted' });
    } catch (err) { 
        next(err); 
    }
});

// Export
export default router;