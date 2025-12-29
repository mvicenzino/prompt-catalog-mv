import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// This middleware populates req.auth
export const authenticateToken = (req, res, next) => {
    // Custom wrapper to debug
    return ClerkExpressWithAuth()(req, res, (err) => {
        if (err) {
            console.error('Clerk Auth Error:', err);
            return next(err);
        }
        // console.log('Auth Status:', req.auth ? req.auth.userId : 'No Auth');
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
