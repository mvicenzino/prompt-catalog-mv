import express from 'express';
import Stripe from 'stripe';
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

        // Get price ID based on type
        const priceId = priceType === 'lifetime'
            ? process.env.STRIPE_PRICE_LIFETIME
            : process.env.STRIPE_PRICE_PRO_MONTHLY;

        if (!priceId) {
            return res.status(400).json({ error: 'Invalid price type' });
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

        const session = await stripe.checkout.sessions.create(sessionParams);

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
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

export default router;
export { getOrCreateSubscription, getUserUsage };
