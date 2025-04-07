const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a token.'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Use environment variable with fallback, but warn if using fallback
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.warn('Warning: JWT_SECRET environment variable not set. Using insecure default value.');
        }
        
        const decoded = jwt.verify(token, jwtSecret || 'your-secret-key-for-jwt-tokens');
        
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or invalid token.'
            });
        }

        // Attach the full user object to the request for controllers to use
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = auth; 