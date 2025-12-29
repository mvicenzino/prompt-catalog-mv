import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X } from 'lucide-react';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { useCollections } from '../hooks/useCollections';
import { usePrompts } from '../hooks/usePrompts';

const CollectionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { collections, deleteCollection, removePromptFromCollection } = useCollections();
    const { prompts, toggleFavorite } = usePrompts();
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    const collection = collections.find(c => c.id === id);

    if (!collection) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Collection not found</h2>
                <Link to="/collections" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                    Back to Collections
                </Link>
            </div>
        );
    }

    const collectionPrompts = prompts.filter(p => collection.promptIds.includes(p.id));

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this collection?')) {
            deleteCollection(id);
            navigate('/collections');
        }
    };

    return (
        <div>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <Link to="/collections" className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} />
                    Back to Collections
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 className="text-2xl font-bold" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            {collection.name}
                        </h2>
                        <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                            {collection.description}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost icon-only" onClick={handleDelete} title="Delete Collection">
                            <Trash2 size={20} />
                        </button>
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
                                    removePromptFromCollection(collection.id, prompt.id);
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
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
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
