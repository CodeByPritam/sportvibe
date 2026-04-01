import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schama for User model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 60 },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 200 },
    location:{ type: String, default: '' },
    sport: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reelsCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    refreshTokens: [{ type: String, select: false }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshTokens;
    obj.followersCount = (obj.followers || []).length;
    obj.followingCount = (obj.following || []).length;
    return obj;
};

// Save & Export
export default mongoose.model('User', userSchema);