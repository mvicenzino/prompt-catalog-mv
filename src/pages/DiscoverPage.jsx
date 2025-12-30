import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, TrendingUp, ChevronRight, ExternalLink, Play,
    Camera, Image, Code, PenTool, Smartphone, Lightbulb,
    Zap, Target, MessageSquare, BookOpen
} from 'lucide-react';
import Header from '../components/Header';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { usePrompts } from '../hooks/usePrompts';
import { getSourceIcon } from '../utils/sourceIcon';

// YouTube channels for learning prompting
const LEARNING_CHANNELS = [
    {
        name: 'All About AI',
        description: 'AI tools, prompting techniques, and tutorials',
        url: 'https://www.youtube.com/@AllAboutAI',
        subscribers: '500K+'
    },
    {
        name: 'Matt Wolfe',
        description: 'Weekly AI news and prompt engineering tips',
        url: 'https://www.youtube.com/@maborex',
        subscribers: '700K+'
    },
    {
        name: 'Prompt Engineering',
        description: 'Dedicated channel for mastering prompts',
        url: 'https://www.youtube.com/@PromptEngineeringOrg',
        subscribers: '100K+'
    },
    {
        name: 'AI Explained',
        description: 'Deep dives into AI concepts and techniques',
        url: 'https://www.youtube.com/@AIExplained-official',
        subscribers: '400K+'
    }
];

// Prompting tips
const PROMPTING_TIPS = [
    {
        icon: Target,
        title: 'Be Specific',
        description: 'Clear, detailed prompts get better results. Include context, format, and constraints.'
    },
    {
        icon: MessageSquare,
        title: 'Use Examples',
        description: 'Show the AI what you want with input/output examples for consistent results.'
    },
    {
        icon: Zap,
        title: 'Iterate & Refine',
        description: "Start simple, then add details. Don't expect perfection on the first try."
    },
    {
        icon: Lightbulb,
        title: 'Assign a Role',
        description: '"Act as a..." helps the AI adopt the right expertise and tone for your task.'
    }
];

const CATEGORIES = [
    { id: 'photos', name: 'Photos', icon: Camera, color: '#f59e0b' },
    { id: 'images', name: 'Images', icon: Image, color: '#ec4899' },
    { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
    { id: 'writing', name: 'Writing', icon: PenTool, color: '#22c55e' },
    { id: 'apps', name: 'Apps', icon: Smartphone, color: '#8b5cf6' }
];

const DiscoverPage = () => {
    const { prompts, toggleFavorite, deletePrompt, updatePrompt, forkPrompt, votePrompt, isLoaded } = usePrompts();
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Get top prompts by category (sorted by votes/popularity)
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
                .slice(0, 5);
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
            <Header onSearch={setSearchQuery} />

            {/* Show search results if searching */}
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
                                        onToggleFavorite={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(prompt.id);
                                        }}
                                        onVote={votePrompt}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>No prompts found matching your search.</p>
                    )}
                </div>
            )}

            {/* Main content when not searching */}
            {!searchQuery.trim() && (
                <>
                    {/* Hero Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                        borderRadius: '16px',
                        padding: '2rem',
                        marginBottom: '2rem',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Sparkles size={24} style={{ color: '#a855f7' }} />
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                                Discover Prompts
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, maxWidth: '600px' }}>
                            Explore {prompts.length}+ curated prompts for AI image generation, coding, writing, and more.
                            Learn the art of prompting to unlock AI's full potential.
                        </p>
                    </div>

                    {/* Quick Tips Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                                Prompting Essentials
                            </h2>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1rem'
                        }}>
                            {PROMPTING_TIPS.map((tip, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'var(--bg-card)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        border: '1px solid var(--border-subtle)'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: 'var(--accent-glow)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <tip.icon size={18} style={{ color: 'var(--accent-primary)' }} />
                                    </div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                                        {tip.title}
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                                        {tip.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular by Category */}
                    {CATEGORIES.map(cat => {
                        const categoryPrompts = promptsByCategory[cat.id] || [];
                        if (categoryPrompts.length === 0) return null;

                        return (
                            <div key={cat.id} style={{ marginBottom: '2.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: `${cat.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <cat.icon size={16} style={{ color: cat.color }} />
                                        </div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                                            Top {cat.name} Prompts
                                        </h2>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            background: 'var(--bg-input)',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '10px'
                                        }}>
                                            {prompts.filter(p => p.category?.toLowerCase() === cat.id).length}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/app/category/${cat.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.85rem',
                                            color: 'var(--accent-primary)',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        View all <ChevronRight size={16} />
                                    </Link>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    {categoryPrompts.map(prompt => (
                                        <div key={prompt.id} onClick={() => setSelectedPrompt(prompt)} style={{ cursor: 'pointer' }}>
                                            <PromptCard
                                                prompt={prompt}
                                                onToggleFavorite={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(prompt.id);
                                                }}
                                                onVote={votePrompt}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Top Sources Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                                Top Prompt Sources
                            </h2>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                        }}>
                            {topSources.map(({ source, count }) => (
                                <div
                                    key={source}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 1rem'
                                    }}
                                >
                                    {getSourceIcon(source, 20)}
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{source}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {count} prompts
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Learning Section */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Play size={20} style={{ color: '#ef4444' }} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                                Learn Prompt Engineering
                            </h2>
                        </div>
                        <p style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem'
                        }}>
                            Master the art of prompting with these top YouTube channels:
                        </p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: '0.75rem'
                        }}>
                            {LEARNING_CHANNELS.map((channel, idx) => (
                                <a
                                    key={idx}
                                    href={channel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem',
                                        background: 'var(--bg-input)',
                                        borderRadius: '10px',
                                        padding: '0.875rem',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        border: '1px solid transparent',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-highlight)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.borderColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#ef444420',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Play size={18} style={{ color: '#ef4444' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            marginBottom: '0.25rem'
                                        }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                {channel.name}
                                            </span>
                                            <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-secondary)',
                                            margin: 0,
                                            lineHeight: 1.3
                                        }}>
                                            {channel.description}
                                        </p>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--text-muted)',
                                            marginTop: '0.35rem',
                                            display: 'inline-block'
                                        }}>
                                            {channel.subscribers} subscribers
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <PromptDetailModal
                prompt={selectedPrompt}
                isOpen={!!selectedPrompt}
                onClose={() => setSelectedPrompt(null)}
                onDelete={() => {
                    deletePrompt(selectedPrompt.id);
                    setSelectedPrompt(null);
                }}
                onUpdate={(updatedPrompt) => {
                    updatePrompt(updatedPrompt);
                    setSelectedPrompt(updatedPrompt);
                }}
                onFork={async () => {
                    const forked = await forkPrompt(selectedPrompt.id);
                    if (forked) {
                        setSelectedPrompt(forked);
                    }
                }}
            />
        </div>
    );
};

export default DiscoverPage;
