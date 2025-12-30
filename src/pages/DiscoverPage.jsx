import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
    Sparkles, ExternalLink, Play, Copy, Check, Zap, Target, MessageSquare, BookOpen,
    Compass, Twitter, Radio, Rocket, Building2, Brain, ArrowRight, Calendar
} from 'lucide-react';
import Header from '../components/Header';

// Page last updated timestamp
const PAGE_LAST_UPDATED = 'Dec 29, 2025';

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

// Learning resources - official guides (verified working Dec 2025)
const LEARNING_RESOURCES = [
    {
        title: "Anthropic Prompt Engineering",
        description: "Official Claude prompting guide",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
        type: "Official"
    },
    {
        title: "OpenAI Prompt Guide",
        description: "GPT best practices & techniques",
        url: "https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api",
        type: "Official"
    },
    {
        title: "Learn Prompting",
        description: "Free course with 60+ modules",
        url: "https://learnprompting.org",
        type: "Course"
    },
    {
        title: "Prompt Engineering Guide",
        description: "Community-driven resource hub",
        url: "https://www.promptingguide.ai",
        type: "Guide"
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

// Follow the Puck - Stay ahead of AI trends (verified Dec 2025)
const FOLLOW_THE_PUCK = {
    youtube: [
        {
            name: 'Two Minute Papers',
            handle: '@TwoMinutePapers',
            description: 'AI research in 2 minutes',
            url: 'https://www.youtube.com/@TwoMinutePapers',
            color: '#ef4444'
        },
        {
            name: 'Fireship',
            handle: '@Fireship',
            description: 'Fast-paced AI & dev news',
            url: 'https://www.youtube.com/@Fireship',
            color: '#ef4444'
        },
        {
            name: 'Yannic Kilcher',
            handle: '@YannicKilcher',
            description: 'Deep dive paper reviews',
            url: 'https://www.youtube.com/@YannicKilcher',
            color: '#ef4444'
        }
    ],
    twitter: [
        {
            name: 'Sam Altman',
            handle: '@sama',
            description: 'OpenAI CEO',
            url: 'https://x.com/sama',
            color: '#000000'
        },
        {
            name: 'Andrej Karpathy',
            handle: '@karpathy',
            description: 'AI educator & researcher',
            url: 'https://x.com/karpathy',
            color: '#000000'
        },
        {
            name: 'Yann LeCun',
            handle: '@ylecun',
            description: 'Meta Chief AI Scientist',
            url: 'https://x.com/ylecun',
            color: '#000000'
        },
        {
            name: 'Dario Amodei',
            handle: '@DarioAmodei',
            description: 'Anthropic CEO',
            url: 'https://x.com/DarioAmodei',
            color: '#000000'
        }
    ],
    reddit: [
        {
            name: 'r/MachineLearning',
            members: '3.2M',
            description: 'ML research & papers',
            url: 'https://reddit.com/r/MachineLearning',
            color: '#ff4500'
        },
        {
            name: 'r/artificial',
            members: '1.8M',
            description: 'AI news & discussion',
            url: 'https://reddit.com/r/artificial',
            color: '#ff4500'
        },
        {
            name: 'r/LocalLLaMA',
            members: '500K',
            description: 'Open-source LLM community',
            url: 'https://reddit.com/r/LocalLLaMA',
            color: '#ff4500'
        },
        {
            name: 'r/ChatGPT',
            members: '5M+',
            description: 'ChatGPT tips & news',
            url: 'https://reddit.com/r/ChatGPT',
            color: '#ff4500'
        }
    ]
};

// 2026 and Beyond - Frontier AI developments
const FRONTIER_AI = {
    lastUpdated: 'Dec 29, 2025',
    topCompanies: [
        { name: 'OpenAI', focus: 'GPT-5, Sora, AGI research', url: 'https://openai.com/research' },
        { name: 'Anthropic', focus: 'Claude, Constitutional AI, Safety', url: 'https://www.anthropic.com/research' },
        { name: 'Google DeepMind', focus: 'Gemini, AlphaFold, World models', url: 'https://deepmind.google/research/' },
        { name: 'Meta AI', focus: 'Llama, Open source LLMs', url: 'https://ai.meta.com/research/' },
        { name: 'xAI', focus: 'Grok, Real-time reasoning', url: 'https://x.ai' }
    ],
    keyTrends: [
        {
            title: 'Agentic AI',
            description: 'AI systems that can take actions, use tools, and complete multi-step tasks autonomously',
            leaders: ['OpenAI (Operator)', 'Anthropic (Claude Computer Use)', 'Google (Project Mariner)'],
            links: [
                { label: 'Anthropic Research', url: 'https://www.anthropic.com/research/building-effective-agents' },
                { label: 'OpenAI Agents', url: 'https://openai.com/index/introducing-operator/' }
            ]
        },
        {
            title: 'World Models',
            description: 'AI that understands physics, causality, and can simulate real-world scenarios',
            leaders: ['Meta (V-JEPA)', 'DeepMind (Genie)', 'Runway (Gen-3)'],
            links: [
                { label: 'Yann LeCun on World Models', url: 'https://www.youtube.com/watch?v=5t1vTLU7s40' },
                { label: 'DeepMind Genie', url: 'https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/' }
            ]
        },
        {
            title: 'Reasoning & Planning',
            description: 'Extended thinking, chain-of-thought, and complex problem decomposition',
            leaders: ['OpenAI (o1/o3)', 'Anthropic (Claude 3.5)', 'DeepMind (Gemini 2.0)'],
            links: [
                { label: 'OpenAI o3 Announcement', url: 'https://openai.com/index/deliberative-alignment/' },
                { label: 'Chain of Thought Research', url: 'https://arxiv.org/abs/2201.11903' }
            ]
        },
        {
            title: 'Multimodal Native',
            description: 'Models that natively understand text, images, video, audio, and code together',
            leaders: ['OpenAI (GPT-4o)', 'Google (Gemini)', 'Anthropic (Claude Vision)'],
            links: [
                { label: 'Gemini 2.0 Overview', url: 'https://deepmind.google/technologies/gemini/' },
                { label: 'GPT-4o Capabilities', url: 'https://openai.com/index/hello-gpt-4o/' }
            ]
        }
    ],
    mustFollow: [
        {
            name: 'Ilya Sutskever',
            handle: '@ilyasut',
            role: 'Co-founder SSI (ex-OpenAI Chief Scientist)',
            url: 'https://x.com/ilyasut',
            platform: 'twitter'
        },
        {
            name: 'Demis Hassabis',
            handle: '@demaborex',
            role: 'CEO Google DeepMind',
            url: 'https://x.com/demaborex',
            platform: 'twitter'
        },
        {
            name: 'AI Explained',
            handle: '@AiExplained',
            role: 'Top AI analysis channel',
            url: 'https://www.youtube.com/@AIExplained-official',
            platform: 'youtube'
        },
        {
            name: 'The AI Breakdown',
            handle: '@TheAIBreakdown',
            role: 'Daily AI news & analysis',
            url: 'https://www.youtube.com/@TheAIBreakdown',
            platform: 'youtube'
        }
    ]
};

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
    const { onOpenBuilder, onAddPrompt } = useOutletContext();

    return (
        <div>
            <Header onOpenBuilder={onOpenBuilder} onAddPrompt={onAddPrompt} />

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
                    margin: '0 0 1rem 0',
                    maxWidth: '700px',
                    lineHeight: 1.5
                }}>
                    <strong>The secret:</strong> Be specific, give context, and show examples.
                    Master the fundamentals below, then build prompts with confidence.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link
                        to="/app/browse"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        Browse Prompts <ArrowRight size={16} />
                    </Link>
                </div>
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

            {/* Follow the Puck - AI Trends Aggregator */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2.5rem',
                border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Compass size={20} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                            Follow the Puck
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            "Skate to where the puck is going" — Stay ahead of AI trends
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem',
                    marginTop: '1.25rem'
                }}>
                    {/* YouTube */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}>
                            <Play size={16} style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>YouTube</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {FOLLOW_THE_PUCK.youtube.map((channel, idx) => (
                                <a
                                    key={idx}
                                    href={channel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{channel.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {channel.description}
                                        </div>
                                    </div>
                                    <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* X / Twitter */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}>
                            <Twitter size={16} style={{ color: 'var(--text-primary)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>X / Twitter</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem'
                        }}>
                            {FOLLOW_THE_PUCK.twitter.map((account, idx) => (
                                <a
                                    key={idx}
                                    href={account.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '0.5rem 0.625rem',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        fontSize: '0.75rem',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{account.name}</div>
                                    <div style={{ color: 'var(--accent-primary)', fontSize: '0.7rem' }}>
                                        {account.handle}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Reddit */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}>
                            <Radio size={16} style={{ color: '#ff4500' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reddit</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem'
                        }}>
                            {FOLLOW_THE_PUCK.reddit.map((sub, idx) => (
                                <a
                                    key={idx}
                                    href={sub.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '0.5rem 0.625rem',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        fontSize: '0.75rem',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{ fontWeight: 600, color: '#ff4500', marginBottom: '0.15rem' }}>
                                        {sub.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                                        {sub.members} members
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2026 and Beyond - Frontier AI */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2.5rem',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Rocket size={20} style={{ color: '#3b82f6' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                                2026 and Beyond
                            </h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                Where frontier AI is heading • Updated {FRONTIER_AI.lastUpdated}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Trends */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                    }}>
                        <Brain size={16} style={{ color: '#a855f7' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Key Trends Shaping 2026</span>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {FRONTIER_AI.keyTrends.map((trend, idx) => (
                            <div key={idx} style={{
                                background: 'var(--bg-card)',
                                borderRadius: '10px',
                                padding: '0.875rem',
                                border: '1px solid var(--border-subtle)'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                    {trend.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    {trend.description}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                    {trend.leaders.map((leader, lidx) => (
                                        <span key={lidx} style={{
                                            fontSize: '0.65rem',
                                            padding: '0.15rem 0.4rem',
                                            background: 'var(--bg-input)',
                                            borderRadius: '4px',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {leader}
                                        </span>
                                    ))}
                                </div>
                                {trend.links && trend.links.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        paddingTop: '0.5rem',
                                        borderTop: '1px solid var(--border-subtle)'
                                    }}>
                                        {trend.links.map((link, lidx) => (
                                            <a
                                                key={lidx}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    fontSize: '0.65rem',
                                                    color: 'var(--accent-primary)',
                                                    textDecoration: 'none',
                                                    padding: '0.2rem 0.4rem',
                                                    background: 'var(--accent-glow)',
                                                    borderRadius: '4px',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                {link.label}
                                                <ExternalLink size={10} />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Companies & Must Follow */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem'
                }}>
                    {/* Top Companies */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}>
                            <Building2 size={16} style={{ color: '#3b82f6' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Leading AI Labs</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {FRONTIER_AI.topCompanies.map((company, idx) => (
                                <a
                                    key={idx}
                                    href={company.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0.625rem',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{company.name}</span>
                                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                                            {company.focus}
                                        </span>
                                    </div>
                                    <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Must Follow */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}>
                            <Sparkles size={16} style={{ color: '#f59e0b' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Must-Follow Voices</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {FRONTIER_AI.mustFollow.map((person, idx) => (
                                <a
                                    key={idx}
                                    href={person.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.625rem',
                                        padding: '0.5rem 0.625rem',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: person.platform === 'youtube' ? '#ef444420' : 'var(--bg-card)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {person.platform === 'youtube'
                                            ? <Play size={10} style={{ color: '#ef4444' }} />
                                            : <Twitter size={10} style={{ color: 'var(--text-primary)' }} />
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{person.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{person.role}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Footer with Last Updated */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '2rem 0 1rem',
                color: 'var(--text-muted)',
                fontSize: '0.75rem'
            }}>
                <Calendar size={12} />
                <span>Content last updated: {PAGE_LAST_UPDATED}</span>
            </div>
        </div>
    );
};

export default DiscoverPage;
