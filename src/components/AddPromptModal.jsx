import { useState, useCallback, useEffect, useMemo } from 'react';
import { X, Sparkles, Loader2, Variable, Lock, Wand2, Plus, Code, FileText, Image, Lightbulb, MessageCircle, Bug, ClipboardList, Target, TrendingUp, Briefcase, Copy, Check, ArrowLeft, Braces } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { useSubscription } from '../hooks/useSubscription';
import UpgradeModal from './UpgradeModal';
import { PROMPT_TEMPLATES, assessPromptQuality, compilePrompt } from '../constants/promptBuilder';

const ICON_MAP = {
    Plus, Code, FileText, Image, Lightbulb, MessageCircle, Bug,
    ClipboardList, Target, TrendingUp, Briefcase
};

const AddPromptModal = ({ isOpen, onClose, onPromptAdded }) => {
    const { addPrompt } = usePrompts();
    const { getToken } = useAuth();
    const { canUseAI } = useSubscription();

    // Tab state
    const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'build'

    // Quick Add state
    const [attachment, setAttachment] = useState(null);
    const [isCategorizin, setIsCategorizing] = useState(false);
    const [hasAutoCategorzed, setHasAutoCategorized] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('ai_feature');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Images',
        source: 'Other',
        tags: ''
    });

    // Build tab state
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [promptText, setPromptText] = useState('');
    const [additionalContext, setAdditionalContext] = useState('');
    const [promptTitle, setPromptTitle] = useState('');
    const [showJsonFormat, setShowJsonFormat] = useState(false);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    // Get current examples based on selected template
    const currentExamples = useMemo(() => {
        if (selectedTemplate) {
            return selectedTemplate.starterExamples || [];
        }
        return PROMPT_TEMPLATES?.[0]?.starterExamples || [];
    }, [selectedTemplate]);

    // Calculate quality
    const quality = useMemo(() => {
        return assessPromptQuality?.({ task: promptText, context: additionalContext }) || { score: 0, level: 'Basic' };
    }, [promptText, additionalContext]);

    // Compile final prompt
    const compiledPrompt = useMemo(() => {
        return compilePrompt?.({ task: promptText, context: additionalContext }) || promptText;
    }, [promptText, additionalContext]);

    // Generate JSON format
    const jsonPrompt = useMemo(() => {
        const obj = {
            task: promptText.trim() || undefined,
            context: additionalContext.trim() || undefined,
            type: selectedTemplate?.name || 'Custom'
        };
        Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
        return JSON.stringify(obj, null, 2);
    }, [promptText, additionalContext, selectedTemplate]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab('quick');
            // Reset quick add
            setFormData({ title: '', content: '', category: 'Images', source: 'Other', tags: '' });
            setAttachment(null);
            setHasAutoCategorized(false);
            // Reset build
            setSelectedTemplate(null);
            setPromptText('');
            setAdditionalContext('');
            setPromptTitle('');
            setShowJsonFormat(false);
        }
    }, [isOpen]);

    // Auto-categorize
    const autoCategorize = useCallback(async (manual = false) => {
        if (!formData.content || formData.content.length < 20) return;
        if (isCategorizin || hasAutoCategorzed) return;

        if (!canUseAI) {
            if (manual) {
                setUpgradeReason('ai_feature');
                setShowUpgradeModal(true);
            }
            return;
        }

        setIsCategorizing(true);
        try {
            const token = await getToken();
            const response = await fetch('/api/ai/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: formData.content,
                    title: formData.title
                })
            });

            if (response.ok) {
                const result = await response.json();
                setFormData(prev => ({
                    ...prev,
                    category: result.category,
                    tags: result.tags.join(', ')
                }));
                setHasAutoCategorized(true);
                toast.success('Auto-categorized!', {
                    description: `Category: ${result.category}`,
                    duration: 2000
                });
            }
        } catch (err) {
            console.error('Auto-categorize error:', err);
        } finally {
            setIsCategorizing(false);
        }
    }, [formData.content, formData.title, getToken, isCategorizin, hasAutoCategorzed, canUseAI]);

    // Debounce auto-categorization
    useEffect(() => {
        if (!isOpen || hasAutoCategorzed || formData.content.length < 50 || !canUseAI) return;

        const timer = setTimeout(() => {
            autoCategorize();
        }, 1500);

        return () => clearTimeout(timer);
    }, [formData.content, isOpen, hasAutoCategorzed, autoCategorize, canUseAI]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                alert('File is too large. Please select a file under 1MB.');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target.result;

                if (file.type.startsWith('image/')) {
                    const img = new window.Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 800;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        setAttachment({
                            type: file.type,
                            name: file.name,
                            data: dataUrl,
                            size: Math.round((dataUrl.length * 3) / 4)
                        });
                    };
                    img.src = result;
                } else {
                    setAttachment({
                        type: file.type || 'application/octet-stream',
                        name: file.name,
                        data: result,
                        size: file.size
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleQuickSubmit = async (e) => {
        e.preventDefault();
        const result = await addPrompt({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            attachment: attachment
        });

        if (result?.upgrade) {
            setUpgradeReason('prompt_limit');
            setShowUpgradeModal(true);
            return;
        }

        if (result?.success) {
            toast.success('Prompt added!', {
                description: 'Opening prompt details...'
            });
            onClose();
            // Open detail view for the new prompt
            if (onPromptAdded && result.prompt) {
                onPromptAdded(result.prompt);
            }
        }
    };

    const handleBuildSave = async () => {
        if (!promptText.trim()) {
            toast.error('Please enter your prompt');
            return;
        }

        setSaving(true);
        try {
            const title = promptTitle.trim() || promptText.substring(0, 50) + '...';
            const result = await addPrompt({
                title,
                content: compiledPrompt,
                category: selectedTemplate?.category || 'Writing',
                source: 'PromptPal',
                tags: selectedTemplate ? [selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')] : []
            });

            if (result?.upgrade) {
                setUpgradeReason('prompt_limit');
                setShowUpgradeModal(true);
                return;
            }

            if (result?.success) {
                toast.success('Saved to your library!', {
                    description: 'Opening prompt details...'
                });
                onClose();
                // Open detail view for the new prompt
                if (onPromptAdded && result.prompt) {
                    onPromptAdded(result.prompt);
                }
            }
        } catch (err) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async (useJson = false) => {
        try {
            const textToCopy = useJson ? jsonPrompt : compiledPrompt;
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success(useJson ? 'JSON copied!' : 'Copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
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
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', width: '95%' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {activeTab === 'build' && selectedTemplate && (
                            <button
                                className="btn btn-ghost icon-only"
                                onClick={() => setSelectedTemplate(null)}
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <h3 style={{ margin: 0 }}>
                            {activeTab === 'build' && selectedTemplate
                                ? selectedTemplate.name
                                : 'Add Prompt'}
                        </h3>
                    </div>
                    <button className="btn btn-ghost icon-only" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                {!(activeTab === 'build' && selectedTemplate) && (
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--border-subtle)',
                        padding: '0 1rem'
                    }}>
                        <button
                            onClick={() => setActiveTab('quick')}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'quick' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                color: activeTab === 'quick' ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === 'quick' ? 600 : 400,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            <Plus size={16} />
                            Quick Add
                        </button>
                        <button
                            onClick={() => setActiveTab('build')}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'build' ? '2px solid #a855f7' : '2px solid transparent',
                                color: activeTab === 'build' ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === 'build' ? 600 : 400,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            <Wand2 size={16} style={{ color: activeTab === 'build' ? '#a855f7' : undefined }} />
                            Build with AI
                            {!canUseAI && (
                                <span style={{
                                    fontSize: '0.6rem',
                                    padding: '0.1rem 0.3rem',
                                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                    color: 'white',
                                    borderRadius: '3px',
                                    fontWeight: 600
                                }}>PRO</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Quick Add Tab */}
                {activeTab === 'quick' && (
                    <form onSubmit={handleQuickSubmit} className="modal-form" style={{ padding: '1rem' }}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                className="input"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Content</label>
                            <textarea
                                className="input textarea"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                required
                                rows={4}
                                placeholder="Write a {{tone}} email to {{recipient}} about {{topic}}..."
                            />
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(255, 225, 53, 0.08)',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <Variable size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                                <span>
                                    <strong style={{ color: 'var(--accent-primary)' }}>Tip:</strong> Use <code style={{ background: 'rgba(255, 225, 53, 0.15)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{'{{variable}}'}</code> for templates
                                </span>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Category
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHasAutoCategorized(false);
                                            autoCategorize(true);
                                        }}
                                        disabled={isCategorizin || formData.content.length < 20}
                                        className="btn btn-ghost icon-only sm"
                                        title={canUseAI ? "Auto-categorize with AI" : "Pro feature"}
                                        style={{
                                            padding: '0.2rem',
                                            color: isCategorizin ? 'var(--accent-primary)' : 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        {isCategorizin ? (
                                            <Loader2 size={14} className="spin" />
                                        ) : canUseAI ? (
                                            <Sparkles size={14} />
                                        ) : (
                                            <>
                                                <Lock size={12} />
                                                <span style={{
                                                    fontSize: '0.6rem',
                                                    padding: '0.05rem 0.2rem',
                                                    background: 'rgba(99, 102, 241, 0.2)',
                                                    color: 'var(--accent-primary)',
                                                    borderRadius: '2px',
                                                    fontWeight: 600
                                                }}>PRO</span>
                                            </>
                                        )}
                                    </button>
                                </label>
                                <select
                                    className="input"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Images</option>
                                    <option>Photos</option>
                                    <option>Apps</option>
                                    <option>Coding</option>
                                    <option>Writing</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Source</label>
                                <select
                                    className="input"
                                    value={formData.source}
                                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                                >
                                    <option>X</option>
                                    <option>Reddit</option>
                                    <option>Midjourney</option>
                                    <option>ChatGPT</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input
                                className="input"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="cyberpunk, 8k, portrait"
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Add Prompt</button>
                        </div>
                    </form>
                )}

                {/* Build Tab */}
                {activeTab === 'build' && (
                    <div style={{ position: 'relative' }}>
                        {/* Pro Upgrade Overlay for Free Users - positioned over entire build tab */}
                        {!canUseAI && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.92)',
                                zIndex: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem',
                                textAlign: 'center',
                                borderRadius: '0 0 12px 12px',
                                minHeight: '300px'
                            }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)'
                                }}>
                                    <Wand2 size={28} style={{ color: 'white' }} />
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
                                    Build Prompts with AI
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: '280px' }}>
                                    Use AI-powered templates to create better prompts faster. Choose from coding, writing, image generation, and more.
                                </p>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        setUpgradeReason('ai_feature');
                                        setShowUpgradeModal(true);
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 2rem',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Upgrade to Pro
                                </button>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                                    Starting at $7.99/month
                                </p>
                            </div>
                        )}

                        <div style={{
                            padding: '1rem',
                            maxHeight: '60vh',
                            overflow: 'auto',
                            opacity: canUseAI ? 1 : 0.15,
                            pointerEvents: canUseAI ? 'auto' : 'none'
                        }}>
                        {!selectedTemplate ? (
                            /* Template Selection */
                            <div>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    marginBottom: '1rem',
                                    textAlign: 'center'
                                }}>
                                    What type of prompt do you want to create?
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '0.75rem'
                                }}>
                                    {(PROMPT_TEMPLATES || []).map(template => {
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
                                                    padding: '0.75rem',
                                                    background: 'var(--bg-input)',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <IconComponent size={18} style={{ color: '#a855f7' }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 500, textAlign: 'center' }}>
                                                    {template.name}
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
                                {currentExamples.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Start with an example:
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {currentExamples.slice(0, 3).map((example, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setPromptText(example)}
                                                    style={{
                                                        padding: '0.3rem 0.6rem',
                                                        background: promptText === example ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-input)',
                                                        border: promptText === example ? '1px solid #a855f7' : '1px solid var(--border-subtle)',
                                                        borderRadius: '16px',
                                                        fontSize: '0.75rem',
                                                        color: promptText === example ? '#a855f7' : 'var(--text-secondary)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {example.length > 35 ? example.substring(0, 35) + '...' : example}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Main Prompt Input */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>
                                        Your Prompt
                                    </label>
                                    <textarea
                                        value={promptText}
                                        onChange={e => setPromptText(e.target.value)}
                                        placeholder="Describe what you want..."
                                        rows={3}
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

                                {/* Additional Context */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                                        Additional Details <span style={{ fontWeight: 400 }}>(optional)</span>
                                    </label>
                                    <textarea
                                        value={additionalContext}
                                        onChange={e => setAdditionalContext(e.target.value)}
                                        placeholder="Extra context, requirements..."
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.85rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                {/* Title */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                                        Title <span style={{ fontWeight: 400 }}>(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={promptTitle}
                                        onChange={e => setPromptTitle(e.target.value)}
                                        placeholder="Name for your library..."
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.85rem'
                                        }}
                                    />
                                </div>

                                {/* Preview */}
                                {compiledPrompt && (
                                    <div style={{
                                        background: 'var(--bg-card)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        padding: '0.75rem',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getQualityColor() }} />
                                                <span style={{ color: getQualityColor() }}>{quality.level}</span>
                                            </div>
                                            <button
                                                onClick={() => setShowJsonFormat(!showJsonFormat)}
                                                style={{
                                                    padding: '0.2rem 0.4rem',
                                                    background: showJsonFormat ? 'var(--accent-primary)' : 'var(--bg-input)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '0.65rem',
                                                    color: showJsonFormat ? 'white' : 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.2rem'
                                                }}
                                            >
                                                <Braces size={10} />
                                                JSON
                                            </button>
                                        </div>
                                        <pre style={{
                                            margin: 0,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            fontSize: '0.8rem',
                                            lineHeight: 1.4,
                                            color: 'var(--text-primary)',
                                            maxHeight: '80px',
                                            overflow: 'auto'
                                        }}>
                                            {showJsonFormat ? jsonPrompt : compiledPrompt}
                                        </pre>
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => handleCopy(showJsonFormat)}
                                        disabled={!compiledPrompt}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleBuildSave}
                                        disabled={saving || !promptText.trim()}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                )}
            </div>

            {showUpgradeModal && (
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    reason={upgradeReason}
                />
            )}
        </div>
    );
};

export default AddPromptModal;
