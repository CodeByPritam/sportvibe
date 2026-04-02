import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateTokens = (userId) => {

    // Access
    const accessToken  = jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Refresh
    const refreshToken = jwt.sign(
        { id: userId }, 
        process.env.JWT_REFRESH_SECRET, 
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Return
    return { accessToken, refreshToken };
};

// Export
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);