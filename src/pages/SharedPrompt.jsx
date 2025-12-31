import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, Check, ArrowLeft, Variable } from 'lucide-react';
import { toast } from 'sonner';
import { getSourceIcon } from '../utils/sourceIcon';
import '../landing.css';

const SharedPrompt = () => {
    const { shareId } = useParams();
    const [prompt, setPrompt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [variables, setVariables] = useState({});

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const response = await fetch(`/api/prompts/shared/${shareId}`);
                if (!response.ok) {
                    throw new Error('Prompt not found');
                }
                const data = await response.json();
                setPrompt(data);

                // Extract variables from content
                const doublebraceRegex = /\{\{([^}]+)\}\}/g;
                const bracketRegex = /\[([^\]]+)\]/g;
                const doublebraceMatches = [...data.content.matchAll(doublebraceRegex)];
                const bracketMatches = [...data.content.matchAll(bracketRegex)];

                const vars = {};
                if (doublebraceMatches.length > 0) {
                    doublebraceMatches.forEach(match => {
                        vars[match[1].trim()] = '';
                    });
                } else {
                    bracketMatches.forEach(match => {
                        vars[match[1].trim()] = '';
                    });
                }
                setVariables(vars);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrompt();
    }, [shareId]);

    // Calculate filled content
    const filledContent = useMemo(() => {
        if (!prompt) return '';
        let content = prompt.content;
        const usesDoubleBrace = /\{\{[^}]+\}\}/.test(prompt.content);

        Object.entries(variables).forEach(([key, value]) => {
            if (value.trim()) {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (usesDoubleBrace) {
                    content = content.replace(new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g'), value);
                } else {
                    content = content.replace(new RegExp(`\\[${escapedKey}\\]`, 'g'), value);
                }
            }
        });
        return content;
    }, [prompt, variables]);

    const hasVariables = Object.keys(variables).length > 0;

    const handleVariableChange = (key, value) => {
        setVariables(prev => ({ ...prev, [key]: value }));
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(filledContent);
            setIsCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    // Render content with highlighted variables
    const renderContentWithHighlights = () => {
        if (!prompt) return null;

        const allFilled = Object.values(variables).every(v => v.trim());
        if (allFilled || Object.keys(variables).length === 0) {
            return filledContent;
        }

        const usesDoubleBrace = /\{\{[^}]+\}\}/.test(prompt.content);
        const regex = usesDoubleBrace ? /\{\{([^}]+)\}\}/g : /\[([^\]]+)\]/g;

        const parts = [];
        let lastIndex = 0;
        let match;
        const content = filledContent;

        while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.slice(lastIndex, match.index));
            }

            const varName = match[1].trim();
            if (!variables[varName] || !variables[varName].trim()) {
                parts.push(
                    <span
                        key={match.index}
                        style={{
                            background: 'rgba(255, 225, 53, 0.2)',
                            color: 'var(--accent-primary)',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            fontWeight: 500
                        }}
                    >
                        {match[0]}
                    </span>
                );
            } else {
                parts.push(match[0]);
            }
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            parts.push(content.slice(lastIndex));
        }

        return parts.length > 0 ? parts : content;
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
                        {hasVariables && (
                            <span className="badge" style={{ background: 'rgba(255, 225, 53, 0.2)', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Variable size={12} />
                                {Object.keys(variables).length} variables
                            </span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{prompt.title}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Shared from PromptPal
                    </p>
                </div>

                {hasVariables && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.25rem',
                        background: 'rgba(255, 225, 53, 0.05)',
                        border: '1px solid rgba(255, 225, 53, 0.2)',
                        borderRadius: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Variable size={18} style={{ color: 'var(--accent-primary)' }} />
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                                Fill in Variables
                            </h3>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            {Object.keys(variables).map(variable => (
                                <div key={variable}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.4rem'
                                    }}>
                                        <span style={{ color: 'var(--accent-primary)' }}>{'{{'}</span>
                                        {variable}
                                        <span style={{ color: 'var(--accent-primary)' }}>{'}}'}</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder={`Enter ${variable}...`}
                                        value={variables[variable]}
                                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-card)',
                                            border: variables[variable] ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                        {renderContentWithHighlights()}
                    </pre>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <button
                        className={`btn btn-primary ${isCopied ? 'success' : ''}`}
                        onClick={handleCopy}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />}
                        {isCopied ? 'Copied!' : hasVariables ? 'Copy Filled Prompt' : 'Copy Prompt'}
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
