import { useState, useEffect, useMemo } from 'react';
import {
    X, Wand2, ChevronDown, ChevronUp, Lightbulb, Copy, Check,
    Sparkles, Eye, EyeOff, Plus, Code, FileText, Image, MessageCircle, Bug
} from 'lucide-react';
import { toast } from 'sonner';
import {
    BUILDER_SECTIONS,
    PROMPT_TEMPLATES,
    detectIntent,
    assessPromptQuality,
    compilePrompt
} from '../constants/promptBuilder';
import { usePrompts } from '../hooks/usePrompts';

const ICON_MAP = {
    Plus: Plus,
    Code: Code,
    FileText: FileText,
    Image: Image,
    Lightbulb: Lightbulb,
    MessageCircle: MessageCircle,
    Bug: Bug
};

const PromptBuilder = ({ isOpen, onClose }) => {
    const { addPrompt } = usePrompts();
    const [sections, setSections] = useState({
        role: '',
        task: '',
        context: '',
        format: '',
        examples: '',
        constraints: ''
    });
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [showTemplates, setShowTemplates] = useState(true);
    const [expandedSections, setExpandedSections] = useState(['role', 'task']);
    const [showPreview, setShowPreview] = useState(true);
    const [saving, setSaving] = useState(false);
    const [promptTitle, setPromptTitle] = useState('');
    const [copied, setCopied] = useState(false);

    // Detect intent from task section
    const detectedIntents = useMemo(() => {
        return detectIntent(sections.task);
    }, [sections.task]);

    // Calculate quality score
    const quality = useMemo(() => {
        return assessPromptQuality(sections);
    }, [sections]);

    // Compile the final prompt
    const compiledPrompt = useMemo(() => {
        return compilePrompt(sections);
    }, [sections]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSections({
                role: '',
                task: '',
                context: '',
                format: '',
                examples: '',
                constraints: ''
            });
            setActiveTemplate(null);
            setShowTemplates(true);
            setPromptTitle('');
        }
    }, [isOpen]);

    const updateSection = (sectionId, value) => {
        setSections(prev => ({ ...prev, [sectionId]: value }));
    };

    const applyTemplate = (template) => {
        setSections(template.sections);
        setActiveTemplate(template);
        setShowTemplates(false);
        // Expand all sections that have content
        const expandedIds = Object.entries(template.sections)
            .filter(([_, value]) => value)
            .map(([key]) => key);
        setExpandedSections(['task', ...expandedIds]);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(compiledPrompt);
            setCopied(true);
            toast.success('Prompt copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const handleSave = async () => {
        if (!sections.task.trim()) {
            toast.error('Please add a task/intent for your prompt');
            return;
        }

        setSaving(true);
        try {
            const title = promptTitle.trim() || `${activeTemplate?.name || 'Custom'} Prompt`;
            const category = detectedIntents[0]?.category || 'Writing';

            await addPrompt({
                title,
                content: compiledPrompt,
                category,
                source: 'PromptPal',
                tags: activeTemplate ? [activeTemplate.name.toLowerCase().replace(/\s+/g, '-')] : []
            });

            toast.success('Prompt saved to your library!');
            onClose();
        } catch (err) {
            toast.error('Failed to save prompt');
        } finally {
            setSaving(false);
        }
    };

    const getQualityColor = () => {
        if (quality.score >= 80) return '#22c55e';
        if (quality.score >= 60) return '#eab308';
        if (quality.score >= 40) return '#f97316';
        return '#6b7280';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '900px',
                    width: '95%',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'var(--accent-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)'
                        }}>
                            <Wand2 size={20} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Prompt Builder</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Craft effective prompts with Claude best practices
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-ghost icon-only" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr',
                    gap: '1rem',
                    padding: '1rem',
                    overflow: 'hidden'
                }}>
                    {/* Left Panel - Builder */}
                    <div style={{ overflow: 'auto', paddingRight: '0.5rem' }}>
                        {/* Template Selector */}
                        {showTemplates && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.75rem'
                                }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                        Choose a Template
                                    </span>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        onClick={() => setShowTemplates(false)}
                                    >
                                        Skip
                                    </button>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '0.5rem'
                                }}>
                                    {PROMPT_TEMPLATES.map(template => {
                                        const IconComponent = ICON_MAP[template.icon] || Plus;
                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => applyTemplate(template)}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.75rem',
                                                    background: 'var(--bg-input)',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    color: 'var(--text-primary)'
                                                }}
                                                onMouseOver={e => {
                                                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                                                }}
                                                onMouseOut={e => {
                                                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                                    e.currentTarget.style.background = 'var(--bg-input)';
                                                }}
                                            >
                                                <IconComponent size={20} style={{ color: 'var(--accent-primary)' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                    {template.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Active Template Badge */}
                        {activeTemplate && !showTemplates && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                padding: '0.5rem 0.75rem',
                                background: 'var(--accent-glow)',
                                borderRadius: '6px',
                                fontSize: '0.8rem'
                            }}>
                                <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                                <span>Using: <strong>{activeTemplate.name}</strong></span>
                                <button
                                    onClick={() => setShowTemplates(true)}
                                    style={{
                                        marginLeft: 'auto',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        {/* Prompt Title */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                marginBottom: '0.35rem'
                            }}>
                                Prompt Title (for your library)
                            </label>
                            <input
                                type="text"
                                value={promptTitle}
                                onChange={e => setPromptTitle(e.target.value)}
                                placeholder="e.g., Blog Post Generator"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.75rem',
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        {/* Sections */}
                        {BUILDER_SECTIONS.map(section => (
                            <div
                                key={section.id}
                                style={{
                                    marginBottom: '0.75rem',
                                    background: 'var(--bg-input)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.6rem 0.75rem',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                            {section.title}
                                        </span>
                                        {section.required && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '0.1rem 0.35rem',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                borderRadius: '4px'
                                            }}>
                                                Required
                                            </span>
                                        )}
                                        {sections[section.id] && (
                                            <Check size={14} style={{ color: '#22c55e' }} />
                                        )}
                                    </div>
                                    {expandedSections.includes(section.id) ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </button>

                                {/* Section Content */}
                                {expandedSections.includes(section.id) && (
                                    <div style={{ padding: '0 0.75rem 0.75rem' }}>
                                        <textarea
                                            value={sections[section.id]}
                                            onChange={e => updateSection(section.id, e.target.value)}
                                            placeholder={section.placeholder}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem',
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '6px',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem',
                                                resize: 'vertical',
                                                minHeight: '70px'
                                            }}
                                        />

                                        {/* Hint */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.35rem',
                                            marginTop: '0.5rem',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <Lightbulb size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <span>{section.hint}</span>
                                        </div>

                                        {/* Intent Detection for Task section */}
                                        {section.id === 'task' && detectedIntents.length > 0 && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                padding: '0.5rem',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    marginBottom: '0.35rem',
                                                    color: '#3b82f6'
                                                }}>
                                                    <Sparkles size={12} />
                                                    <span>Detected: {detectedIntents[0].type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)' }}>
                                                    Suggestion: {detectedIntents[0].suggestions[0]}
                                                </div>
                                            </div>
                                        )}

                                        {/* Example snippets */}
                                        {section.examples && section.examples.length > 0 && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    color: 'var(--text-muted)',
                                                    display: 'block',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    Examples (click to use):
                                                </span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                    {section.examples.slice(0, 2).map((ex, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => updateSection(section.id, ex)}
                                                            style={{
                                                                padding: '0.25rem 0.5rem',
                                                                background: 'var(--bg-card)',
                                                                border: '1px solid var(--border-subtle)',
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                color: 'var(--text-secondary)',
                                                                cursor: 'pointer',
                                                                maxWidth: '200px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {ex.substring(0, 40)}...
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Panel - Preview */}
                    {showPreview && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--bg-card)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            overflow: 'hidden'
                        }}>
                            {/* Preview Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                borderBottom: '1px solid var(--border-subtle)'
                            }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                    Live Preview
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {/* Quality Meter */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'var(--bg-input)',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem'
                                    }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: getQualityColor()
                                        }} />
                                        <span style={{ color: getQualityColor(), fontWeight: 500 }}>
                                            {quality.level.charAt(0).toUpperCase() + quality.level.slice(1)}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            ({quality.score}%)
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-ghost icon-only sm"
                                        onClick={handleCopy}
                                        disabled={!compiledPrompt}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div style={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '0.75rem'
                            }}>
                                {compiledPrompt ? (
                                    <pre style={{
                                        margin: 0,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        fontFamily: 'inherit',
                                        fontSize: '0.85rem',
                                        lineHeight: 1.5,
                                        color: 'var(--text-primary)'
                                    }}>
                                        {compiledPrompt}
                                    </pre>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        color: 'var(--text-muted)',
                                        textAlign: 'center',
                                        padding: '2rem'
                                    }}>
                                        <Wand2 size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                                        <p style={{ fontSize: '0.85rem', margin: 0 }}>
                                            Start building your prompt by filling in the sections on the left
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Quality Suggestions */}
                            {quality.suggestions.length > 0 && (
                                <div style={{
                                    padding: '0.75rem',
                                    borderTop: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-input)'
                                }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: '0.35rem'
                                    }}>
                                        Suggestions to improve:
                                    </div>
                                    <ul style={{
                                        margin: 0,
                                        paddingLeft: '1.25rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {quality.suggestions.slice(0, 2).map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid var(--border-subtle)'
                }}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={handleCopy}
                            disabled={!compiledPrompt}
                        >
                            <Copy size={16} />
                            Copy
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving || !sections.task.trim()}
                        >
                            {saving ? 'Saving...' : 'Save to Library'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptBuilder;
