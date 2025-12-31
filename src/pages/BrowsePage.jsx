import { useState, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
    TrendingUp, ChevronRight, ChevronLeft, Camera, Image, Code, PenTool, Smartphone
} from 'lucide-react';
import Header from '../components/Header';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { usePrompts } from '../hooks/usePrompts';
import { getSourceIcon } from '../utils/sourceIcon';

// Horizontal scroll row component for Netflix-style browsing
const ScrollableRow = ({ children, rowId }) => {
    const scrollContainer = (id) => document.getElementById(id);

    const scroll = (direction) => {
        const container = scrollContainer(rowId);
        if (container) {
            const scrollAmount = container.offsetWidth * 0.8;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="scroll-row-container" style={{ position: 'relative' }}>
            {/* Left scroll button - hidden on mobile */}
            <button
                className="scroll-btn scroll-btn-left"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
            >
                <ChevronLeft size={20} />
            </button>

            <div
                id={rowId}
                className="horizontal-scroll-row"
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth',
                    paddingBottom: '0.5rem',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE
                }}
            >
                {children}
            </div>

            {/* Right scroll button - hidden on mobile */}
            <button
                className="scroll-btn scroll-btn-right"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

// Individual card wrapper for scroll snap
const ScrollCard = ({ children, onClick }) => (
    <div
        onClick={onClick}
        style={{
            flex: '0 0 280px',
            scrollSnapAlign: 'start',
            cursor: 'pointer'
        }}
    >
        {children}
    </div>
);

const CATEGORIES = [
    { id: 'photos', name: 'Photos', icon: Camera, color: '#f59e0b' },
    { id: 'images', name: 'Images', icon: Image, color: '#ec4899' },
    { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
    { id: 'writing', name: 'Writing', icon: PenTool, color: '#22c55e' },
    { id: 'apps', name: 'Apps', icon: Smartphone, color: '#8b5cf6' }
];

const BrowsePage = () => {
    const { onOpenBuilder, onAddPrompt } = useOutletContext();
    const { prompts, toggleFavorite, deletePrompt, updatePrompt, forkPrompt, votePrompt, isLoaded } = usePrompts();
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Get top trending prompts overall
    const trendingPrompts = useMemo(() => {
        return prompts
            .slice()
            .sort((a, b) => {
                const scoreA = (a.upvotes || 0) - (a.downvotes || 0) + (a.stats?.copies || 0) * 2;
                const scoreB = (b.upvotes || 0) - (b.downvotes || 0) + (b.stats?.copies || 0) * 2;
                return scoreB - scoreA;
            })
            .slice(0, 8);
    }, [prompts]);

    // Get top prompts by category
    const promptsByCategory = useMemo(() => {
        const result = {};
        CATEGORIES.forEach(cat => {
            const categoryPrompts = prompts
                .filter(p => p.category?.toLowerCase() === cat.id)
                .sort((a, b) => {
                    const scoreA = (a.upvotes || 0) - (a.downvotes || 0) + (a.stats?.copies || 0);
                    const scoreB = (b.upvotes || 0) - (b.downvotes || 0) + (b.stats?.copies || 0);
                    return scoreB - scoreA;
                })
                .slice(0, 4);
            result[cat.id] = categoryPrompts;
        });
        return result;
    }, [prompts]);

    // Get top sources
    const topSources = useMemo(() => {
        const counts = {};
        prompts.forEach(p => {
            const source = p.source || 'Other';
            counts[source] = (counts[source] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [prompts]);

    // Search filtered prompts
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return prompts.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.content.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8);
    }, [prompts, searchQuery]);

    if (!isLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="text-secondary">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <Header onSearch={setSearchQuery} onOpenBuilder={onOpenBuilder} onAddPrompt={onAddPrompt} />

            {/* Search results */}
            {searchQuery.trim() && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        Search Results for "{searchQuery}"
                    </h2>
                    {searchResults.length > 0 ? (
                        <div className="prompt-grid">
                            {searchResults.map(prompt => (
                                <div key={prompt.id} onClick={() => setSelectedPrompt(prompt)} style={{ cursor: 'pointer' }}>
                                    <PromptCard
                                        prompt={prompt}
                                        onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                                        onVote={votePrompt}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>No prompts found.</p>
                    )}
                </div>
            )}

            {/* Main content */}
            {!searchQuery.trim() && (
                <>
                    {/* Page Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                            Browse Prompts
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                            Ready-to-use prompts across categories. Click to view, copy, and customize.
                        </p>
                    </div>

                    {/* Top Trending Section */}
                    {trendingPrompts.length > 0 && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <TrendingUp size={20} style={{ color: '#f59e0b' }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                                    Top Trending
                                </h3>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px'
                                }}>
                                    Most copied & upvoted
                                </span>
                            </div>
                            <ScrollableRow rowId="trending-row">
                                {trendingPrompts.map(prompt => (
                                    <ScrollCard key={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
                                        <PromptCard
                                            prompt={prompt}
                                            onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                                            onVote={votePrompt}
                                        />
                                    </ScrollCard>
                                ))}
                            </ScrollableRow>
                        </div>
                    )}

                    {/* Category sections */}
                    {CATEGORIES.map(cat => {
                        const categoryPrompts = promptsByCategory[cat.id] || [];
                        if (categoryPrompts.length === 0) return null;

                        return (
                            <div key={cat.id} style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <cat.icon size={18} style={{ color: cat.color }} />
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                                            {cat.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            background: 'var(--bg-input)',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '4px'
                                        }}>
                                            Top {categoryPrompts.length}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/app/category/${cat.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.8rem',
                                            color: 'var(--accent-primary)',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        View all <ChevronRight size={14} />
                                    </Link>
                                </div>
                                <ScrollableRow rowId={`category-${cat.id}-row`}>
                                    {categoryPrompts.map(prompt => (
                                        <ScrollCard key={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
                                            <PromptCard
                                                prompt={prompt}
                                                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                                                onVote={votePrompt}
                                            />
                                        </ScrollCard>
                                    ))}
                                </ScrollableRow>
                            </div>
                        );
                    })}

                    {/* Top Sources */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <TrendingUp size={18} style={{ color: 'var(--text-muted)' }} />
                            Top Prompt Sources
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {topSources.map(({ source, count }) => (
                                <div
                                    key={source}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        padding: '0.5rem 0.75rem'
                                    }}
                                >
                                    {getSourceIcon(source, 16)}
                                    <span style={{ fontSize: '0.85rem' }}>{source}</span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)',
                                        background: 'var(--bg-input)',
                                        padding: '0.15rem 0.4rem',
                                        borderRadius: '4px'
                                    }}>
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <PromptDetailModal
                prompt={selectedPrompt}
                isOpen={!!selectedPrompt}
                onClose={() => setSelectedPrompt(null)}
                onDelete={async () => { const success = await deletePrompt(selectedPrompt.id); if (success) setSelectedPrompt(null); }}
                onUpdate={(updatedPrompt) => { updatePrompt(updatedPrompt); setSelectedPrompt(updatedPrompt); }}
                onFork={async () => {
                    const forked = await forkPrompt(selectedPrompt.id);
                    if (forked) setSelectedPrompt(forked);
                }}
            />
        </div>
    );
};

export default BrowsePage;
