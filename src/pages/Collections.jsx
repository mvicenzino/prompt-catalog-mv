import { Link } from 'react-router-dom';
import { Layers, Plus } from 'lucide-react';
import { useCollections } from '../hooks/useCollections';
import { usePrompts } from '../hooks/usePrompts';

const Collections = () => {
    const { collections } = useCollections();
    const { prompts } = usePrompts();

    const getPreviewImages = (collection) => {
        // Get up to 3 prompts from this collection to show as preview
        const collectionPrompts = prompts.filter(p => collection.promptIds.includes(p.id));
        return collectionPrompts.slice(0, 3);
    };

    return (
        <div>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="text-2xl font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            Collections
                        </h2>
                        <p className="text-secondary">
                            Organize your prompts into stacks for specific workflows
                        </p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        New Collection
                    </button>
                </div>
            </div>

            <div className="collections-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {collections.map(collection => {
                    const previews = getPreviewImages(collection);

                    return (
                        <Link
                            to={`/collections/${collection.id}`}
                            key={collection.id}
                            className="card collection-card"
                            style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}
                        >
                            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: 'var(--bg-input)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--accent-primary)'
                                    }}>
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>{collection.name}</h3>
                                        <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                                            {collection.promptIds.length} prompts
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                {collection.description}
                            </p>

                            <div className="collection-preview" style={{ display: 'flex', gap: '0.5rem' }}>
                                {previews.map((p) => (
                                    <div key={p.id} style={{
                                        flex: 1,
                                        aspectRatio: '1',
                                        background: 'var(--bg-input)',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-subtle)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.6rem',
                                        color: 'var(--text-secondary)',
                                        overflow: 'hidden',
                                        padding: '4px'
                                    }}>
                                        {p.tags?.[0] || 'Prompt'}
                                    </div>
                                ))}
                                {[...Array(Math.max(0, 3 - previews.length))].map((_, idx) => (
                                    <div key={idx} style={{
                                        flex: 1,
                                        aspectRatio: '1',
                                        background: 'var(--bg-app)',
                                        borderRadius: '4px',
                                        border: '1px dashed var(--border-subtle)',
                                        opacity: 0.5
                                    }} />
                                ))}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Collections;
