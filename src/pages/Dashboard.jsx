import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
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

    const isFavoritesPage = location.pathname === '/favorites';

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
                <h2 className="text-2xl font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {getPageTitle()}
                </h2>
                <p className="text-secondary">
                    {filteredPrompts.length} {filteredPrompts.length === 1 ? 'result' : 'results'} found
                </p>
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
