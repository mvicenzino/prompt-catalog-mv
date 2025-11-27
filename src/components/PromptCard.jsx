import React, { useState } from 'react';
import { Copy, Twitter, MessageCircle, User, Star, Check } from 'lucide-react';

const PromptCard = ({ prompt, onToggleFavorite }) => {
    const getSourceIcon = (source) => {
        switch (source?.toLowerCase()) {
            case 'x': return <Twitter size={14} />;
            case 'reddit': return <MessageCircle size={14} />;
            default: return <User size={14} />;
        }
    };

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
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

            <h3 className="card-title">{prompt.title}</h3>
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
