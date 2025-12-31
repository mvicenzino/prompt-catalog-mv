import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function useSubscription() {
    const { getToken, isSignedIn } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    const fetchSubscription = useCallback(async () => {
        if (!isSignedIn) {
            setSubscription(null);
            setIsLoaded(true);
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch('/api/billing/subscription', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscription(data);
                setError(null);
            } else {
                console.error('Failed to fetch subscription');
                setError('Failed to fetch subscription');
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
            setError(err.message);
        } finally {
            setIsLoaded(true);
        }
    }, [getToken, isSignedIn]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    // Checkout helper
    const checkout = useCallback(async (priceType) => {
        try {
            const token = await getToken();
            const response = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ priceType })
            });

            if (response.ok) {
                const { url } = await response.json();
                window.location.href = url;
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Checkout failed');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            throw err;
        }
    }, [getToken]);

    // Customer portal helper
    const openPortal = useCallback(async () => {
        try {
            const token = await getToken();
            const response = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const { url } = await response.json();
                window.location.href = url;
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to open portal');
            }
        } catch (err) {
            console.error('Portal error:', err);
            throw err;
        }
    }, [getToken]);

    return {
        // Subscription data
        plan: subscription?.plan || 'free',
        status: subscription?.status || 'active',
        usage: subscription?.usage || { prompts: 0, collections: 0 },
        limits: subscription?.limits || { prompts: 25, collections: 3, aiFeatures: false },

        // Computed states
        isPro: subscription?.plan === 'pro' || subscription?.plan === 'lifetime',
        isLifetime: subscription?.plan === 'lifetime',
        canCreatePrompt: subscription?.canCreatePrompt ?? true,
        canCreateCollection: subscription?.canCreateCollection ?? true,
        canUseAI: subscription?.limits?.aiFeatures ?? false,

        // Loading states
        isLoaded,
        error,

        // Actions
        refetch: fetchSubscription,
        checkout,
        openPortal
    };
}
