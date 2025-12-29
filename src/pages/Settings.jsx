import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Copy, Check, Chrome, RefreshCw, Bot, Play, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';

const Settings = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [token, setToken] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scraperStatus, setScraperStatus] = useState(null);
    const [scraperLoading, setScraperLoading] = useState(false);
    const [runningReddit, setRunningReddit] = useState(false);

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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
