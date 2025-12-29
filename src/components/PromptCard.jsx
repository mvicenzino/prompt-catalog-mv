import { useState } from 'react';
import { Copy, Star, Check, GitFork } from 'lucide-react';
import { getSourceIcon } from '../utils/sourceIcon';

const PromptCard = ({ prompt, onToggleFavorite }) => {
    const [isCopied, setIsCopied] = useState(false);

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

            <div className="card-footer">
                <div className="tags">
                    {prompt.tags?.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromptCard;
