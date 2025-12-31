import { query } from '../db.js';

// Plan limits configuration
export const PLAN_LIMITS = {
    free: { prompts: 25, collections: 3, aiFeatures: false },
    pro: { prompts: Infinity, collections: Infinity, aiFeatures: true },
    lifetime: { prompts: Infinity, collections: Infinity, aiFeatures: true }
};

// Helper: Get user's subscription plan
export async function getUserPlan(userId) {
    const result = await query('SELECT plan, status FROM subscriptions WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
        // Create free subscription for new user
        await query(
            'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
            [userId, 'free', 'active']
        );
        return 'free';
    }

    const sub = result.rows[0];
    // If subscription is not active (past_due, canceled), treat as free
    if (sub.status !== 'active') {
        return 'free';
    }

    return sub.plan;
}

// Helper: Get user's current usage
export async function getUserUsage(userId) {
    const [promptsResult, collectionsResult] = await Promise.all([
        query('SELECT COUNT(*) FROM prompts WHERE user_id = $1', [userId]),
        query('SELECT COUNT(*) FROM collections WHERE user_id = $1', [userId])
    ]);

    return {
        prompts: parseInt(promptsResult.rows[0].count),
        collections: parseInt(collectionsResult.rows[0].count)
    };
}

// Middleware: Check if user can create a prompt
export const checkPromptLimit = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const plan = await getUserPlan(userId);
        const limits = PLAN_LIMITS[plan];
        const usage = await getUserUsage(userId);

        if (limits.prompts !== Infinity && usage.prompts >= limits.prompts) {
            return res.status(402).json({
                error: 'Prompt limit reached',
                code: 'PROMPT_LIMIT_REACHED',
                usage: usage.prompts,
                limit: limits.prompts,
                plan,
                upgrade: true
            });
        }

        // Attach subscription info to request for downstream use
        req.subscription = { plan, limits, usage };
        next();
    } catch (error) {
        console.error('Error checking prompt limit:', error);
        next(error);
    }
};

// Middleware: Check if user can create a collection
export const checkCollectionLimit = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const plan = await getUserPlan(userId);
        const limits = PLAN_LIMITS[plan];
        const usage = await getUserUsage(userId);

        if (limits.collections !== Infinity && usage.collections >= limits.collections) {
            return res.status(402).json({
                error: 'Collection limit reached',
                code: 'COLLECTION_LIMIT_REACHED',
                usage: usage.collections,
                limit: limits.collections,
                plan,
                upgrade: true
            });
        }

        req.subscription = { plan, limits, usage };
        next();
    } catch (error) {
        console.error('Error checking collection limit:', error);
        next(error);
    }
};

// Middleware: Check if user has access to AI features
export const checkAIAccess = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const plan = await getUserPlan(userId);
        const limits = PLAN_LIMITS[plan];

        if (!limits.aiFeatures) {
            return res.status(402).json({
                error: 'AI features require Pro plan',
                code: 'AI_FEATURES_LOCKED',
                plan,
                upgrade: true
            });
        }

        req.subscription = { plan, limits };
        next();
    } catch (error) {
        console.error('Error checking AI access:', error);
        next(error);
    }
};
