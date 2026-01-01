import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, ChevronRight, X, Sparkles, RefreshCw, Wand2, Check, Briefcase, Code, Palette, MessageSquare, FileText, Target, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useCollections } from '../hooks/useCollections';
import { usePrompts } from '../hooks/usePrompts';
import { useSubscription } from '../hooks/useSubscription';
import { getSourceIcon } from '../utils/sourceIcon';
import UpgradeModal from '../components/UpgradeModal';

// AI-suggested collection templates based on use cases
const AI_COLLECTION_TEMPLATES = [
    {
        id: 'marketing',
        name: 'Marketing & Copy',
        icon: MessageSquare,
        color: '#f59e0b',
        description: 'Social posts, ad copy, email campaigns',
        keywords: ['marketing', 'social', 'copy', 'email', 'ad', 'campaign', 'content']
    },
    {
        id: 'development',
        name: 'Code & Development',
        icon: Code,
        color: '#3b82f6',
        description: 'Code review, debugging, documentation',
        keywords: ['code', 'coding', 'debug', 'programming', 'developer', 'api', 'function']
    },
    {
        id: 'design',
        name: 'Design & Creative',
        icon: Palette,
        color: '#ec4899',
        description: 'Image prompts, UI/UX, branding',
        keywords: ['design', 'image', 'photo', 'creative', 'visual', 'art', 'brand']
    },
    {
        id: 'business',
        name: 'Business & Strategy',
        icon: Briefcase,
        color: '#22c55e',
        description: 'PRDs, planning, analysis',
        keywords: ['business', 'strategy', 'plan', 'prd', 'analysis', 'executive', 'meeting']
    },
    {
        id: 'writing',
        name: 'Writing & Editing',
        icon: FileText,
        color: '#8b5cf6',
        description: 'Blog posts, editing, proofreading',
        keywords: ['writing', 'write', 'blog', 'article', 'edit', 'grammar', 'story']
    },
    {
        id: 'productivity',
        name: 'Productivity',
        icon: Target,
        color: '#06b6d4',
        description: 'Summaries, organization, research',
        keywords: ['summary', 'organize', 'research', 'notes', 'task', 'productivity']
    }
];

const Collections = () => {
    const { collections, isLoaded, createCollection, addPromptToCollection, regenerateAICollections } = useCollections();
    const { prompts, isLoaded: promptsLoaded } = usePrompts();
    const { canUseAI } = useSubscription();
    const [showNewModal, setShowNewModal] = useState(false);
    const [showAIBuilder, setShowAIBuilder] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('collection_limit');
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [aiBuilding, setAiBuilding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    // Calculate which templates would have prompts
    const templatesWithCounts = useMemo(() => {
        return AI_COLLECTION_TEMPLATES.map(template => {
            const matchingPrompts = prompts.filter(p => {
                const searchText = `${p.title} ${p.content} ${p.category || ''}`.toLowerCase();
                return template.keywords.some(kw => searchText.includes(kw));
            });
            return { ...template, promptCount: matchingPrompts.length };
        });
    }, [prompts]);

    const toggleTemplate = (templateId) => {
        setSelectedTemplates(prev =>
            prev.includes(templateId)
                ? prev.filter(id => id !== templateId)
                : [...prev, templateId]
        );
    };

    const handleAIBuild = async () => {
        if (selectedTemplates.length === 0) {
            toast.error('Please select at least one collection type');
            return;
        }

        setAiBuilding(true);
        let successCount = 0;
        let totalPromptsAdded = 0;
        let totalPromptsFound = 0;

        for (const templateId of selectedTemplates) {
            const template = AI_COLLECTION_TEMPLATES.find(t => t.id === templateId);
            if (!template) continue;

            // Find matching prompts
            const matchingPrompts = prompts.filter(p => {
                const searchText = `${p.title} ${p.content} ${p.category || ''}`.toLowerCase();
                return template.keywords.some(kw => searchText.includes(kw));
            });

            totalPromptsFound += matchingPrompts.length;
            console.log(`Template ${template.name}: Found ${matchingPrompts.length} matching prompts`);

            // Create collection with description
            const result = await createCollection(template.name, template.description);
            console.log(`Created collection with result:`, result);

            if (result?.upgrade) {
                // Hit collection limit
                setAiBuilding(false);
                setShowAIBuilder(false);
                setUpgradeReason('collection_limit');
                setShowUpgradeModal(true);
                return;
            }

            if (result?.success) {
                successCount++;
                const collectionId = result.id;

                // Add matching prompts to the collection
                for (const prompt of matchingPrompts) {
                    const added = await addPromptToCollection(collectionId, prompt.id);
                    if (added) {
                        totalPromptsAdded++;
                    } else {
                        console.log(`Failed to add prompt ${prompt.id} to collection ${collectionId}`);
                    }
                }
            }
        }

        setAiBuilding(false);
        setShowAIBuilder(false);
        setSelectedTemplates([]);

        if (successCount > 0) {
            if (totalPromptsFound === 0) {
                toast.success(
                    `Created ${successCount} collection${successCount > 1 ? 's' : ''}. No matching prompts found - add prompts from Browse to populate them!`
                );
            } else if (totalPromptsAdded === 0) {
                toast.warning(
                    `Created ${successCount} collection${successCount > 1 ? 's' : ''} but couldn't add prompts. Try adding prompts manually.`
                );
            } else {
                toast.success(
                    `Created ${successCount} collection${successCount > 1 ? 's' : ''} with ${totalPromptsAdded} prompts!`
                );
            }
        } else {
            toast.error('Failed to create collections. Please try again.');
        }
    };

    const handleCreateCollection = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        const result = await createCollection(newName.trim(), newDescription.trim());
        setCreating(false);

        if (result?.upgrade) {
            setUpgradeReason('collection_limit');
            setShowUpgradeModal(true);
            return;
        }

        if (result?.success) {
            toast.success('Collection created!');
            setShowNewModal(false);
            setNewName('');
            setNewDescription('');
        } else {
            toast.error('Failed to create collection');
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        const success = await regenerateAICollections();
        setRegenerating(false);
        if (success) {
            toast.success('AI collections regenerated!');
        } else {
            toast.error('Failed to regenerate collections');
        }
    };

    const getCollectionPrompts = (collection) => {
        return prompts.filter(p => collection.promptIds.includes(p.id));
    };

    // Get unique categories from collection prompts
    const getCategories = (collectionPrompts) => {
        const cats = [...new Set(collectionPrompts.map(p => p.category))];
        return cats.slice(0, 3);
    };

    return (
        <div>
            <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="text-2xl font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            Collections
                        </h2>
                        <p className="text-secondary">
                            Stack prompts for specific workflows
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn"
                            onClick={() => {
                                if (!canUseAI) {
                                    setUpgradeReason('ai_feature');
                                    setShowUpgradeModal(true);
                                } else {
                                    setShowAIBuilder(true);
                                }
                            }}
                            style={{
                                background: canUseAI
                                    ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                                    : 'var(--bg-secondary)',
                                color: canUseAI ? 'white' : 'var(--text-muted)',
                                border: canUseAI ? 'none' : '1px solid var(--border-subtle)'
                            }}
                        >
                            {canUseAI ? <Wand2 size={18} /> : <Lock size={18} />}
                            AI Organize
                            {!canUseAI && (
                                <span style={{
                                    fontSize: '0.65rem',
                                    padding: '0.1rem 0.3rem',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    color: 'var(--accent-primary)',
                                    borderRadius: '3px',
                                    fontWeight: 600,
                                    marginLeft: '0.25rem'
                                }}>PRO</span>
                            )}
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            title="Regenerate AI collections"
                        >
                            <RefreshCw size={18} className={regenerating ? 'spin' : ''} />
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                            <Plus size={18} />
                            New
                        </button>
                    </div>
                </div>
            </div>

            <div className="collections-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1rem'
            }}>
                {collections.map(collection => {
                    const collectionPrompts = getCollectionPrompts(collection);
                    const categories = getCategories(collectionPrompts);
                    const recentPrompts = collectionPrompts.slice(0, 4);

                    return (
                        <Link
                            to={`/app/collections/${collection.id}`}
                            key={collection.id}
                            className="card collection-card"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.2s',
                                padding: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        background: 'var(--accent-glow)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--accent-primary)'
                                    }}>
                                        <Layers size={16} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{collection.name}</h3>
                                            {collection.is_auto_generated && (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    fontSize: '0.6rem',
                                                    padding: '0.15rem 0.4rem',
                                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                                                    color: '#a855f7',
                                                    borderRadius: '4px',
                                                    fontWeight: 500
                                                }}>
                                                    <Sparkles size={10} />
                                                    AI
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {collectionPrompts.length} prompts
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                            </div>

                            {collection.description && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>
                                    {collection.description}
                                </p>
                            )}

                            {/* Categories */}
                            {categories.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                    {categories.map(cat => (
                                        <span key={cat} style={{
                                            fontSize: '0.65rem',
                                            padding: '0.2rem 0.5rem',
                                            background: 'var(--bg-input)',
                                            borderRadius: '4px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Recent prompts preview */}
                            {recentPrompts.length > 0 && (
                                <div style={{
                                    background: 'var(--bg-app)',
                                    borderRadius: '6px',
                                    padding: '0.5rem',
                                    fontSize: '0.75rem'
                                }}>
                                    {recentPrompts.map((p, idx) => (
                                        <div key={p.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.35rem 0',
                                            borderBottom: idx < recentPrompts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {getSourceIcon(p.source, 12)}
                                            <span style={{
                                                flex: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {p.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Link>
                    );
                })}

                {/* Loading state */}
                {!isLoaded && (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--text-muted)'
                    }}>
                        <div className="spin" style={{ display: 'inline-block' }}>
                            <Layers size={48} style={{ opacity: 0.5 }} />
                        </div>
                        <p>Loading collections...</p>
                    </div>
                )}

                {/* Empty state */}
                {isLoaded && collections.length === 0 && (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--text-muted)'
                    }}>
                        <Layers size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No collections yet. Create one to organize your prompts.</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                            onClick={() => setShowNewModal(true)}
                        >
                            <Plus size={18} />
                            Create Your First Collection
                        </button>
                    </div>
                )}
            </div>

            {/* New Collection Modal */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>New Collection</h2>
                            <button className="btn btn-ghost icon-only" onClick={() => setShowNewModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g., Marketing Prompts"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem'
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    placeholder="What is this collection for?"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost" onClick={() => setShowNewModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateCollection}
                                    disabled={!newName.trim() || creating}
                                >
                                    {creating ? 'Creating...' : 'Create Collection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Collection Builder Modal */}
            {showAIBuilder && (
                <div className="modal-overlay" onClick={() => setShowAIBuilder(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Sparkles size={20} style={{ color: '#a855f7' }} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>AI Collection Builder</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Select categories to auto-organize your prompts
                                    </p>
                                </div>
                            </div>
                            <button className="btn btn-ghost icon-only" onClick={() => setShowAIBuilder(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '1.25rem',
                                lineHeight: '1.5'
                            }}>
                                Choose the collection types that match your workflow.
                                AI will scan your {prompts.length} prompts and organize them automatically.
                            </p>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.75rem',
                                marginBottom: '1.5rem'
                            }}>
                                {templatesWithCounts.map(template => {
                                    const Icon = template.icon;
                                    const isSelected = selectedTemplates.includes(template.id);

                                    return (
                                        <button
                                            key={template.id}
                                            onClick={() => toggleTemplate(template.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                                padding: '1rem',
                                                background: isSelected
                                                    ? `linear-gradient(135deg, ${template.color}15, ${template.color}08)`
                                                    : 'var(--bg-input)',
                                                border: `2px solid ${isSelected ? template.color : 'var(--border-subtle)'}`,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                        >
                                            {isSelected && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    background: template.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Check size={12} style={{ color: 'white' }} />
                                                </div>
                                            )}
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: `${template.color}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Icon size={16} style={{ color: template.color }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {template.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {template.description}
                                                </div>
                                                {template.promptCount > 0 && (
                                                    <div style={{
                                                        marginTop: '0.5rem',
                                                        fontSize: '0.7rem',
                                                        color: template.color,
                                                        fontWeight: 500
                                                    }}>
                                                        {template.promptCount} matching prompt{template.promptCount !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedTemplates.length > 0 && (
                                <div style={{
                                    background: 'var(--bg-app)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '1rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>
                                        {selectedTemplates.length} collection{selectedTemplates.length !== 1 ? 's' : ''} selected
                                    </strong>
                                    {' '}&mdash; AI will create and populate these with matching prompts
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost" onClick={() => setShowAIBuilder(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn"
                                    onClick={handleAIBuild}
                                    disabled={selectedTemplates.length === 0 || aiBuilding}
                                    style={{
                                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                        color: 'white',
                                        border: 'none',
                                        opacity: selectedTemplates.length === 0 ? 0.5 : 1
                                    }}
                                >
                                    {aiBuilding ? (
                                        <>
                                            <RefreshCw size={16} className="spin" />
                                            Building...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={16} />
                                            Build Collections
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
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

export default Collections;
