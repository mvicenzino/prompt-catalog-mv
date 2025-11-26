import React, { useState, useEffect } from 'react';
import { X, Copy, Twitter, MessageCircle, User, Image as ImageIcon, Sparkles, Brain, Zap, Trash2 } from 'lucide-react';

const PromptDetailModal = ({ prompt, isOpen, onClose, onDelete }) => {
    const [variables, setVariables] = useState({});

    // Reset variables when prompt changes
    useEffect(() => {
        if (prompt) {
            const foundVars = {};
            const regex = /\[(.*?)\]/g;
            let match;
            while ((match = regex.exec(prompt.content)) !== null) {
                // Use the content inside brackets as the key
                foundVars[match[1]] = '';
            }
            setVariables(foundVars);
        }
    }, [prompt]);

    if (!isOpen || !prompt) return null;

    const getSourceIcon = (source) => {
        switch (source?.toLowerCase()) {
            case 'x': return <Twitter size={16} />;
            case 'reddit': return <MessageCircle size={16} />;
            default: return <User size={16} />;
        }
    };

    const getFilledContent = () => {
        let content = prompt.content;
        Object.entries(variables).forEach(([key, value]) => {
            if (value.trim()) {
                // Escape special characters in key for regex
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                content = content.replace(new RegExp(`\\[${escapedKey}\\]`, 'g'), value);
            }
        });
        return content;
    };

    const filledContent = getFilledContent();

    const handleCopy = () => {
        navigator.clipboard.writeText(filledContent);
        // TODO: Show toast
    };

    const handleVariableChange = (key, value) => {
        setVariables(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleOpenAI = (toolUrl, toolName) => {
        navigator.clipboard.writeText(filledContent);

        let finalUrl = toolUrl;
        const encodedPrompt = encodeURIComponent(filledContent);

        switch (toolName) {
            case 'Perplexity':
                finalUrl = `https://www.perplexity.ai/?q=${encodedPrompt}`;
                break;
            case 'Claude':
                finalUrl = `https://claude.ai/new?q=${encodedPrompt}`;
                break;
            case 'ChatGPT':
                finalUrl = `https://chatgpt.com/?q=${encodedPrompt}`;
                break;
            case 'Gemini':
                // Note: Gemini variable support via URL is experimental/inconsistent
                finalUrl = `https://gemini.google.com/app?text=${encodedPrompt}`;
                break;
            default:
                break;
        }

        window.open(finalUrl, '_blank');
    };

    // Real examples based on category/tags
    const getExamples = () => {
        const examples = [];

        if (prompt.exampleImage) {
            examples.push(prompt.exampleImage);
        }

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
    const hasVariables = Object.keys(variables).length > 0;

    const AI_TOOLS = [
        { name: 'ChatGPT', url: 'https://chatgpt.com', icon: MessageCircle, color: '#10a37f' },
        { name: 'Gemini', url: 'https://gemini.google.com/app', icon: Sparkles, color: '#4E86F5' },
        { name: 'Claude', url: 'https://claude.ai/new', icon: Brain, color: '#d97757' },
        { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: Zap, color: '#22b8cf' },
        { name: 'Midjourney', url: 'https://discord.com/channels/@me', icon: ImageIcon, color: '#5865F2' },
    ];

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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost icon-only" onClick={onDelete} title="Delete Prompt" style={{ color: '#ef4444' }}>
                            <Trash2 size={20} />
                        </button>
                        <button className="btn btn-ghost icon-only" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="detail-content-scroll">
                    <div className="detail-section">

                        {hasVariables && (
                            <div className="variables-section" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="text-sm font-semibold text-secondary mb-3">Fill Variables</h3>
                                <div className="variables-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                    {Object.keys(variables).map(variable => (
                                        <div key={variable} className="form-group">
                                            <label className="text-xs text-secondary mb-1 block" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {variable}
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder={`Enter ${variable}...`}
                                                value={variables[variable]}
                                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="prompt-display">
                            <p className="prompt-text">{filledContent}</p>
                            <div className="prompt-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="ai-tools" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className="text-xs text-secondary" style={{ alignSelf: 'center', marginRight: '0.5rem' }}>Run with:</span>
                                    {AI_TOOLS.map(tool => (
                                        <button
                                            key={tool.name}
                                            className="btn btn-ghost icon-only sm tool-btn"
                                            onClick={() => handleOpenAI(tool.url, tool.name)}
                                            title={`Copy & Open in ${tool.name}`}
                                            style={{ color: tool.color, borderColor: 'var(--border-subtle)', border: '1px solid' }}
                                        >
                                            <tool.icon size={16} />
                                        </button>
                                    ))}
                                </div>

                                <button className="btn btn-primary copy-btn" onClick={handleCopy}>
                                    <Copy size={16} />
                                    {hasVariables ? 'Copy Filled' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="tags mt-6">
                            {prompt.tags?.map(tag => (
                                <span key={tag} className="tag large">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {prompt.userImage && (
                        <div className="detail-section">
                            <h3 className="section-title">
                                <ImageIcon size={20} />
                                Uploaded Image
                            </h3>
                            <div className="example-image-container">
                                <img src={prompt.userImage} alt="User Uploaded" className="example-image" />
                            </div>
                        </div>
                    )}

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
