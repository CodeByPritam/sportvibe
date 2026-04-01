import mongoose from 'mongoose';

// Export
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB error:', err.message);
        process.exit(1);
    }
};