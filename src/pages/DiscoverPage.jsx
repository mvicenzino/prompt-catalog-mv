import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, TrendingUp, ChevronRight, ExternalLink, Play, Copy, Check,
    Camera, Image, Code, PenTool, Smartphone, Zap, Target, MessageSquare, BookOpen
} from 'lucide-react';
import Header from '../components/Header';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { usePrompts } from '../hooks/usePrompts';
import { getSourceIcon } from '../utils/sourceIcon';

// Quick reference - the essentials users need to know immediately
const QUICK_TIPS = [
    {
        icon: Target,
        title: 'Be Specific',
        bad: 'Write about dogs',
        good: 'Write a 200-word blog intro about why golden retrievers make great family pets',
        why: 'Vague = generic output. Specific = useful output.'
    },
    {
        icon: MessageSquare,
        title: 'Give Context',
        bad: 'Fix this error',
        good: "I'm getting 'TypeError: undefined' in React 18 when mapping API data in useEffect",
        why: 'AI can\'t read your mind. Share what, where, and why.'
    },
    {
        icon: Zap,
        title: 'Show Examples',
        bad: 'Write product descriptions',
        good: 'Write product descriptions like: "Crystal-clear sound meets all-day comfort. 8hrs battery."',
        why: 'One example beats 100 words of explanation.'
    }
];

// Learning resources - official guides
const LEARNING_RESOURCES = [
    {
        title: "Anthropic's Prompt Guide",
        description: "Official guide from Claude's creators",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
        type: "Official"
    },
    {
        title: "OpenAI Best Practices",
        description: "GPT prompting techniques",
        url: "https://platform.openai.com/docs/guides/prompt-engineering",
        type: "Official"
    },
    {
        title: "Learn Prompting",
        description: "Free comprehensive course",
        url: "https://learnprompting.org",
        type: "Course"
    }
];

// YouTube channels
const LEARNING_CHANNELS = [
    {
        name: 'All About AI',
        description: 'Practical tutorials',
        url: 'https://www.youtube.com/@AllAboutAI',
        subscribers: '500K+'
    },
    {
        name: 'Matt Wolfe',
        description: 'AI news & techniques',
        url: 'https://www.youtube.com/@maborex',
        subscribers: '700K+'
    },
    {
        name: 'David Ondrej',
        description: 'Advanced strategies',
        url: 'https://www.youtube.com/@DavidOndrej',
        subscribers: '300K+'
    },
    {
        name: 'AI Explained',
        description: 'Deep understanding',
        url: 'https://www.youtube.com/@AIExplained-official',
        subscribers: '400K+'
    }
];

const CATEGORIES = [
    { id: 'photos', name: 'Photos', icon: Camera, color: '#f59e0b' },
    { id: 'images', name: 'Images', icon: Image, color: '#ec4899' },
    { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
    { id: 'writing', name: 'Writing', icon: PenTool, color: '#22c55e' },
    { id: 'apps', name: 'Apps', icon: Smartphone, color: '#8b5cf6' }
];

// Copyable tip component
const TipCard = ({ tip }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(tip.good);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--accent-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <tip.icon size={16} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{tip.title}</h3>
            </div>

            {/* Bad example */}
            <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.25rem' }}>
                    ✗ DON'T
                </div>
                <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderRadius: '6px',
                    borderLeft: '2px solid #ef4444'
                }}>
                    "{tip.bad}"
                </div>
            </div>

            {/* Good example */}
            <div style={{ marginBottom: '0.75rem', flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600, marginBottom: '0.25rem' }}>
                    ✓ DO
                </div>
                <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(34, 197, 94, 0.08)',
                    borderRadius: '6px',
                    borderLeft: '2px solid #22c55e',
                    position: 'relative'
                }}>
                    "{tip.good}"
                    <button
                        onClick={handleCopy}
                        style={{
                            position: 'absolute',
                            top: '0.35rem',
                            right: '0.35rem',
                            background: 'var(--bg-input)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Copy example"
                    >
                        {copied ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
                    </button>
                </div>
            </div>

            {/* Why */}
            <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
            }}>
                💡 {tip.why}
            </div>
        </div>
    );
};

const DiscoverPage = () => {
    const { prompts, toggleFavorite, deletePrompt, updatePrompt, forkPrompt, votePrompt, isLoaded } = usePrompts();
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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
            <Header onSearch={setSearchQuery} />

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
                    {/* BLUF Hero - The benefit upfront */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))',
                        borderRadius: '16px',
                        padding: '1.75rem 2rem',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                            Get Better AI Results in Seconds
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1rem',
                            margin: 0,
                            maxWidth: '700px',
                            lineHeight: 1.5
                        }}>
                            <strong>The secret:</strong> Be specific, give context, and show examples.
                            Learn the patterns below, then grab ready-to-use prompts from our library.
                        </p>
                    </div>

                    {/* Quick Start - Immediately visible tips */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                                    The 3 Things That Actually Matter
                                </h2>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1rem'
                        }}>
                            {QUICK_TIPS.map((tip, idx) => (
                                <TipCard key={idx} tip={tip} />
                            ))}
                        </div>
                    </div>

                    {/* Resources - Compact row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2.5rem'
                    }}>
                        {/* Official Guides */}
                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.75rem'
                            }}>
                                <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                                    Go Deeper
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {LEARNING_RESOURCES.map((resource, idx) => (
                                    <a
                                        key={idx}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.625rem 0.875rem',
                                            background: 'var(--bg-input)',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            fontSize: '0.85rem',
                                            transition: 'background 0.15s'
                                        }}
                                    >
                                        <div>
                                            <span style={{ fontWeight: 500 }}>{resource.title}</span>
                                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                                — {resource.description}
                                            </span>
                                        </div>
                                        <ExternalLink size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* YouTube */}
                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.75rem'
                            }}>
                                <Play size={18} style={{ color: '#ef4444' }} />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                                    Watch & Learn
                                </h3>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem'
                            }}>
                                {LEARNING_CHANNELS.map((channel, idx) => (
                                    <a
                                        key={idx}
                                        href={channel.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            background: 'var(--bg-input)',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: '#ef444420',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Play size={12} style={{ color: '#ef4444' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.8rem' }}>{channel.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{channel.subscribers}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Divider with CTA */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '2rem',
                        padding: '1.5rem 0',
                        borderTop: '1px solid var(--border-subtle)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                            Ready-to-Use Prompts
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                            Browse our top-rated prompts across categories. Click to view, copy, and customize.
                        </p>
                    </div>

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
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '0.75rem'
                                }}>
                                    {categoryPrompts.map(prompt => (
                                        <div key={prompt.id} onClick={() => setSelectedPrompt(prompt)} style={{ cursor: 'pointer' }}>
                                            <PromptCard
                                                prompt={prompt}
                                                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                                                onVote={votePrompt}
                                            />
                                        </div>
                                    ))}
                                </div>
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
                onDelete={() => { deletePrompt(selectedPrompt.id); setSelectedPrompt(null); }}
                onUpdate={(updatedPrompt) => { updatePrompt(updatedPrompt); setSelectedPrompt(updatedPrompt); }}
                onFork={async () => {
                    const forked = await forkPrompt(selectedPrompt.id);
                    if (forked) setSelectedPrompt(forked);
                }}
            />
        </div>
    );
};

export default DiscoverPage;
