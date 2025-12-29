import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Trash2, ImageIcon, Check, History, RotateCcw, ChevronDown, ChevronUp, Share2, Download, Eye, Clipboard, Zap } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { ChatGPTIcon, GeminiIcon, ClaudeIcon, PerplexityIcon, MidjourneyIcon } from './AIIcons';
import { getSourceIcon } from '../utils/sourceIcon';

const PromptDetailModal = ({ prompt, isOpen, onClose, onDelete, onUpdate }) => {
    const { getToken } = useAuth();
    const [variables, setVariables] = useState({});
    const [filledContent, setFilledContent] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Track stat event
    const trackStat = useCallback(async (event) => {
        if (!prompt?.id) return;
        try {
            const token = await getToken();
            await fetch(`/api/prompts/${prompt.id}/stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ event })
            });
        } catch (err) {
            // Silent fail - stats are non-critical
        }
    }, [prompt?.id, getToken]);

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
            setShowHistory(false);
            setShowExportMenu(false);
            // Track view
            trackStat('view');
        }
    }, [prompt, trackStat]);

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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(filledContent);
            setIsCopied(true);
            trackStat('copy');
            toast.success('Copied to clipboard!', {
                description: 'Prompt is ready to paste',
                duration: 2000,
            });
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            toast.error('Failed to copy', {
                description: 'Please try again',
            });
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
        toast('Remove attachment?', {
            action: {
                label: 'Remove',
                onClick: () => {
                    const updatedPrompt = { ...prompt };
                    delete updatedPrompt.attachment;
                    delete updatedPrompt.userImage;
                    onUpdate(updatedPrompt);
                    toast.success('Attachment removed');
                }
            },
            cancel: {
                label: 'Cancel',
            },
        });
    };

    const handleOpenAI = async (tool) => {
        if (tool.disabled) {
            toast.info(`${tool.name} coming soon!`, {
                description: 'Direct prompt passing not yet supported',
            });
            return;
        }

        // Copy text content
        try {
            await navigator.clipboard.writeText(filledContent);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        // Try to copy image to clipboard if it exists and is an image
        if (displayAttachment && displayAttachment.type.startsWith('image/')) {
            try {
                const response = await fetch(displayAttachment.data);
                const blob = await response.blob();
                const item = new ClipboardItem({ [blob.type]: blob });
                await navigator.clipboard.write([item]);
            } catch (err) {
                console.warn('Failed to copy image to clipboard:', err);
            }
        }

        const encodedPrompt = encodeURIComponent(filledContent);
        let finalUrl = tool.url;

        switch (tool.name) {
            case 'Perplexity':
                finalUrl = `https://www.perplexity.ai/?q=${encodedPrompt}`;
                break;
            case 'Claude':
                finalUrl = `https://claude.ai/new?q=${encodedPrompt}`;
                break;
            case 'ChatGPT':
                finalUrl = `https://chatgpt.com/?q=${encodedPrompt}`;
                break;
            default:
                break;
        }

        trackStat('aiLaunch');
        toast.success(`Opening ${tool.name}...`, {
            description: 'Prompt copied to clipboard',
            duration: 2000,
        });

        window.open(finalUrl, '_blank');
    };

    const handleRestoreVersion = (version) => {
        toast(`Restore this version?`, {
            description: `From ${new Date(version.savedAt).toLocaleString()}`,
            action: {
                label: 'Restore',
                onClick: () => {
                    const restoredPrompt = {
                        ...prompt,
                        title: version.title,
                        content: version.content,
                        category: version.category,
                        source: version.source,
                        tags: version.tags
                    };
                    onUpdate(restoredPrompt);
                    toast.success('Version restored');
                    setShowHistory(false);
                }
            },
            cancel: { label: 'Cancel' }
        });
    };

    const formatVersionDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleExport = (format) => {
        const exportData = {
            title: prompt.title,
            content: prompt.content,
            category: prompt.category,
            source: prompt.source,
            tags: prompt.tags || [],
            createdAt: prompt.created_at
        };

        let content, filename, mimeType;

        if (format === 'json') {
            content = JSON.stringify(exportData, null, 2);
            filename = `${prompt.title.toLowerCase().replace(/\s+/g, '-')}.json`;
            mimeType = 'application/json';
        } else {
            // Markdown format
            content = `# ${prompt.title}

**Category:** ${prompt.category || 'N/A'}
**Source:** ${prompt.source || 'N/A'}
**Tags:** ${(prompt.tags || []).map(t => `#${t}`).join(' ') || 'None'}

---

${prompt.content}

---
*Exported from PromptPal*
`;
            filename = `${prompt.title.toLowerCase().replace(/\s+/g, '-')}.md`;
            mimeType = 'text/markdown';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Exported as ${format.toUpperCase()}`);
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const token = await getToken();
            const response = await fetch(`/api/prompts/${prompt.id}/share`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to generate share link');

            const { shareId } = await response.json();
            const shareUrl = `${window.location.origin}/p/${shareId}`;

            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied!', {
                description: shareUrl,
                duration: 4000
            });
        } catch (err) {
            toast.error('Failed to generate share link');
        } finally {
            setIsSharing(false);
        }
    };

    const hasVariables = Object.keys(variables).length > 0;
    const displayAttachment = prompt.attachment || (prompt.userImage ? { type: 'image/jpeg', data: prompt.userImage, name: 'Uploaded Image' } : null);
    const versions = prompt.versions || [];

    const AI_TOOLS = [
        { name: 'ChatGPT', url: 'https://chatgpt.com', icon: ChatGPTIcon, color: '#10a37f', disabled: false },
        { name: 'Gemini', url: 'https://gemini.google.com/app', icon: GeminiIcon, color: '#4E86F5', disabled: true },
        { name: 'Claude', url: 'https://claude.ai/new', icon: ClaudeIcon, color: '#d97757', disabled: false },
        { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: PerplexityIcon, color: '#22b8cf', disabled: false },
        { name: 'Midjourney', url: 'https://discord.com/channels/@me', icon: MidjourneyIcon, color: '#5865F2', disabled: true },
    ];

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="detail-header-content">
                        <div className="badge-group">
                            <span className="badge source-badge">
                                {getSourceIcon(prompt.source, 16)}
                                {prompt.source}
                            </span>
                            <span className="badge category-badge">{prompt.category}</span>
                        </div>
                        <h2 className="detail-title">{prompt.title}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-ghost icon-only"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                title="Export Prompt"
                            >
                                <Download size={20} />
                            </button>
                            {showExportMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.25rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    padding: '0.25rem',
                                    zIndex: 10,
                                    minWidth: '120px'
                                }}>
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={() => { handleExport('json'); setShowExportMenu(false); }}
                                        style={{ width: '100%', justifyContent: 'flex-start' }}
                                    >
                                        Export JSON
                                    </button>
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={() => { handleExport('md'); setShowExportMenu(false); }}
                                        style={{ width: '100%', justifyContent: 'flex-start' }}
                                    >
                                        Export Markdown
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            className="btn btn-ghost icon-only"
                            onClick={handleShare}
                            disabled={isSharing}
                            title="Share Prompt"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            <Share2 size={20} />
                        </button>
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
                                            className={`btn btn-ghost icon-only sm tool-btn ${tool.disabled ? 'disabled' : ''}`}
                                            onClick={() => handleOpenAI(tool)}
                                            title={tool.disabled ? `${tool.name} (Coming Soon)` : `Copy & Open in ${tool.name}`}
                                            aria-label={`Run with ${tool.name}`}
                                            style={{
                                                color: tool.disabled ? 'var(--text-muted)' : tool.color,
                                                borderColor: 'var(--border-subtle)',
                                                border: '1px solid',
                                                opacity: tool.disabled ? 0.5 : 1,
                                                cursor: tool.disabled ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <tool.icon size={16} aria-hidden="true" />
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

                        {prompt.stats && (
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                marginTop: '1.5rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--border-subtle)',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Eye size={14} /> {prompt.stats.views || 0} views
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Clipboard size={14} /> {prompt.stats.copies || 0} copies
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Zap size={14} /> {prompt.stats.aiLaunches || 0} AI runs
                                </span>
                            </div>
                        )}
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

                    {versions.length > 0 && (
                        <div className="detail-section">
                            <button
                                className="section-title"
                                onClick={() => setShowHistory(!showHistory)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    color: 'inherit',
                                    font: 'inherit'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <History size={20} />
                                    Version History ({versions.length})
                                </span>
                                {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {showHistory && (
                                <div style={{ marginTop: '1rem' }}>
                                    {[...versions].reverse().map((version, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: '0.75rem',
                                                marginBottom: '0.5rem',
                                                background: 'var(--bg-input)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-subtle)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{version.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {formatVersionDate(version.savedAt)}
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-ghost sm"
                                                    onClick={() => handleRestoreVersion(version)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                                                >
                                                    <RotateCcw size={14} />
                                                    Restore
                                                </button>
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                                whiteSpace: 'pre-wrap',
                                                maxHeight: '60px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {version.content.substring(0, 150)}{version.content.length > 150 ? '...' : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>,
        document.body
    );
};

export default PromptDetailModal;
