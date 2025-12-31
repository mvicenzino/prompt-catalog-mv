import { useState, useMemo, useRef, useEffect } from 'react';
import { Copy, Star, Check, GitFork, ThumbsUp, ThumbsDown, Variable, X, ExternalLink, Play } from 'lucide-react';
import { toast } from 'sonner';
import { getSourceIcon } from '../utils/sourceIcon';
import { ChatGPTIcon, ClaudeIcon } from './AIIcons';

const PromptCard = ({ prompt, onToggleFavorite, onVote }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [showVariables, setShowVariables] = useState(false);
    const [variables, setVariables] = useState({});
    const popoverRef = useRef(null);

    // Extract variables from prompt content
    const extractedVariables = useMemo(() => {
        const doublebraceRegex = /\{\{([^}]+)\}\}/g;
        const bracketRegex = /\[([^\]]+)\]/g;
        const doublebraceMatches = [...prompt.content.matchAll(doublebraceRegex)];
        const bracketMatches = [...prompt.content.matchAll(bracketRegex)];

        const vars = {};
        if (doublebraceMatches.length > 0) {
            doublebraceMatches.forEach(match => {
                vars[match[1].trim()] = '';
            });
        } else if (bracketMatches.length > 0) {
            bracketMatches.forEach(match => {
                vars[match[1].trim()] = '';
            });
        }
        return vars;
    }, [prompt.content]);

    const hasVariables = Object.keys(extractedVariables).length > 0;

    // Reset variables when popover opens
    useEffect(() => {
        if (showVariables) {
            setVariables(extractedVariables);
        }
    }, [showVariables, extractedVariables]);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setShowVariables(false);
            }
        };
        if (showVariables) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showVariables]);

    // Get filled content
    const getFilledContent = () => {
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
    };

    const handleVote = async (e, voteType) => {
        e.stopPropagation();
        if (isVoting || !onVote) return;

        setIsVoting(true);
        const newVoteType = prompt.userVote === voteType ? 'none' : voteType;
        await onVote(prompt.id, newVoteType);
        setIsVoting(false);
    };

    const voteScore = (prompt.upvotes || 0) - (prompt.downvotes || 0);

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(prompt.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleCopyFilled = async (e) => {
        e.stopPropagation();
        try {
            const filled = getFilledContent();
            await navigator.clipboard.writeText(filled);
            toast.success('Copied filled prompt!');
            setShowVariables(false);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const handleRunInAI = (e, tool) => {
        e.stopPropagation();
        const filled = getFilledContent();
        let url;

        if (tool === 'chatgpt') {
            url = `https://chatgpt.com/?q=${encodeURIComponent(filled)}`;
        } else if (tool === 'claude') {
            url = `https://claude.ai/new?q=${encodeURIComponent(filled)}`;
        }

        navigator.clipboard.writeText(filled);
        toast.success(`Opening ${tool === 'chatgpt' ? 'ChatGPT' : 'Claude'}...`);
        window.open(url, '_blank');
        setShowVariables(false);
    };

    const handleVariableClick = (e) => {
        e.stopPropagation();
        setShowVariables(!showVariables);
    };

    return (
        <div className="card prompt-card" style={{ position: 'relative' }}>
            <div className="card-header">
                <div className="badge-group">
                    <span className="badge source-badge">
                        {getSourceIcon(prompt.source)}
                        {prompt.source}
                    </span>
                    <span className="badge category-badge">{prompt.category}</span>
                    {prompt.fork_count > 0 && (
                        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', fontSize: '0.7rem' }}>
                            <GitFork size={10} style={{ marginRight: '0.2rem' }} />
                            {prompt.fork_count}
                        </span>
                    )}
                </div>
                <div className="card-actions" style={{ display: 'flex', gap: '0.25rem' }}>
                    {hasVariables && (
                        <button
                            className={`btn btn-ghost icon-only sm ${showVariables ? 'active' : ''}`}
                            onClick={handleVariableClick}
                            title="Fill variables"
                            style={{ color: showVariables ? 'var(--accent-primary)' : undefined }}
                        >
                            <Variable size={16} />
                        </button>
                    )}
                    <button
                        className={`btn btn-ghost icon-only sm ${prompt.isFavorite ? 'text-accent' : ''}`}
                        onClick={onToggleFavorite}
                        title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star size={16} fill={prompt.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button className="btn btn-ghost icon-only sm" onClick={handleCopy} title={isCopied ? "Copied!" : "Copy prompt"}>
                        {isCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            <h3 className="card-title">
                {prompt.forked_from && <GitFork size={14} style={{ marginRight: '0.35rem', color: '#a855f7', verticalAlign: 'middle' }} />}
                {prompt.title}
            </h3>
            <p className="card-content">{prompt.content}</p>

            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tags">
                    {prompt.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                    ))}
                    {hasVariables && (
                        <span className="tag" style={{ background: 'rgba(255, 225, 53, 0.15)', color: 'var(--accent-primary)' }}>
                            {Object.keys(extractedVariables).length} var{Object.keys(extractedVariables).length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                {onVote && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                            className={`btn btn-ghost icon-only sm ${prompt.userVote === 'up' ? 'voted-up' : ''}`}
                            onClick={(e) => handleVote(e, 'up')}
                            disabled={isVoting}
                            title="This prompt worked well"
                            style={{
                                color: prompt.userVote === 'up' ? '#10b981' : 'var(--text-muted)',
                                padding: '0.25rem'
                            }}
                        >
                            <ThumbsUp size={14} fill={prompt.userVote === 'up' ? 'currentColor' : 'none'} />
                        </button>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: voteScore > 0 ? '#10b981' : voteScore < 0 ? '#ef4444' : 'var(--text-muted)',
                            minWidth: '1.5rem',
                            textAlign: 'center'
                        }}>
                            {voteScore > 0 ? `+${voteScore}` : voteScore}
                        </span>
                        <button
                            className={`btn btn-ghost icon-only sm ${prompt.userVote === 'down' ? 'voted-down' : ''}`}
                            onClick={(e) => handleVote(e, 'down')}
                            disabled={isVoting}
                            title="This prompt needs work"
                            style={{
                                color: prompt.userVote === 'down' ? '#ef4444' : 'var(--text-muted)',
                                padding: '0.25rem'
                            }}
                        >
                            <ThumbsDown size={14} fill={prompt.userVote === 'down' ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                )}
            </div>

            {/* Variables Popover */}
            {showVariables && hasVariables && (
                <div
                    ref={popoverRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(255, 225, 53, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        zIndex: 100
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Variable size={16} style={{ color: 'var(--accent-primary)' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Fill Variables</span>
                        </div>
                        <button
                            className="btn btn-ghost icon-only sm"
                            onClick={() => setShowVariables(false)}
                            style={{ padding: '0.15rem' }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        {Object.keys(variables).map(variable => (
                            <div key={variable}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.25rem'
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
                                    onChange={(e) => setVariables({ ...variables, [variable]: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.85rem',
                                        background: 'var(--bg-secondary)',
                                        border: variables[variable] ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary sm"
                            onClick={(e) => handleRunInAI(e, 'chatgpt')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#10a37f', flex: 1 }}
                        >
                            <ChatGPTIcon size={14} />
                            ChatGPT
                        </button>
                        <button
                            className="btn btn-primary sm"
                            onClick={(e) => handleRunInAI(e, 'claude')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#d97757', flex: 1 }}
                        >
                            <ClaudeIcon size={14} />
                            Claude
                        </button>
                        <button
                            className="btn btn-ghost sm"
                            onClick={handleCopyFilled}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                            <Copy size={14} />
                            Copy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptCard;
