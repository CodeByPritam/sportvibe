import mongoose from 'mongoose';

// Reels Comment Schema
const commentSchema = new mongoose.Schema(
    { user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, text: { type: String, required: true, maxlength: 300 } },
    { timestamps: true }
);

// Reels Schema
const reelSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    caption: { type: String, default: '', maxlength: 500 },
    videoUrl: { type: String, required: true },
    videoKey: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    sport: { type: String, enum: ['football','basketball','tennis','cricket','formula1','boxing','swimming','athletics','general'], default: 'general' },
    videoType: { type: String, enum: ['sports','general'], default: 'sports' },
    tags: [{ type: String }],
    location: { type: String, default: '' },
    likes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
}, { timestamps: true });

// Generate Index
reelSchema.index({ sport: 1, createdAt: -1 });
reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ title: 'text', caption: 'text', tags: 'text' });

// Export
export default mongoose.model('Reel', reelSchema);