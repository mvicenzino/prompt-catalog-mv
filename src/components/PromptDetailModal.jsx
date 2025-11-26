import React, { useState } from 'react';
import { X, Copy, Twitter, MessageCircle, User, Image as ImageIcon } from 'lucide-react';

const PromptDetailModal = ({ prompt, isOpen, onClose }) => {
    if (!isOpen || !prompt) return null;

    const getSourceIcon = (source) => {
        switch (source?.toLowerCase()) {
            case 'x': return <Twitter size={16} />;
            case 'reddit': return <MessageCircle size={16} />;
            default: return <User size={16} />;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.content);
        // TODO: Show toast
    };

    // Real examples based on category/tags
    const getExamples = () => {
        const examples = [];

        if (prompt.tags?.includes('cyberpunk')) {
            examples.push(
                '/examples/cyberpunk.png',
                'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=600&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1614726365723-49cfae96c694?w=600&auto=format&fit=crop&q=60'
            );
        } else if (prompt.tags?.includes('minimalist') && prompt.category === 'Apps') {
            examples.push(
                'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=600&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=60'
            );
        } else if (prompt.tags?.includes('cinematic')) {
            examples.push(
                '/examples/cinematic.png',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=60'
            );
        } else {
            // Fallback abstract images
            examples.push(
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1614850523060-8da1d56ae167?w=600&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&auto=format&fit=crop&q=60'
            );
        }

        return examples.map((url, i) => ({ id: i, url }));
    };

    const examples = getExamples();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="detail-header-content">
                        <div className="badge-group">
                            <span className="badge source-badge">
                                {getSourceIcon(prompt.source)}
                                {prompt.source}
                            </span>
                            <span className="badge category-badge">{prompt.category}</span>
                        </div>
                        <h2 className="detail-title">{prompt.title}</h2>
                    </div>
                    <button className="btn btn-ghost icon-only" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="detail-content-scroll">
                    <div className="detail-section">
                        <div className="prompt-display">
                            <p className="prompt-text">{prompt.content}</p>
                            <div className="prompt-actions">
                                <button className="btn btn-primary copy-btn" onClick={handleCopy}>
                                    <Copy size={16} />
                                    Copy Prompt
                                </button>
                            </div>
                        </div>

                        <div className="tags mt-6">
                            {prompt.tags?.map(tag => (
                                <span key={tag} className="tag large">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3 className="section-title">
                            <ImageIcon size={20} />
                            Example Outputs
                        </h3>
                        <div className="examples-grid">
                            {examples.map(ex => (
                                <div
                                    key={ex.id}
                                    className="example-image-container"
                                >
                                    <img src={ex.url} alt={`Example ${ex.id}`} className="example-image" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptDetailModal;
