import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Trash2, ImageIcon, MessageCircle, Sparkles, Brain, Zap, Twitter, User, Check } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';

const PromptDetailModal = ({ prompt, isOpen, onClose, onDelete, onUpdate }) => {
    const [variables, setVariables] = useState({});
    const [filledContent, setFilledContent] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // Reset variables and set initial filled content when prompt changes
    useEffect(() => {
        if (prompt) {
            const regex = /\[(.*?)\]/g;
            const matches = [...prompt.content.matchAll(regex)];
            const vars = {};
            matches.forEach(match => {
                vars[match[1]] = '';
            });
            setVariables(vars);
            setFilledContent(prompt.content);
        }
    }, [prompt]);

    // Effect to prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Effect to update filledContent whenever variables or prompt content changes
    useEffect(() => {
        if (!prompt) return;
        let content = prompt.content;
        Object.entries(variables).forEach(([key, value]) => {
            if (value.trim()) {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                content = content.replace(new RegExp(`\\[${escapedKey}\\]`, 'g'), value);
            }
        });
        setFilledContent(content);
    }, [variables, prompt]);

    if (!isOpen || !prompt) return null;

    const getSourceIcon = (source) => {
        switch (source?.toLowerCase()) {
            case 'x': return <Twitter size={16} />;
            case 'reddit': return <MessageCircle size={16} />;
            default: return <User size={16} />;
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(filledContent);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Still show feedback for user experience if it's just a permission issue in dev
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleVariableChange = (key, value) => {
        setVariables(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check size limit (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File is too large. Please select a file under 10MB.');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target.result;

                const attachmentData = {
                    type: file.type || 'application/octet-stream',
                    name: file.name,
                    data: result,
                    size: file.size
                };

                // If it's an image, we might want to compress or resize it, but for now let's just save it.
                // The issue might be that onUpdate expects the whole prompt object.

                const updatedPrompt = {
                    ...prompt,
                    attachment: attachmentData,
                    userImage: undefined // Clear legacy field if any
                };

                // Call onUpdate to save to backend
                onUpdate(updatedPrompt);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAttachment = () => {
        if (window.confirm('Remove the attachment?')) {
            const updatedPrompt = { ...prompt };
            delete updatedPrompt.attachment;
            delete updatedPrompt.userImage;
            onUpdate(updatedPrompt);
        }
    };

    const handleOpenAI = (toolUrl, toolName) => {
        navigator.clipboard.writeText(filledContent);
        const encodedPrompt = encodeURIComponent(filledContent);
        let finalUrl = toolUrl;

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
                finalUrl = `https://gemini.google.com/app?text=${encodedPrompt}`;
                break;
            default:
                break;
        }

        window.open(finalUrl, '_blank');
    };

    const getExamples = () => {
        const examples = [];
        if (prompt.exampleImage) {
            examples.push(prompt.exampleImage);
        }
        // Add fallback examples logic here if needed, simplified for now
        return examples.map((url, i) => ({ id: i, url }));
    };

    const examples = getExamples();
    const hasVariables = Object.keys(variables).length > 0;
    const displayAttachment = prompt.attachment || (prompt.userImage ? { type: 'image/jpeg', data: prompt.userImage, name: 'Uploaded Image' } : null);

    const AI_TOOLS = [
        { name: 'ChatGPT', url: 'https://chatgpt.com', icon: MessageCircle, color: '#10a37f' },
        { name: 'Gemini', url: 'https://gemini.google.com/app', icon: Sparkles, color: '#4E86F5' },
        { name: 'Claude', url: 'https://claude.ai/new', icon: Brain, color: '#d97757' },
        { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: Zap, color: '#22b8cf' },
        { name: 'Midjourney', url: 'https://discord.com/channels/@me', icon: ImageIcon, color: '#5865F2' },
    ];

    return createPortal(
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

                                <button
                                    className={`btn btn-primary copy-btn ${isCopied ? 'success' : ''}`}
                                    onClick={handleCopy}
                                    title={hasVariables ? 'Copy Filled' : 'Copy'}
                                    style={{ minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {isCopied ? (
                                        <>
                                            <Check size={20} />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={20} />
                                            <span className="hide-mobile">Copy</span>
                                        </>
                                    )}
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
                        <h3 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ImageIcon size={20} />
                                Attachment
                            </span>
                            {!displayAttachment && (
                                <label className="btn btn-ghost sm" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                                    + Add File
                                    <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
                                </label>
                            )}
                        </h3>

                        {displayAttachment ? (
                            <div className="example-image-container" style={{ position: 'relative', background: 'var(--bg-secondary)', padding: displayAttachment.type.startsWith('image/') ? '0' : '1rem', borderRadius: '8px' }}>
                                {displayAttachment.type.startsWith('image/') ? (
                                    <img src={displayAttachment.data} alt="Attachment" className="example-image" />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '60px', height: '60px', background: 'var(--border-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontWeight: 'bold' }}>FILE</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{displayAttachment.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {displayAttachment.size ? `${(displayAttachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                            </div>
                                            <a href={displayAttachment.data} download={displayAttachment.name} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'underline', marginTop: '0.25rem', display: 'inline-block' }}>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="btn btn-ghost icon-only"
                                    onClick={handleRemoveAttachment}
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        borderRadius: '50%'
                                    }}
                                    title="Remove Attachment"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                border: '2px dashed var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '2rem',
                                textAlign: 'center',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem'
                            }}>
                                <p>No attachment.</p>
                                <label style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}>
                                    Upload file or image
                                    <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
                                </label>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </div>,
        document.body
    );
};

export default PromptDetailModal;
