import express from 'express';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { query } from '../db.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe (lazy load)
let stripeClient = null;
function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn('STRIPE_SECRET_KEY not configured');
        return null;
    }
    if (!stripeClient) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
}

// Plan limits configuration
export const PLAN_LIMITS = {
    free: { prompts: 25, collections: 3, aiFeatures: false },
    pro: { prompts: Infinity, collections: Infinity, aiFeatures: true },
    lifetime: { prompts: Infinity, collections: Infinity, aiFeatures: true }
};

// Helper: Get or create subscription record for user
async function getOrCreateSubscription(userId) {
    let result = await query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
        // Create free subscription for new user
        result = await query(
            'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, 'free', 'active']
        );
    }

    return result.rows[0];
}

// Helper: Get user's current usage
async function getUserUsage(userId) {
    const [promptsResult, collectionsResult] = await Promise.all([
        query('SELECT COUNT(*) FROM prompts WHERE user_id = $1', [userId]),
        query('SELECT COUNT(*) FROM collections WHERE user_id = $1', [userId])
    ]);

    return {
        prompts: parseInt(promptsResult.rows[0].count),
        collections: parseInt(collectionsResult.rows[0].count)
    };
}

// GET /api/billing/status - Check Stripe configuration (no auth needed for debug)
router.get('/status', (req, res) => {
    const key = process.env.STRIPE_SECRET_KEY || '';
    const isLive = key.startsWith('sk_live_');
    const isTest = key.startsWith('sk_test_');
    const keyPrefix = key.substring(0, 8) + '...';

    res.json({
        stripeConfigured: !!key,
        mode: isLive ? 'LIVE' : isTest ? 'TEST' : 'UNKNOWN',
        keyPrefix: keyPrefix,
        priceProConfigured: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
        priceLifetimeConfigured: !!process.env.STRIPE_PRICE_LIFETIME,
        webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
        priceProId: process.env.STRIPE_PRICE_PRO_MONTHLY?.substring(0, 20) + '...',
        priceLifetimeId: process.env.STRIPE_PRICE_LIFETIME?.substring(0, 20) + '...',
        appUrl: process.env.APP_URL || 'NOT SET (will use localhost)'
    });
});

// GET /api/billing/test-checkout - Test checkout creation (debug only)
router.get('/test-checkout', async (req, res) => {
    try {
        const stripe = getStripe();
        if (!stripe) {
            return res.json({ error: 'Stripe not configured' });
        }

        const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
        if (!priceId) {
            return res.json({ error: 'STRIPE_PRICE_PRO_MONTHLY not set' });
        }

        // Try to retrieve the price to verify it exists
        try {
            const price = await stripe.prices.retrieve(priceId);

            // Also try creating a test checkout session
            const appUrl = process.env.APP_URL || 'https://prompt-catalog-mv.vercel.app';
            const sessionParams = {
                payment_method_types: ['card'],
                line_items: [{
                    price: priceId,
                    quantity: 1
                }],
                mode: 'subscription',
                success_url: `${appUrl}/app/settings?payment=success`,
                cancel_url: `${appUrl}/app/settings?payment=canceled`,
            };

            const session = await stripe.checkout.sessions.create(sessionParams);

            return res.json({
                success: true,
                priceId: priceId,
                priceActive: price.active,
                priceAmount: price.unit_amount,
                priceCurrency: price.currency,
                priceType: price.type,
                productId: price.product,
                testSessionCreated: true,
                testSessionUrl: session.url
            });
        } catch (priceError) {
            return res.json({
                error: 'Test failed',
                details: priceError.message,
                code: priceError.code,
                type: priceError.type,
                priceId: priceId
            });
        }
    } catch (error) {
        return res.json({
            error: 'Test failed',
            details: error.message
        });
    }
});

// GET /api/billing/subscription - Get current subscription
router.get('/subscription', authenticateToken, requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const subscription = await getOrCreateSubscription(userId);
        const usage = await getUserUsage(userId);
        const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;

        res.json({
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            stripeCustomerId: subscription.stripe_customer_id,
            usage,
            limits: {
                prompts: limits.prompts === Infinity ? 'unlimited' : limits.prompts,
                collections: limits.collections === Infinity ? 'unlimited' : limits.collections,
                aiFeatures: limits.aiFeatures
            },
            canCreatePrompt: limits.prompts === Infinity || usage.prompts < limits.prompts,
            canCreateCollection: limits.collections === Infinity || usage.collections < limits.collections
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

// GET /api/billing/usage - Get usage stats only
router.get('/usage', authenticateToken, requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const subscription = await getOrCreateSubscription(userId);
        const usage = await getUserUsage(userId);
        const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;

        res.json({
            plan: subscription.plan,
            usage,
            limits: {
                prompts: limits.prompts === Infinity ? 'unlimited' : limits.prompts,
                collections: limits.collections === Infinity ? 'unlimited' : limits.collections,
                aiFeatures: limits.aiFeatures
            }
        });
    } catch (error) {
        console.error('Error fetching usage:', error);
        res.status(500).json({ error: 'Failed to fetch usage' });
    }
});

// POST /api/billing/checkout - Create Stripe checkout session
router.post('/checkout', authenticateToken, requireAuth, async (req, res) => {
    try {
        const stripe = getStripe();
        if (!stripe) {
            return res.status(503).json({ error: 'Payment system not configured' });
        }

        const userId = req.auth.userId;
        const { priceType } = req.body; // 'pro' or 'lifetime'

        console.log('Checkout request:', { priceType, userId });

        // Get price ID based on type
        const priceId = priceType === 'lifetime'
            ? process.env.STRIPE_PRICE_LIFETIME
            : process.env.STRIPE_PRICE_PRO_MONTHLY;

        console.log('Price ID:', priceId);

        if (!priceId) {
            return res.status(400).json({ error: `Price not configured for ${priceType}` });
        }

        // Get or create subscription record
        const subscription = await getOrCreateSubscription(userId);

        // Get or create Stripe customer
        let customerId = subscription.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                metadata: { userId }
            });
            customerId = customer.id;
            await query(
                'UPDATE subscriptions SET stripe_customer_id = $1 WHERE user_id = $2',
                [customerId, userId]
            );
        }

        // Create checkout session
        const sessionParams = {
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            mode: priceType === 'lifetime' ? 'payment' : 'subscription',
            success_url: `${process.env.APP_URL || 'http://localhost:5173'}/app/settings?payment=success`,
            cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/app/settings?payment=canceled`,
            metadata: {
                userId,
                priceType
            }
        };

        // For lifetime, we need to handle it differently
        if (priceType === 'lifetime') {
            sessionParams.payment_intent_data = {
                metadata: { userId, priceType }
            };
        }

        console.log('Creating checkout session with params:', JSON.stringify(sessionParams, null, 2));
        const session = await stripe.checkout.sessions.create(sessionParams);

        console.log('Checkout session created:', session.id);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({
            error: 'Failed to create checkout session',
            details: error.message,
            type: error.type
        });
    }
});

// POST /api/billing/portal - Create Stripe customer portal session
router.post('/portal', authenticateToken, requireAuth, async (req, res) => {
    try {
        const stripe = getStripe();
        if (!stripe) {
            return res.status(503).json({ error: 'Payment system not configured' });
        }

        const userId = req.auth.userId;
        const subscription = await getOrCreateSubscription(userId);

        if (!subscription.stripe_customer_id) {
            return res.status(400).json({ error: 'No billing account found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${process.env.APP_URL || 'http://localhost:5173'}/app/settings`
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

// Note: Webhook handler is in /api/webhooks/stripe (see routes/webhooks.js)

// ============================================
// ADMIN ROUTES (for testing & user management)
// ============================================

const isAdmin = (userId) => {
    const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
    return adminIds.includes(userId);
};

// GET /api/billing/admin/users - List all users with subscriptions
router.get('/admin/users', authenticateToken, requireAuth, async (req, res) => {
    try {
        if (!isAdmin(req.auth.userId)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await query(`
            SELECT
                s.user_id,
                s.plan,
                s.status,
                s.stripe_customer_id,
                s.created_at,
                s.updated_at,
                (SELECT COUNT(*) FROM prompts WHERE user_id = s.user_id) as prompt_count,
                (SELECT COUNT(*) FROM collections WHERE user_id = s.user_id) as collection_count
            FROM subscriptions s
            ORDER BY s.created_at DESC
            LIMIT 100
        `);

        // Fetch user details from Clerk for each user
        const usersWithDetails = await Promise.all(
            result.rows.map(async (row) => {
                try {
                    const clerkUser = await clerkClient.users.getUser(row.user_id);
                    return {
                        ...row,
                        email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
                        firstName: clerkUser.firstName || null,
                        lastName: clerkUser.lastName || null,
                        fullName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
                        imageUrl: clerkUser.imageUrl || null
                    };
                } catch (err) {
                    // User might not exist in Clerk (test user)
                    return {
                        ...row,
                        email: null,
                        firstName: null,
                        lastName: null,
                        fullName: null,
                        imageUrl: null
                    };
                }
            })
        );

        res.json(usersWithDetails);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PUT /api/billing/admin/users/:userId/plan - Update a user's plan (for testing)
router.put('/admin/users/:userId/plan', authenticateToken, requireAuth, async (req, res) => {
    try {
        if (!isAdmin(req.auth.userId)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId } = req.params;
        const { plan } = req.body;

        if (!['free', 'pro', 'lifetime'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan. Must be: free, pro, or lifetime' });
        }

        // Update or create subscription
        const existing = await query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);

        if (existing.rows.length === 0) {
            await query(
                'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
                [userId, plan, 'active']
            );
        } else {
            await query(
                'UPDATE subscriptions SET plan = $1, status = $2, updated_at = NOW() WHERE user_id = $3',
                [plan, 'active', userId]
            );
        }

        res.json({ success: true, userId, plan });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// POST /api/billing/admin/users - Create a test user subscription
router.post('/admin/users', authenticateToken, requireAuth, async (req, res) => {
    try {
        if (!isAdmin(req.auth.userId)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId, plan = 'free' } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        if (!['free', 'pro', 'lifetime'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan. Must be: free, pro, or lifetime' });
        }

        // Check if user already exists
        const existing = await query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User subscription already exists' });
        }

        const result = await query(
            'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, plan, 'active']
        );

        res.json({ success: true, subscription: result.rows[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// DELETE /api/billing/admin/users/:userId - Delete a user's subscription (for testing)
router.delete('/admin/users/:userId', authenticateToken, requireAuth, async (req, res) => {
    try {
        if (!isAdmin(req.auth.userId)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId } = req.params;

        await query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);

        res.json({ success: true, userId });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// PUT /api/billing/admin/my-plan - Quick switch for admin's own plan (convenience for testing)
router.put('/admin/my-plan', authenticateToken, requireAuth, async (req, res) => {
    try {
        if (!isAdmin(req.auth.userId)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const userId = req.auth.userId;
        const { plan } = req.body;

        if (!['free', 'pro', 'lifetime'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan. Must be: free, pro, or lifetime' });
        }

        await query(
            'UPDATE subscriptions SET plan = $1, status = $2, updated_at = NOW() WHERE user_id = $3',
            [plan, 'active', userId]
        );

        res.json({ success: true, plan });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

export default router;
export { getOrCreateSubscription, getUserUsage };
