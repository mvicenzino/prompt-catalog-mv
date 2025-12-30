import { useState, useEffect, useMemo } from 'react';
import {
    X, Wand2, Copy, Check, ArrowLeft, Braces,
    Plus, Code, FileText, Image, Lightbulb, MessageCircle, Bug,
    ClipboardList, Target, TrendingUp, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import {
    PROMPT_TEMPLATES,
    assessPromptQuality,
    compilePrompt
} from '../constants/promptBuilder';
import { usePrompts } from '../hooks/usePrompts';

const ICON_MAP = {
    Plus, Code, FileText, Image, Lightbulb, MessageCircle, Bug,
    ClipboardList, Target, TrendingUp, Briefcase
};

const PromptBuilder = ({ isOpen, onClose }) => {
    const { addPrompt } = usePrompts();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [promptText, setPromptText] = useState('');
    const [additionalContext, setAdditionalContext] = useState('');
    const [promptTitle, setPromptTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showJsonFormat, setShowJsonFormat] = useState(false);

    // Get current examples based on selected template
    const currentExamples = useMemo(() => {
        if (selectedTemplate) {
            return selectedTemplate.starterExamples || [];
        }
        return PROMPT_TEMPLATES[0].starterExamples || [];
    }, [selectedTemplate]);

    // Calculate quality
    const quality = useMemo(() => {
        return assessPromptQuality({ task: promptText, context: additionalContext });
    }, [promptText, additionalContext]);

    // Compile final prompt
    const compiledPrompt = useMemo(() => {
        return compilePrompt({ task: promptText, context: additionalContext });
    }, [promptText, additionalContext]);

    // Generate JSON format
    const jsonPrompt = useMemo(() => {
        const obj = {
            task: promptText.trim() || undefined,
            context: additionalContext.trim() || undefined,
            type: selectedTemplate?.name || 'Custom'
        };
        // Remove undefined fields
        Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
        return JSON.stringify(obj, null, 2);
    }, [promptText, additionalContext, selectedTemplate]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedTemplate(null);
            setPromptText('');
            setAdditionalContext('');
            setPromptTitle('');
            setShowJsonFormat(false);
        }
    }, [isOpen]);

    const handleSelectExample = (example) => {
        setPromptText(example);
    };

    const handleCopy = async (useJson = false) => {
        try {
            const textToCopy = useJson ? jsonPrompt : compiledPrompt;
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success(useJson ? 'JSON copied!' : 'Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const handleSave = async () => {
        if (!promptText.trim()) {
            toast.error('Please enter your prompt');
            return;
        }

        setSaving(true);
        try {
            const title = promptTitle.trim() || promptText.substring(0, 50) + '...';
            await addPrompt({
                title,
                content: compiledPrompt,
                category: selectedTemplate?.category || 'Writing',
                source: 'PromptPal',
                tags: selectedTemplate ? [selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')] : []
            });
            toast.success('Saved to your library!');
            onClose();
        } catch (err) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const getQualityColor = () => {
        if (quality.score >= 80) return '#22c55e';
        if (quality.score >= 50) return '#eab308';
        return '#6b7280';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '600px',
                    width: '95%',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {selectedTemplate && (
                            <button
                                className="btn btn-ghost icon-only"
                                onClick={() => setSelectedTemplate(null)}
                                style={{ marginRight: '-0.25rem' }}
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Wand2 size={18} style={{ color: '#a855f7' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>
                            {selectedTemplate ? selectedTemplate.name : 'Prompt Builder'}
                        </span>
                    </div>
                    <button className="btn btn-ghost icon-only" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                    {!selectedTemplate ? (
                        /* Template Selection */
                        <div>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                What type of prompt do you want to create?
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: '0.75rem'
                            }}>
                                {PROMPT_TEMPLATES.map(template => {
                                    const IconComponent = ICON_MAP[template.icon] || Plus;
                                    return (
                                        <button
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '1rem',
                                                background: 'var(--bg-input)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                color: 'var(--text-primary)'
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.borderColor = '#a855f7';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <IconComponent size={20} style={{ color: '#a855f7' }} />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                                {template.name}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: 'var(--text-muted)',
                                                textAlign: 'center'
                                            }}>
                                                {template.description}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Prompt Builder Form */
                        <div>
                            {/* Starter Examples */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Start with an example or write your own:
                                </label>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem'
                                }}>
                                    {currentExamples.map((example, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectExample(example)}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                background: promptText === example
                                                    ? 'rgba(168, 85, 247, 0.2)'
                                                    : 'var(--bg-input)',
                                                border: promptText === example
                                                    ? '1px solid #a855f7'
                                                    : '1px solid var(--border-subtle)',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                color: promptText === example
                                                    ? '#a855f7'
                                                    : 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {example.length > 45 ? example.substring(0, 45) + '...' : example}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Prompt Input */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    marginBottom: '0.4rem'
                                }}>
                                    Your Prompt
                                </label>
                                <textarea
                                    value={promptText}
                                    onChange={e => setPromptText(e.target.value)}
                                    placeholder={`Describe what you want...`}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        resize: 'vertical',
                                        minHeight: '100px'
                                    }}
                                />
                            </div>

                            {/* Additional Context (collapsible feel) */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    marginBottom: '0.4rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Additional Details <span style={{ fontWeight: 400 }}>(optional)</span>
                                </label>
                                <textarea
                                    value={additionalContext}
                                    onChange={e => setAdditionalContext(e.target.value)}
                                    placeholder="Add any extra context, requirements, or preferences..."
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Title for saving */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    marginBottom: '0.4rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Title for your library <span style={{ fontWeight: 400 }}>(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={promptTitle}
                                    onChange={e => setPromptTitle(e.target.value)}
                                    placeholder="Give your prompt a name..."
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem 0.75rem',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            {/* Preview with Format Toggle */}
                            {compiledPrompt && (
                                <div style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    padding: '0.75rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {/* Format Toggle */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            background: 'var(--bg-input)',
                                            borderRadius: '6px',
                                            padding: '0.2rem'
                                        }}>
                                            <button
                                                onClick={() => setShowJsonFormat(false)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    background: !showJsonFormat ? 'var(--accent-primary)' : 'transparent',
                                                    color: !showJsonFormat ? 'var(--text-on-accent)' : 'var(--text-muted)'
                                                }}
                                            >
                                                Text
                                            </button>
                                            <button
                                                onClick={() => setShowJsonFormat(true)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    background: showJsonFormat ? 'var(--accent-primary)' : 'transparent',
                                                    color: showJsonFormat ? 'var(--text-on-accent)' : 'var(--text-muted)'
                                                }}
                                            >
                                                <Braces size={12} />
                                                JSON
                                            </button>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            fontSize: '0.7rem'
                                        }}>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: getQualityColor()
                                            }} />
                                            <span style={{ color: getQualityColor() }}>
                                                {quality.level}
                                            </span>
                                        </div>
                                    </div>

                                    {showJsonFormat && (
                                        <p style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--text-muted)',
                                            margin: '0 0 0.5rem 0',
                                            fontStyle: 'italic'
                                        }}>
                                            JSON format can improve results with some AI models
                                        </p>
                                    )}

                                    <pre style={{
                                        margin: 0,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        fontFamily: showJsonFormat ? 'monospace' : 'inherit',
                                        fontSize: '0.85rem',
                                        lineHeight: 1.5,
                                        color: 'var(--text-primary)',
                                        maxHeight: '120px',
                                        overflow: 'auto',
                                        background: showJsonFormat ? 'var(--bg-input)' : 'transparent',
                                        padding: showJsonFormat ? '0.5rem' : 0,
                                        borderRadius: showJsonFormat ? '4px' : 0
                                    }}>
                                        {showJsonFormat ? jsonPrompt : compiledPrompt}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedTemplate && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        borderTop: '1px solid var(--border-subtle)'
                    }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => handleCopy(showJsonFormat)}
                            disabled={!compiledPrompt}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : (showJsonFormat ? 'Copy JSON' : 'Copy')}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving || !promptText.trim()}
                        >
                            {saving ? 'Saving...' : 'Save to Library'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptBuilder;
