import mongoose from 'mongoose';

// Export DB Connection
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log(`MongoDB connected successfully with: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB error:', err.message);
        process.exit(1);
    }
};