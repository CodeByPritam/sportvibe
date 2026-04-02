import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// protected routes middleware
export const protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) { 
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        };

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -refreshTokens');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired', 
                code: 'TOKEN_EXPIRED' 
            });
        }
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};

// Optional
export const optionalAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (header?.startsWith('Bearer ')) {
            const token = header.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -refreshTokens');
        }
    } catch (_) {}
    next();
};