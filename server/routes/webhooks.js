import express from 'express';
import Stripe from 'stripe';
import { query } from '../db.js';

const router = express.Router();

// Initialize Stripe
function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn('STRIPE_SECRET_KEY not configured');
        return null;
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Stripe webhook handler
// This endpoint must receive raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = getStripe();
    if (!stripe) {
        return res.status(503).json({ error: 'Payment system not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    // Verify webhook signature
    try {
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // For testing without webhook secret (not recommended for production)
            console.warn('STRIPE_WEBHOOK_SECRET not set - skipping signature verification');
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Stripe webhook received: ${event.type}`);

    try {
        switch (event.type) {
            // Checkout completed - activate subscription or lifetime purchase
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.userId;
                const priceType = session.metadata?.priceType;

                console.log(`Checkout completed for user ${userId}, type: ${priceType}`);

                if (userId) {
                    if (priceType === 'lifetime') {
                        // Lifetime purchase - one-time payment
                        await query(
                            `INSERT INTO subscriptions (user_id, plan, status, stripe_customer_id)
                             VALUES ($1, 'lifetime', 'active', $2)
                             ON CONFLICT (user_id) DO UPDATE SET
                                plan = 'lifetime',
                                status = 'active',
                                stripe_customer_id = COALESCE(subscriptions.stripe_customer_id, $2),
                                updated_at = NOW()`,
                            [userId, session.customer]
                        );
                        console.log(`User ${userId} upgraded to lifetime`);
                    } else if (session.subscription) {
                        // Pro subscription
                        await query(
                            `INSERT INTO subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id)
                             VALUES ($1, 'pro', 'active', $2, $3)
                             ON CONFLICT (user_id) DO UPDATE SET
                                plan = 'pro',
                                status = 'active',
                                stripe_customer_id = $2,
                                stripe_subscription_id = $3,
                                updated_at = NOW()`,
                            [userId, session.customer, session.subscription]
                        );
                        console.log(`User ${userId} upgraded to pro`);
                    }
                }
                break;
            }

            // Subscription updated - sync status and period end
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                const status = subscription.status === 'active' ? 'active' : subscription.status;
                const periodEnd = new Date(subscription.current_period_end * 1000);

                await query(
                    `UPDATE subscriptions
                     SET status = $1, current_period_end = $2, updated_at = NOW()
                     WHERE stripe_customer_id = $3`,
                    [status, periodEnd, customerId]
                );
                console.log(`Subscription updated for customer ${customerId}: ${status}`);
                break;
            }

            // Subscription deleted/canceled - downgrade to free
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                // Only downgrade if not lifetime (lifetime never expires)
                await query(
                    `UPDATE subscriptions
                     SET plan = 'free', status = 'canceled', stripe_subscription_id = NULL, updated_at = NOW()
                     WHERE stripe_customer_id = $1 AND plan != 'lifetime'`,
                    [customerId]
                );
                console.log(`Subscription canceled for customer ${customerId}`);
                break;
            }

            // Payment failed - mark as past due
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customerId = invoice.customer;

                await query(
                    `UPDATE subscriptions
                     SET status = 'past_due', updated_at = NOW()
                     WHERE stripe_customer_id = $1`,
                    [customerId]
                );
                console.log(`Payment failed for customer ${customerId}`);
                break;
            }

            // Invoice paid - reactivate if was past due
            case 'invoice.paid': {
                const invoice = event.data.object;
                const customerId = invoice.customer;

                await query(
                    `UPDATE subscriptions
                     SET status = 'active', updated_at = NOW()
                     WHERE stripe_customer_id = $1 AND plan != 'lifetime'`,
                    [customerId]
                );
                console.log(`Invoice paid for customer ${customerId}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

export default router;
