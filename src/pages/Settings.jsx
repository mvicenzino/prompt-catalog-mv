import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Copy, Check, Chrome, RefreshCw, Bot, Play, Calendar, Shield, CreditCard, Zap, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import { useSubscription } from '../hooks/useSubscription';

const Settings = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [searchParams] = useSearchParams();
    const {
        plan, usage, limits, isPro, isLifetime,
        checkout, openPortal, refetch: refetchSubscription, isLoaded: subscriptionLoaded
    } = useSubscription();
    const [token, setToken] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scraperStatus, setScraperStatus] = useState(null);
    const [scraperLoading, setScraperLoading] = useState(false);
    const [runningReddit, setRunningReddit] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(null);

    // Handle payment success/cancel from Stripe redirect
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            toast.success('Payment successful!', {
                description: 'Welcome to Pro! Your account has been upgraded.'
            });
            refetchSubscription();
        } else if (paymentStatus === 'canceled') {
            toast.info('Payment canceled', {
                description: 'No charges were made.'
            });
        }
    }, [searchParams, refetchSubscription]);

    const generateToken = useCallback(async () => {
        setLoading(true);
        try {
            const newToken = await getToken();
            setToken(newToken || '');
        } catch (error) {
            console.error('Failed to get token:', error);
        }
        setLoading(false);
    }, [getToken]);

    useEffect(() => {
        generateToken();
    }, [generateToken]);

    // Fetch scraper status
    const fetchScraperStatus = useCallback(async () => {
        try {
            const authToken = await getToken();
            const response = await fetch('/api/scraper/status', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setScraperStatus(data);
            }
        } catch (err) {
            console.error('Failed to fetch scraper status:', err);
        }
    }, [getToken]);

    useEffect(() => {
        fetchScraperStatus();
    }, [fetchScraperStatus]);

    const handleRunRedditScraper = async () => {
        setRunningReddit(true);
        try {
            const authToken = await getToken();
            const response = await fetch('/api/scraper/run/reddit', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                toast.success('Reddit scraper started!', {
                    description: 'Scraping prompts from Reddit. Check back in a few minutes.'
                });
            } else {
                toast.error('Failed to start scraper');
            }
        } catch (err) {
            toast.error('Failed to start scraper');
        } finally {
            setTimeout(() => {
                setRunningReddit(false);
                fetchScraperStatus();
            }, 5000);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="dashboard">
            <Header />
            <main className="main-content">
                <div className="content-wrapper">
                    <div className="dashboard-header">
                        <div>
                            <h1>Settings</h1>
                            <p className="dashboard-subtitle">Manage your account and integrations</p>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="card" style={{ maxWidth: '600px' }}>
                            <div className="card-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Chrome size={20} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chrome Extension</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Capture prompts directly from ChatGPT and Claude
                                </p>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Your API Token
                                    </h4>
                                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                        Copy this token and paste it in the PromptPal Chrome extension to connect your account.
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        alignItems: 'stretch'
                                    }}>
                                        <input
                                            type="text"
                                            value={token}
                                            readOnly
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem 1rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '8px',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem',
                                                fontFamily: 'monospace'
                                            }}
                                            placeholder="Loading..."
                                        />
                                        <button
                                            className="btn btn-ghost"
                                            onClick={handleCopy}
                                            disabled={!token}
                                            title="Copy token"
                                            style={{ padding: '0.75rem' }}
                                        >
                                            {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={generateToken}
                                            disabled={loading}
                                            title="Refresh token"
                                            style={{ padding: '0.75rem' }}
                                        >
                                            <RefreshCw size={18} className={loading ? 'spin' : ''} />
                                        </button>
                                    </div>
                                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        This token expires after a period of inactivity. Generate a new one if needed.
                                    </p>
                                </div>

                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}>
                                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>
                                        How to use the extension:
                                    </h4>
                                    <ol style={{
                                        margin: 0,
                                        paddingLeft: '1.25rem',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.8'
                                    }}>
                                        <li>Install the PromptPal extension from the Chrome Web Store</li>
                                        <li>Click the extension icon in your browser toolbar</li>
                                        <li>Paste your API token and click Connect</li>
                                        <li>Visit ChatGPT or Claude and click the floating button to save prompts</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ maxWidth: '600px', marginTop: '1.5rem' }}>
                            <div className="card-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Account</h3>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    {user?.imageUrl && (
                                        <img
                                            src={user.imageUrl}
                                            alt="Profile"
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                border: '2px solid var(--border-subtle)'
                                            }}
                                        />
                                    )}
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 500 }}>
                                            {user?.fullName || user?.firstName || 'User'}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {user?.primaryEmailAddress?.emailAddress}
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    marginBottom: '1rem'
                                }}>
                                    <span style={{ color: 'var(--text-muted)' }}>User ID: </span>
                                    <code style={{ color: 'var(--text-secondary)', userSelect: 'all' }}>{user?.id}</code>
                                </div>
                                <Link
                                    to="/app/admin"
                                    className="btn btn-ghost"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                                >
                                    <Shield size={16} />
                                    Admin Panel
                                </Link>
                            </div>
                        </div>

                        {/* Billing Section */}
                        <div className="card" style={{ maxWidth: '600px', marginTop: '1.5rem' }}>
                            <div className="card-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CreditCard size={20} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Subscription</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Manage your plan and billing
                                </p>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {/* Current Plan */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: isPro
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))'
                                        : 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    border: isPro ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            {isLifetime ? (
                                                <Crown size={18} style={{ color: '#f59e0b' }} />
                                            ) : isPro ? (
                                                <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
                                            ) : null}
                                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                {isLifetime ? 'Lifetime' : isPro ? 'Pro' : 'Free'} Plan
                                            </span>
                                            {isPro && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.15rem 0.5rem',
                                                    background: isLifetime ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                                    color: isLifetime ? '#f59e0b' : 'var(--accent-primary)',
                                                    borderRadius: '4px'
                                                }}>
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {isPro
                                                ? 'Unlimited prompts, collections, and AI features'
                                                : `${limits.prompts} prompts, ${limits.collections} collections`}
                                        </p>
                                    </div>
                                    {isPro && !isLifetime && (
                                        <button
                                            className="btn btn-ghost sm"
                                            onClick={async () => {
                                                try {
                                                    await openPortal();
                                                } catch (err) {
                                                    toast.error('Failed to open billing portal');
                                                }
                                            }}
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            Manage
                                        </button>
                                    )}
                                </div>

                                {/* Usage Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        padding: '0.75rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            Prompts
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                            {usage.prompts}
                                            {!isPro && (
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                                    {' '}/ {limits.prompts}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.75rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            Collections
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                            {usage.collections}
                                            {!isPro && (
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                                    {' '}/ {limits.collections}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Upgrade CTA for free users */}
                                {!isPro && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(245, 158, 11, 0.1))',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(99, 102, 241, 0.2)'
                                    }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
                                            Upgrade to Pro
                                        </h4>
                                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Get unlimited prompts, collections, and AI-powered features.
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <button
                                                className="btn btn-primary sm"
                                                onClick={async () => {
                                                    setCheckoutLoading('pro');
                                                    try {
                                                        await checkout('pro');
                                                    } catch (err) {
                                                        toast.error('Failed to start checkout');
                                                        setCheckoutLoading(null);
                                                    }
                                                }}
                                                disabled={checkoutLoading}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                {checkoutLoading === 'pro' ? (
                                                    <Loader2 size={14} className="spin" />
                                                ) : (
                                                    <Zap size={14} />
                                                )}
                                                Pro $7.99/mo
                                            </button>
                                            <button
                                                className="btn sm"
                                                onClick={async () => {
                                                    setCheckoutLoading('lifetime');
                                                    try {
                                                        await checkout('lifetime');
                                                    } catch (err) {
                                                        toast.error('Failed to start checkout');
                                                        setCheckoutLoading(null);
                                                    }
                                                }}
                                                disabled={checkoutLoading}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    background: '#f59e0b',
                                                    color: '#000',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {checkoutLoading === 'lifetime' ? (
                                                    <Loader2 size={14} className="spin" />
                                                ) : (
                                                    <Crown size={14} />
                                                )}
                                                Lifetime $99
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card" style={{ maxWidth: '600px', marginTop: '1.5rem' }}>
                            <div className="card-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Bot size={20} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Prompt Scraper</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Automatically discover prompts from Reddit communities
                                </p>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '8px',
                                        marginBottom: '1rem'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 500 }}>Reddit Scraper</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.15rem 0.5rem',
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    color: '#10b981',
                                                    borderRadius: '4px'
                                                }}>
                                                    Active
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                r/ChatGPT, r/PromptEngineering, r/midjourney, r/StableDiffusion
                                            </p>
                                        </div>
                                        <button
                                            className="btn btn-primary sm"
                                            onClick={handleRunRedditScraper}
                                            disabled={runningReddit}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            {runningReddit ? (
                                                <RefreshCw size={16} className="spin" />
                                            ) : (
                                                <Play size={16} />
                                            )}
                                            {runningReddit ? 'Running...' : 'Run Now'}
                                        </button>
                                    </div>

                                    {scraperStatus && (
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                <span>Schedule: {scraperStatus.schedule}</span>
                                            </div>
                                            {scraperStatus.lastRun && (
                                                <div>
                                                    Last run: {new Date(scraperStatus.lastRun).toLocaleString()}
                                                    {scraperStatus.reddit && (
                                                        <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>
                                                            ({scraperStatus.reddit.saved || 0} prompts saved)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {scraperStatus.nextRun && (
                                                <div>
                                                    Next scheduled run: {new Date(scraperStatus.nextRun).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                                        Sources being scraped:
                                    </h4>
                                    <ul style={{
                                        margin: 0,
                                        paddingLeft: '1.25rem',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.6'
                                    }}>
                                        <li>r/ChatGPT - General ChatGPT prompts</li>
                                        <li>r/PromptEngineering - Advanced prompt techniques</li>
                                        <li>r/midjourney - Image generation prompts</li>
                                        <li>r/StableDiffusion - AI art prompts</li>
                                        <li>r/ClaudeAI - Claude-specific prompts</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
