import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getSourceIcon } from '../utils/sourceIcon';
import '../landing.css';

const SharedPrompt = () => {
    const { shareId } = useParams();
    const [prompt, setPrompt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const response = await fetch(`/api/prompts/shared/${shareId}`);
                if (!response.ok) {
                    throw new Error('Prompt not found');
                }
                const data = await response.json();
                setPrompt(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrompt();
    }, [shareId]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt.content);
            setIsCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    if (loading) {
        return (
            <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Prompt not found</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>This shared link may have expired or been removed.</p>
                    <Link to="/" className="btn btn-primary">Go to PromptPal</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-page">
            <nav className="landing-nav" style={{ position: 'relative', background: 'var(--bg-app)' }}>
                <div className="container nav-container">
                    <Link to="/" className="btn btn-ghost">
                        <ArrowLeft size={20} /> PromptPal
                    </Link>
                </div>
            </nav>

            <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="badge-group" style={{ marginBottom: '1rem' }}>
                        <span className="badge source-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {getSourceIcon(prompt.source, 14)}
                            {prompt.source}
                        </span>
                        <span className="badge category-badge">{prompt.category}</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{prompt.title}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Shared from PromptPal
                    </p>
                </div>

                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        {prompt.content}
                    </pre>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <button
                        className={`btn btn-primary ${isCopied ? 'success' : ''}`}
                        onClick={handleCopy}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />}
                        {isCopied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                    <Link to="/sign-up" className="btn btn-secondary">
                        Create Your Own Library
                    </Link>
                </div>

                {prompt.tags && prompt.tags.length > 0 && (
                    <div className="tags">
                        {prompt.tags.map(tag => (
                            <span key={tag} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedPrompt;
