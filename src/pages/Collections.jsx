import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, ChevronRight, X, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useCollections } from '../hooks/useCollections';
import { usePrompts } from '../hooks/usePrompts';
import { getSourceIcon } from '../utils/sourceIcon';

const Collections = () => {
    const { collections, isLoaded, createCollection, regenerateAICollections } = useCollections();
    const { prompts } = usePrompts();
    const [showNewModal, setShowNewModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const handleCreateCollection = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        const id = await createCollection(newName.trim(), newDescription.trim());
        setCreating(false);
        if (id) {
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
                            className="btn btn-ghost"
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            title="Regenerate AI collections"
                        >
                            <RefreshCw size={18} className={regenerating ? 'spin' : ''} />
                            {regenerating ? 'Regenerating...' : 'Refresh AI'}
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                            <Plus size={18} />
                            New Collection
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
        </div>
    );
};

export default Collections;
