import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// This middleware populates req.auth
export const authenticateToken = (req, res, next) => {
    // Log incoming auth header for debugging
    const authHeader = req.headers.authorization;
    if (authHeader) {
        console.log('Auth header received:', authHeader.substring(0, 50) + '...');
    }

    // Custom wrapper to debug
    return ClerkExpressWithAuth()(req, res, (err) => {
        if (err) {
            console.error('Clerk Auth Error:', err);
            return next(err);
        }
        console.log('Auth Status:', req.auth ? req.auth.userId : 'No Auth');
        next();
    });
};

// Helper to enforce auth
export const requireAuth = (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};
