import { useState } from 'react';
import { Copy, Star, Check, GitFork, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getSourceIcon } from '../utils/sourceIcon';

const PromptCard = ({ prompt, onToggleFavorite, onVote }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isVoting, setIsVoting] = useState(false);

    const handleVote = async (e, voteType) => {
        e.stopPropagation();
        if (isVoting || !onVote) return;

        setIsVoting(true);
        // If clicking the same vote type, remove vote
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
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="card prompt-card">
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
        </div>
    );
};

export default PromptCard;
