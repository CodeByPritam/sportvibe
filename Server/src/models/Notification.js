import mongoose from 'mongoose';

// Nortification Schema
const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like','comment','follow','mention'], required: true },
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', default: null },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

// make Index
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Export
export default mongoose.model('Notification', notificationSchema);