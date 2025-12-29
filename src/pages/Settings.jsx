import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Copy, Check, Chrome, RefreshCw } from 'lucide-react';
import Header from '../components/Header';

const Settings = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [token, setToken] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
