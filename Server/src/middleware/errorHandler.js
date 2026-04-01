// Global Error Handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('[ERROR]', err.message);
        if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ success: false, message: `${field} already in use` });
    }
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
};