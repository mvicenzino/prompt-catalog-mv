import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import Header from '../components/Header';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { usePrompts } from '../hooks/usePrompts';

const Dashboard = () => {
    const { category } = useParams();
    const location = useLocation();
    const { prompts, toggleFavorite, deletePrompt, updatePrompt, isLoaded } = usePrompts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const isFavoritesPage = location.pathname === '/favorites';

    const handleBulkExport = (format) => {
        const exportData = filteredPrompts.map(p => ({
            title: p.title,
            content: p.content,
            category: p.category,
            source: p.source,
            tags: p.tags || [],
            createdAt: p.created_at
        }));

        let content, filename, mimeType;

        if (format === 'json') {
            content = JSON.stringify(exportData, null, 2);
            filename = `promptpal-export-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else {
            content = exportData.map(p => `# ${p.title}

**Category:** ${p.category || 'N/A'}
**Source:** ${p.source || 'N/A'}
**Tags:** ${(p.tags || []).map(t => `#${t}`).join(' ') || 'None'}

---

${p.content}

---

`).join('\n\n');
            content += '*Exported from PromptPal*';
            filename = `promptpal-export-${new Date().toISOString().split('T')[0]}.md`;
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

        toast.success(`Exported ${exportData.length} prompts as ${format.toUpperCase()}`);
        setShowExportMenu(false);
    };

    const handleDelete = (id) => {
        toast('Delete this prompt?', {
            action: {
                label: 'Delete',
                onClick: () => {
                    deletePrompt(id);
                    setSelectedPrompt(null);
                    toast.success('Prompt deleted');
                }
            },
            cancel: {
                label: 'Cancel',
            },
        });
    };

    const filteredPrompts = prompts.filter(prompt => {
        // Filter by Category
        const matchesCategory = category
            ? prompt.category.toLowerCase() === category.toLowerCase()
            : true;

        // Filter by Favorites
        const matchesFavorites = isFavoritesPage ? prompt.isFavorite : true;

        // Filter by Search
        const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prompt.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesFavorites && matchesSearch;
    });

    const getPageTitle = () => {
        if (isFavoritesPage) return 'Favorite Prompts';
        if (category) return `${category.charAt(0).toUpperCase() + category.slice(1)} Prompts`;
        return 'All Prompts';
    };

    if (!isLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="text-secondary">Loading prompts...</div>
            </div>
        );
    }

    return (
        <div>
            <Header onSearch={setSearchQuery} />

            <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 className="text-2xl font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {getPageTitle()}
                        </h2>
                        <p className="text-secondary">
                            {filteredPrompts.length} {filteredPrompts.length === 1 ? 'result' : 'results'} found
                        </p>
                    </div>
                    {filteredPrompts.length > 0 && (
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Download size={18} />
                                Export
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
                                    minWidth: '140px'
                                }}>
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={() => handleBulkExport('json')}
                                        style={{ width: '100%', justifyContent: 'flex-start' }}
                                    >
                                        Export as JSON
                                    </button>
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={() => handleBulkExport('md')}
                                        style={{ width: '100%', justifyContent: 'flex-start' }}
                                    >
                                        Export as Markdown
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="prompt-grid">
                {filteredPrompts.map(prompt => (
                    <div key={prompt.id} onClick={() => setSelectedPrompt(prompt)} style={{ cursor: 'pointer' }}>
                        <PromptCard
                            prompt={prompt}
                            onToggleFavorite={(e) => {
                                e.stopPropagation();
                                toggleFavorite(prompt.id);
                            }}
                        />
                    </div>
                ))}
            </div>

            <PromptDetailModal
                prompt={selectedPrompt}
                isOpen={!!selectedPrompt}
                onClose={() => setSelectedPrompt(null)}
                onDelete={() => handleDelete(selectedPrompt.id)}
                onUpdate={(updatedPrompt) => {
                    updatePrompt(updatedPrompt);
                    setSelectedPrompt(updatedPrompt);
                }}
            />
        </div>
    );
};

export default Dashboard;
