import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X, Layers, Edit3, Check } from 'lucide-react';
import { toast } from 'sonner';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { useCollections } from '../hooks/useCollections';
import { usePrompts } from '../hooks/usePrompts';

const CollectionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { collections, isLoaded, deleteCollection, removePromptFromCollection, updateCollection } = useCollections();
    const { prompts, toggleFavorite } = usePrompts();
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // ID from URL is string, database ID is number
    const collection = collections.find(c => String(c.id) === id);

    if (!isLoaded) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <div className="spin" style={{ display: 'inline-block' }}>
                    <Layers size={48} style={{ opacity: 0.5 }} />
                </div>
                <p>Loading collection...</p>
            </div>
        );
    }

    if (!collection) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Collection not found</h2>
                <Link to="/app/collections" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                    Back to Collections
                </Link>
            </div>
        );
    }

    const collectionPrompts = prompts.filter(p => collection.promptIds.includes(p.id));

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this collection?')) {
            await deleteCollection(collection.id);
            toast.success('Collection deleted');
            navigate('/app/collections');
        }
    };

    const handleRemovePrompt = async (promptId) => {
        await removePromptFromCollection(collection.id, promptId);
        toast.success('Prompt removed from collection');
    };

    const startEditing = () => {
        setEditName(collection.name);
        setEditDescription(collection.description || '');
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) {
            toast.error('Collection name is required');
            return;
        }
        const success = await updateCollection(collection.id, editName.trim(), editDescription.trim());
        if (success) {
            toast.success('Collection updated');
            setIsEditing(false);
        } else {
            toast.error('Failed to update collection');
        }
    };

    return (
        <div>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <Link to="/app/collections" className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} />
                    Back to Collections
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Collection name"
                                    style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        width: '100%',
                                        maxWidth: '400px'
                                    }}
                                    autoFocus
                                />
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    rows={2}
                                    style={{
                                        fontSize: '1rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        width: '100%',
                                        maxWidth: '500px',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                    {collection.name}
                                </h2>
                                <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                                    {collection.description}
                                </p>
                            </>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isEditing ? (
                            <>
                                <button className="btn btn-primary" onClick={handleSaveEdit}>
                                    <Check size={18} />
                                    Save
                                </button>
                                <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-ghost icon-only" onClick={startEditing} title="Edit Collection">
                                    <Edit3 size={20} />
                                </button>
                                <button className="btn btn-ghost icon-only" onClick={handleDelete} title="Delete Collection">
                                    <Trash2 size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {collectionPrompts.length > 0 ? (
                <div className="prompt-grid">
                    {collectionPrompts.map(prompt => (
                        <div key={prompt.id} onClick={() => setSelectedPrompt(prompt)} style={{ cursor: 'pointer', position: 'relative' }}>
                            <PromptCard
                                prompt={prompt}
                                onToggleFavorite={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(prompt.id);
                                }}
                            />
                            <button
                                className="btn btn-ghost icon-only sm remove-btn"
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(4px)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePrompt(prompt.id);
                                }}
                                title="Remove from collection"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{
                    textAlign: 'center',
                    padding: '4rem',
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-secondary)'
                }}>
                    <p>This collection is empty.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add prompts from the main library to build your stack.</p>
                    <Link to="/app" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                        Browse Prompts
                    </Link>
                </div>
            )}

            <PromptDetailModal
                prompt={selectedPrompt}
                isOpen={!!selectedPrompt}
                onClose={() => setSelectedPrompt(null)}
            />

            <style>{`
        .prompt-grid > div:hover .remove-btn {
          opacity: 1;
        }
      `}</style>
        </div>
    );
};

export default CollectionDetail;
