import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Trash2, Check, History, RotateCcw, ChevronDown, ChevronUp, Share2, Download, Eye, Clipboard, Zap, GitFork, ExternalLink, FolderPlus, Layers } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { ChatGPTIcon, ClaudeIcon, PerplexityIcon } from './AIIcons';
import { getSourceIcon } from '../utils/sourceIcon';
import { useCollections } from '../hooks/useCollections';

const PromptDetailModal = ({ prompt, isOpen, onClose, onDelete, onUpdate, onFork }) => {
    const { getToken } = useAuth();
    const { collections, addPromptToCollection } = useCollections();
    const [variables, setVariables] = useState({});
    const [filledContent, setFilledContent] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isForking, setIsForking] = useState(false);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);

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

    const handleRunInChatGPT = async () => {
        // Copy text to clipboard as backup
        try {
            await navigator.clipboard.writeText(filledContent);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        const finalUrl = `https://chatgpt.com/?q=${encodeURIComponent(filledContent)}`;
        trackStat('aiLaunch');

        toast.success('Opening ChatGPT...', {
            description: 'Prompt will be pre-filled',
            duration: 2000,
        });

        window.open(finalUrl, '_blank');
    };

    const handleRunInTool = async (tool) => {
        // Copy text to clipboard as backup
        try {
            await navigator.clipboard.writeText(filledContent);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        const finalUrl = tool.urlBuilder(filledContent);
        trackStat('aiLaunch');

        toast.success(`Opening ${tool.name}...`, {
            description: 'Prompt will be pre-filled',
            duration: 2000,
        });

        window.open(finalUrl, '_blank');
        setShowMoreTools(false);
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

    const handleFork = async () => {
        if (!onFork) return;
        setIsForking(true);
        try {
            await onFork();
        } finally {
            setIsForking(false);
        }
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

    const handleAddToCollection = async (collectionId) => {
        await addPromptToCollection(collectionId, prompt.id);
        const collection = collections.find(c => c.id === collectionId);
        toast.success(`Added to ${collection?.name || 'collection'}`);
        setShowCollectionMenu(false);
    };

    const isInCollection = (collectionId) => {
        const collection = collections.find(c => c.id === collectionId);
        return collection?.promptIds?.includes(prompt.id);
    };

    const hasVariables = Object.keys(variables).length > 0;
    const versions = prompt.versions || [];

    const OTHER_TOOLS = [
        { name: 'Claude', icon: ClaudeIcon, color: '#d97757', urlBuilder: (text) => `https://claude.ai/new?q=${encodeURIComponent(text)}` },
        { name: 'Perplexity', icon: PerplexityIcon, color: '#22b8cf', urlBuilder: (text) => `https://www.perplexity.ai/?q=${encodeURIComponent(text)}` },
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
                            {prompt.fork_count > 0 && (
                                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
                                    <GitFork size={12} style={{ marginRight: '0.25rem' }} />
                                    {prompt.fork_count} {prompt.fork_count === 1 ? 'fork' : 'forks'}
                                </span>
                            )}
                        </div>
                        <h2 className="detail-title">{prompt.title}</h2>
                        {prompt.forked_from && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <GitFork size={14} /> Forked from another prompt
                            </p>
                        )}
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
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-ghost icon-only"
                                onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                                title="Add to Collection"
                            >
                                <FolderPlus size={20} />
                            </button>
                            {showCollectionMenu && (
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
                                    minWidth: '180px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {collections.length === 0 ? (
                                        <div style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                                            <Layers size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                            <p>No collections yet</p>
                                        </div>
                                    ) : (
                                        collections.map(collection => (
                                            <button
                                                key={collection.id}
                                                className="btn btn-ghost sm"
                                                onClick={() => handleAddToCollection(collection.id)}
                                                disabled={isInCollection(collection.id)}
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'flex-start',
                                                    gap: '0.5rem',
                                                    opacity: isInCollection(collection.id) ? 0.5 : 1
                                                }}
                                            >
                                                <Layers size={14} />
                                                {collection.name}
                                                {isInCollection(collection.id) && (
                                                    <Check size={14} style={{ marginLeft: 'auto', color: '#10b981' }} />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {onFork && (
                            <button
                                className="btn btn-ghost icon-only"
                                onClick={handleFork}
                                disabled={isForking}
                                title="Fork Prompt"
                                style={{ color: '#a855f7' }}
                            >
                                <GitFork size={20} />
                            </button>
                        )}
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
                            <div className="prompt-actions" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleRunInChatGPT}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10a37f' }}
                                    >
                                        <ChatGPTIcon size={18} />
                                        <span>Run in ChatGPT</span>
                                        <ExternalLink size={14} />
                                    </button>

                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className="btn btn-ghost sm"
                                            onClick={() => setShowMoreTools(!showMoreTools)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        >
                                            More
                                            <ChevronDown size={14} />
                                        </button>
                                        {showMoreTools && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                marginTop: '0.25rem',
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '8px',
                                                padding: '0.25rem',
                                                zIndex: 10,
                                                minWidth: '140px'
                                            }}>
                                                {OTHER_TOOLS.map(tool => (
                                                    <button
                                                        key={tool.name}
                                                        className="btn btn-ghost sm"
                                                        onClick={() => handleRunInTool(tool)}
                                                        style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', color: tool.color }}
                                                    >
                                                        <tool.icon size={16} />
                                                        {tool.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className={`btn btn-ghost ${isCopied ? 'text-success' : ''}`}
                                    onClick={handleCopy}
                                    title={hasVariables ? 'Copy Filled' : 'Copy'}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {isCopied ? (
                                        <>
                                            <Check size={18} />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            <span>Copy</span>
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
