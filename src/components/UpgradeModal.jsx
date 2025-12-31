import { useState } from 'react';
import { X, Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '../hooks/useSubscription';

const UpgradeModal = ({ isOpen, onClose, reason = 'feature' }) => {
    const { usage, limits, checkout } = useSubscription();
    const [loading, setLoading] = useState(null);

    if (!isOpen) return null;

    const handleCheckout = async (priceType) => {
        setLoading(priceType);
        try {
            await checkout(priceType);
        } catch (err) {
            toast.error('Failed to start checkout', {
                description: err.message
            });
            setLoading(null);
        }
    };

    // Contextual message based on reason
    const getMessage = () => {
        switch (reason) {
            case 'prompt_limit':
                return `You've reached your limit of ${limits.prompts} prompts.`;
            case 'collection_limit':
                return `You've reached your limit of ${limits.collections} collections.`;
            case 'ai_feature':
                return 'AI features are available on Pro and Lifetime plans.';
            default:
                return 'Upgrade to unlock all features.';
        }
    };

    const features = [
        { text: 'Unlimited prompts', free: false, pro: true },
        { text: 'Unlimited collections', free: false, pro: true },
        { text: 'AI-powered categorization', free: false, pro: true },
        { text: 'AI prompt enhancement', free: false, pro: true },
        { text: 'Priority support', free: false, pro: true },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            <Sparkles size={24} style={{ color: '#f59e0b' }} />
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Upgrade to Pro</h2>
                        </div>
                        <p style={{
                            margin: 0,
                            color: 'var(--text-secondary)',
                            fontSize: '0.95rem'
                        }}>
                            {getMessage()}
                        </p>
                    </div>
                    <button
                        className="btn btn-ghost"
                        onClick={onClose}
                        style={{ padding: '0.5rem' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Current usage */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Prompts
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                            {usage.prompts} / {limits.prompts === 'unlimited' ? '∞' : limits.prompts}
                        </div>
                    </div>
                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Collections
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                            {usage.collections} / {limits.collections === 'unlimited' ? '∞' : limits.collections}
                        </div>
                    </div>
                </div>

                {/* Pricing cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    {/* Pro Monthly */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                        border: '2px solid var(--accent-primary)',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
                            <span style={{ fontWeight: 600 }}>Pro Monthly</span>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>$7.99</span>
                            <span style={{ color: 'var(--text-muted)' }}>/month</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleCheckout('pro')}
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading === 'pro' ? (
                                <Loader2 size={18} className="spin" />
                            ) : (
                                'Subscribe'
                            )}
                        </button>
                    </div>

                    {/* Lifetime */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
                        border: '2px solid #f59e0b',
                        borderRadius: '12px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '12px',
                            background: '#f59e0b',
                            color: '#000',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                        }}>
                            BEST VALUE
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            <Crown size={18} style={{ color: '#f59e0b' }} />
                            <span style={{ fontWeight: 600 }}>Lifetime</span>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>$99</span>
                            <span style={{ color: 'var(--text-muted)' }}> one-time</span>
                        </div>
                        <button
                            className="btn"
                            onClick={() => handleCheckout('lifetime')}
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: '#f59e0b',
                                color: '#000',
                                fontWeight: 600
                            }}
                        >
                            {loading === 'lifetime' ? (
                                <Loader2 size={18} className="spin" />
                            ) : (
                                'Get Lifetime'
                            )}
                        </button>
                    </div>
                </div>

                {/* Features comparison */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '1.25rem'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>
                        What you get with Pro
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {features.map((feature, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '0.9rem'
                            }}>
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Check size={12} style={{ color: '#22c55e' }} />
                                </div>
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <p style={{
                    margin: '1rem 0 0 0',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center'
                }}>
                    Cancel anytime. Secure checkout powered by Stripe.
                </p>
            </div>
        </div>
    );
};

export default UpgradeModal;
