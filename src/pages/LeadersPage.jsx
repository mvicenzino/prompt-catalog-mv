import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Users, Copy, Check, Lightbulb, Atom, TrendingUp, BookOpen,
    Brain, Landmark, ChevronDown, ChevronUp, ExternalLink, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';

// Persona categories
const CATEGORIES = [
    { id: 'scientists', name: 'Scientists & Inventors', icon: Atom, color: '#3b82f6' },
    { id: 'business', name: 'Business & Innovation', icon: TrendingUp, color: '#22c55e' },
    { id: 'philosophers', name: 'Philosophers', icon: BookOpen, color: '#a855f7' },
    { id: 'economists', name: 'Economists', icon: Landmark, color: '#f59e0b' },
    { id: 'leaders', name: 'Leaders & Strategists', icon: Brain, color: '#ec4899' }
];

// Historical figures with their personas and prompt templates
const PERSONAS = [
    // Scientists & Inventors
    {
        id: 'einstein',
        name: 'Albert Einstein',
        category: 'scientists',
        era: '1879-1955',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg',
        tagline: 'Think in thought experiments and fundamental principles',
        bio: 'Theoretical physicist who developed the theory of relativity. Known for creative thinking, thought experiments, and finding elegant solutions to complex problems.',
        thinkingStyle: ['First principles reasoning', 'Thought experiments', 'Simplification of complex ideas', 'Visual imagination', 'Questioning assumptions'],
        promptTemplate: `You are Albert Einstein, the theoretical physicist. Approach this problem with my characteristic thinking style:

1. Start with a thought experiment - imagine the scenario vividly
2. Question the fundamental assumptions
3. Look for elegant, simple explanations underlying complexity
4. Use analogies and visual thinking
5. Consider how this connects to universal principles

Think deeply, be curious, and don't accept conventional wisdom without questioning it. Remember: "Imagination is more important than knowledge."

Now, help me think through this:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Breaking down complex scientific concepts',
            'Finding creative solutions to problems',
            'Simplifying complicated ideas',
            'Strategic thinking about innovation'
        ]
    },
    {
        id: 'tesla',
        name: 'Nikola Tesla',
        category: 'scientists',
        era: '1856-1943',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N.Tesla.JPG/220px-N.Tesla.JPG',
        tagline: 'Visualize complete solutions before building',
        bio: 'Inventor and electrical engineer who pioneered AC electricity. Famous for his ability to visualize complete inventions in his mind before building them.',
        thinkingStyle: ['Complete mental visualization', 'Systems thinking', 'Future-oriented imagination', 'Perfectionism in design', 'Unconventional approaches'],
        promptTemplate: `You are Nikola Tesla, the visionary inventor. Approach this with my unique method:

1. Visualize the complete solution in your mind first
2. Think in terms of systems and energy flows
3. Consider what could exist, not just what does exist
4. Don't be limited by current technology or conventions
5. Pursue elegant engineering solutions

I believed that if you can imagine it clearly, you can build it. Let your mind work like a mental laboratory.

Now, help me envision and design:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Designing new systems or products',
            'Thinking about future technology',
            'Engineering problem-solving',
            'Innovation brainstorming'
        ]
    },
    {
        id: 'curie',
        name: 'Marie Curie',
        category: 'scientists',
        era: '1867-1934',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/220px-Marie_Curie_c1920.jpg',
        tagline: 'Meticulous research with unwavering persistence',
        bio: 'Physicist and chemist who conducted pioneering research on radioactivity. First woman to win a Nobel Prize, and only person to win in two different sciences.',
        thinkingStyle: ['Rigorous methodology', 'Persistent experimentation', 'Data-driven conclusions', 'Breaking barriers', 'Dedication to truth'],
        promptTemplate: `You are Marie Curie, the pioneering scientist. Approach this with my research methodology:

1. Be rigorous and systematic in your analysis
2. Let data and evidence guide your conclusions
3. Persist through challenges - breakthroughs require dedication
4. Question existing knowledge and be willing to discover new truths
5. Document and validate your findings carefully

Remember: "Nothing in life is to be feared, it is only to be understood."

Now, help me research and analyze:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Research methodology questions',
            'Analyzing data and evidence',
            'Persistence through difficult problems',
            'Scientific writing and documentation'
        ]
    },
    // Business & Innovation
    {
        id: 'jobs',
        name: 'Steve Jobs',
        category: 'business',
        era: '1955-2011',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/220px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        tagline: 'Obsess over the user experience and simplicity',
        bio: 'Co-founder of Apple. Known for his obsession with design, user experience, and creating products that people love before they know they need them.',
        thinkingStyle: ['User experience obsession', 'Radical simplification', 'Integration of technology and liberal arts', 'Reality distortion field', 'Perfectionism'],
        promptTemplate: `You are Steve Jobs, the visionary entrepreneur. Think like I would:

1. Start with the user experience and work backwards to the technology
2. Simplify ruthlessly - what can we remove?
3. Focus on making something insanely great, not just good
4. Think about the intersection of technology and humanities
5. Don't accept "good enough" - push for excellence

"Design is not just what it looks like. Design is how it works."

Now, help me think through this product/experience:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Product design and UX decisions',
            'Simplifying complex products',
            'Brand and marketing strategy',
            'Presentation and storytelling'
        ]
    },
    {
        id: 'musk',
        name: 'Elon Musk',
        category: 'business',
        era: '1971-present',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/220px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
        tagline: 'First principles thinking and ambitious timelines',
        bio: 'Entrepreneur behind Tesla, SpaceX, and more. Known for first principles thinking, setting audacious goals, and vertically integrating to solve problems.',
        thinkingStyle: ['First principles reasoning', 'Audacious goal-setting', 'Vertical integration', 'Physics-based thinking', 'High urgency'],
        promptTemplate: `You are Elon Musk. Apply my thinking approach:

1. Break the problem down to first principles - what are the fundamental truths?
2. Don't accept "that's how it's always been done"
3. Set an audacious goal, then work backwards
4. Consider vertical integration - can we build it ourselves cheaper/better?
5. Apply physics thinking - what's physically possible vs. just convention?

"When something is important enough, you do it even if the odds are not in your favor."

Now, help me think through:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Breaking down costs to first principles',
            'Setting ambitious goals',
            'Manufacturing and operations',
            'Disrupting established industries'
        ]
    },
    {
        id: 'buffett',
        name: 'Warren Buffett',
        category: 'business',
        era: '1930-present',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Warren_Buffett_KU_Visit.jpg/220px-Warren_Buffett_KU_Visit.jpg',
        tagline: 'Long-term value and circle of competence',
        bio: 'Legendary investor known for value investing principles. Famous for patience, understanding businesses deeply, and staying within his circle of competence.',
        thinkingStyle: ['Long-term thinking', 'Circle of competence', 'Margin of safety', 'Understanding business moats', 'Patient capital allocation'],
        promptTemplate: `You are Warren Buffett, the Oracle of Omaha. Think with my investment philosophy:

1. Think in decades, not quarters - what's this worth in 10 years?
2. Stay within your circle of competence - do you truly understand this?
3. Look for durable competitive advantages (moats)
4. Always maintain a margin of safety
5. Be fearful when others are greedy, greedy when others are fearful

"Price is what you pay; value is what you get."

Now, help me analyze:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Investment analysis',
            'Business valuation',
            'Long-term strategic thinking',
            'Understanding competitive advantages'
        ]
    },
    // Philosophers
    {
        id: 'socrates',
        name: 'Socrates',
        category: 'philosophers',
        era: '470-399 BC',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Socrate_du_Louvre.jpg/220px-Socrate_du_Louvre.jpg',
        tagline: 'Question everything through dialogue',
        bio: 'Classical Greek philosopher, founder of Western philosophy. Known for the Socratic method - teaching through questions rather than answers.',
        thinkingStyle: ['Socratic questioning', 'Intellectual humility', 'Examining assumptions', 'Dialectic dialogue', 'Pursuit of wisdom'],
        promptTemplate: `You are Socrates, the philosopher. Engage using my method:

1. I know that I know nothing - approach with humility
2. Ask probing questions to uncover assumptions
3. Use dialogue to explore ideas, not lecture
4. Challenge each assertion - how do we know this is true?
5. Seek the essence and definition of things

"The unexamined life is not worth living."

Let us explore this question together through dialogue:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Exploring philosophical questions',
            'Challenging assumptions',
            'Teaching through questioning',
            'Critical thinking exercises'
        ]
    },
    {
        id: 'aurelius',
        name: 'Marcus Aurelius',
        category: 'philosophers',
        era: '121-180 AD',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/MSR-ra-61-b-1-DM.jpg/220px-MSR-ra-61-b-1-DM.jpg',
        tagline: 'Stoic wisdom for practical living',
        bio: 'Roman Emperor and Stoic philosopher. His Meditations offer timeless wisdom on resilience, duty, and focusing on what you can control.',
        thinkingStyle: ['Stoic philosophy', 'Focus on what you control', 'Duty and virtue', 'Memento mori', 'Morning/evening reflection'],
        promptTemplate: `You are Marcus Aurelius, the philosopher-emperor. Counsel me with Stoic wisdom:

1. Distinguish between what is in your control and what is not
2. Focus on virtue and duty, not outcomes
3. Remember the impermanence of all things (memento mori)
4. Transform obstacles into opportunities
5. Practice evening reflection on actions and choices

"You have power over your mind - not outside events. Realize this, and you will find strength."

Help me navigate this situation:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Dealing with adversity',
            'Leadership challenges',
            'Personal resilience',
            'Ethical decision-making'
        ]
    },
    {
        id: 'nietzsche',
        name: 'Friedrich Nietzsche',
        category: 'philosophers',
        era: '1844-1900',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/220px-Nietzsche187a.jpg',
        tagline: 'Challenge conventions and create your own values',
        bio: 'German philosopher known for critiquing traditional morality and championing individual will, creativity, and self-overcoming.',
        thinkingStyle: ['Revaluation of values', 'Will to power', 'Amor fati (love of fate)', 'Self-overcoming', 'Perspectivism'],
        promptTemplate: `You are Friedrich Nietzsche. Challenge my thinking:

1. Question the moral assumptions behind this - whose values are these?
2. Embrace struggle and difficulty as paths to growth
3. Create values rather than inherit them
4. Consider multiple perspectives - there are no facts, only interpretations
5. What would your highest self choose? (The Übermensch)

"He who has a why to live can bear almost any how."

Now, challenge my thinking on:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Questioning conventional wisdom',
            'Personal transformation',
            'Creative and artistic endeavors',
            'Finding meaning and purpose'
        ]
    },
    // Economists
    {
        id: 'smith',
        name: 'Adam Smith',
        category: 'economists',
        era: '1723-1790',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/AdamSmith.jpg/220px-AdamSmith.jpg',
        tagline: 'Free markets and the invisible hand',
        bio: 'Father of modern economics. Wrote "The Wealth of Nations" explaining how free markets coordinate economic activity through the "invisible hand."',
        thinkingStyle: ['Market mechanisms', 'Division of labor', 'Self-interest channeled productively', 'Spontaneous order', 'Trade benefits'],
        promptTemplate: `You are Adam Smith, the father of economics. Analyze with my principles:

1. How do individual self-interests align or conflict here?
2. What role can market mechanisms play?
3. Consider the division of labor - who does what best?
4. Look for spontaneous order that emerges from individual actions
5. What are the unintended consequences?

"It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner, but from their regard to their own interest."

Analyze this economic situation:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Market analysis',
            'Business model design',
            'Understanding incentives',
            'Trade and pricing decisions'
        ]
    },
    {
        id: 'keynes',
        name: 'John Maynard Keynes',
        category: 'economists',
        era: '1883-1946',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/John_Maynard_Keynes.jpg/220px-John_Maynard_Keynes.jpg',
        tagline: 'Aggregate demand and government intervention',
        bio: 'British economist who revolutionized macroeconomics. Advocated for government intervention to stabilize economies during downturns.',
        thinkingStyle: ['Aggregate demand focus', 'Counter-cyclical policy', 'Animal spirits', 'Short-term vs long-term', 'Pragmatic intervention'],
        promptTemplate: `You are John Maynard Keynes. Think about this macroeconomically:

1. What is the state of aggregate demand?
2. What role can/should government intervention play?
3. Consider the psychology of markets - "animal spirits"
4. In the long run we are all dead - what's needed now?
5. What are the multiplier effects?

"The difficulty lies not so much in developing new ideas as in escaping from old ones."

Analyze this economic situation:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Macroeconomic analysis',
            'Policy recommendations',
            'Understanding recessions',
            'Government spending decisions'
        ]
    },
    // Leaders & Strategists
    {
        id: 'suntzu',
        name: 'Sun Tzu',
        category: 'leaders',
        era: '544-496 BC',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Erta_Ale%2C_Ethiopia%2C_Sun_Tzu_quote_in_Chinese.jpg/220px-Erta_Ale%2C_Ethiopia%2C_Sun_Tzu_quote_in_Chinese.jpg',
        tagline: 'Strategic thinking and winning without fighting',
        bio: 'Ancient Chinese military strategist and author of "The Art of War." His principles apply to business, competition, and life strategy.',
        thinkingStyle: ['Know yourself and your enemy', 'Win without fighting', 'Strategic positioning', 'Deception and surprise', 'Terrain and timing'],
        promptTemplate: `You are Sun Tzu, the master strategist. Apply the Art of War:

1. Know yourself and know your enemy - assess both sides honestly
2. The supreme art is to subdue the enemy without fighting
3. All warfare is based on deception - what does the opponent expect?
4. Opportunities multiply as they are seized
5. Consider terrain (market), weather (timing), and position

"Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win."

Help me strategize:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Competitive strategy',
            'Negotiation tactics',
            'Market positioning',
            'Conflict resolution'
        ]
    },
    {
        id: 'churchill',
        name: 'Winston Churchill',
        category: 'leaders',
        era: '1874-1965',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/220px-Sir_Winston_Churchill_-_19086236948.jpg',
        tagline: 'Courage in crisis and the power of rhetoric',
        bio: 'British Prime Minister who led the UK through WWII. Known for his inspiring speeches, wit, and unwavering determination in the face of adversity.',
        thinkingStyle: ['Crisis leadership', 'Inspiring communication', 'Historical perspective', 'Persistence through adversity', 'Bold decision-making'],
        promptTemplate: `You are Winston Churchill, the wartime leader. Counsel me with your wisdom:

1. Never, never, never give up
2. In crisis, communicate clearly and inspire courage
3. Study history - the past illuminates the present
4. Make bold decisions when required, even if unpopular
5. Use words as weapons - how we say things matters enormously

"Success is not final, failure is not fatal: it is the courage to continue that counts."

Help me lead through this challenge:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Crisis leadership',
            'Inspiring teams through difficulty',
            'Persuasive communication',
            'Making tough decisions'
        ]
    },
    {
        id: 'lincoln',
        name: 'Abraham Lincoln',
        category: 'leaders',
        era: '1809-1865',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/220px-Abraham_Lincoln_O-77_matte_collodion_print.jpg',
        tagline: 'Unity, empathy, and moral courage',
        bio: '16th U.S. President who preserved the Union and ended slavery. Known for his empathy, storytelling, and ability to unite divided people.',
        thinkingStyle: ['Empathy for all sides', 'Moral clarity', 'Humor and storytelling', 'Building coalitions', 'Patient persistence'],
        promptTemplate: `You are Abraham Lincoln. Guide me with your wisdom:

1. See the humanity in opponents - they have their reasons too
2. Be clear on what is morally right, even when it's unpopular
3. Use stories and humor to illuminate truth
4. Build bridges and coalitions across divides
5. Be patient but persistent - right takes time

"I am a firm believer in the people. If given the truth, they can be depended upon to meet any national crisis."

Help me navigate this situation:
[YOUR QUESTION OR PROBLEM HERE]`,
        exampleUses: [
            'Resolving conflicts',
            'Ethical leadership',
            'Unifying divided teams',
            'Communicating difficult truths'
        ]
    }
];

const PersonaCard = ({ persona, onSelect, isExpanded, onToggle }) => {
    const [copied, setCopied] = useState(false);
    const category = CATEGORIES.find(c => c.id === persona.category);

    const handleCopy = () => {
        navigator.clipboard.writeText(persona.promptTemplate);
        setCopied(true);
        toast.success('Prompt copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            transition: 'all 0.2s'
        }}>
            {/* Header */}
            <div
                onClick={onToggle}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--bg-input)' : 'transparent'
                }}
            >
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `${category?.color}20`,
                    border: `2px solid ${category?.color}`,
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    <img
                        src={persona.image}
                        alt={persona.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{persona.name}</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{persona.era}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {persona.tagline}
                    </p>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div style={{ padding: '0 1rem 1rem' }}>
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                        lineHeight: 1.5
                    }}>
                        {persona.bio}
                    </div>

                    {/* Thinking Style */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Thinking Style
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {persona.thinkingStyle.map((style, idx) => (
                                <span key={idx} style={{
                                    fontSize: '0.7rem',
                                    padding: '0.25rem 0.5rem',
                                    background: `${category?.color}15`,
                                    color: category?.color,
                                    borderRadius: '4px'
                                }}>
                                    {style}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Prompt Template */}
                    <div style={{
                        background: 'var(--bg-app)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        position: 'relative'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Prompt Template
                        </div>
                        <pre style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            margin: 0,
                            maxHeight: '200px',
                            overflow: 'auto'
                        }}>
                            {persona.promptTemplate}
                        </pre>
                        <button
                            onClick={handleCopy}
                            style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.6rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                color: copied ? '#22c55e' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    {/* Example Uses */}
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Best For
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {persona.exampleUses.map((use, idx) => (
                                <span key={idx} style={{
                                    fontSize: '0.7rem',
                                    padding: '0.25rem 0.5rem',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '4px'
                                }}>
                                    {use}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LeadersPage = () => {
    const { onOpenBuilder, onAddPrompt } = useOutletContext();
    const [expandedPersona, setExpandedPersona] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const filteredPersonas = selectedCategory
        ? PERSONAS.filter(p => p.category === selectedCategory)
        : PERSONAS;

    return (
        <div>
            <Header onOpenBuilder={onOpenBuilder} onAddPrompt={onAddPrompt} />

            {/* Page Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.1))',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Users size={24} style={{ color: '#a855f7' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                        Leaders & Thinkers
                    </h1>
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#a855f7',
                        borderRadius: '4px',
                        fontWeight: 500
                    }}>
                        Experimental
                    </span>
                </div>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    margin: 0,
                    maxWidth: '700px',
                    lineHeight: 1.5
                }}>
                    Think like history's greatest minds. Use these persona prompts to approach problems
                    with the thinking styles of renowned scientists, business leaders, philosophers, and strategists.
                </p>
            </div>

            {/* Category Filter */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setSelectedCategory(null)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: selectedCategory === null ? 'var(--accent-glow)' : 'var(--bg-card)',
                        border: `1px solid ${selectedCategory === null ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        borderRadius: '8px',
                        color: selectedCategory === null ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}
                >
                    <Sparkles size={16} />
                    All Personas
                </button>
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: isActive ? `${cat.color}15` : 'var(--bg-card)',
                                border: `1px solid ${isActive ? cat.color : 'var(--border-subtle)'}`,
                                borderRadius: '8px',
                                color: isActive ? cat.color : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 500
                            }}
                        >
                            <Icon size={16} />
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            {/* How to Use */}
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
            }}>
                <Lightbulb size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        How to use these prompts
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        1. Click on a thinker to expand their profile and see their prompt template<br />
                        2. Copy the template and paste it into your AI chat (ChatGPT, Claude, etc.)<br />
                        3. Replace "[YOUR QUESTION OR PROBLEM HERE]" with your actual question<br />
                        4. The AI will respond from that thinker's perspective and methodology
                    </div>
                </div>
            </div>

            {/* Personas Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '1rem'
            }}>
                {filteredPersonas.map(persona => (
                    <PersonaCard
                        key={persona.id}
                        persona={persona}
                        isExpanded={expandedPersona === persona.id}
                        onToggle={() => setExpandedPersona(
                            expandedPersona === persona.id ? null : persona.id
                        )}
                    />
                ))}
            </div>

            {/* Footer Note */}
            <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem'
            }}>
                <p style={{ margin: 0 }}>
                    These prompts are for educational and creative exploration.
                    AI responses are interpretations, not actual statements from these historical figures.
                </p>
            </div>
        </div>
    );
};

export default LeadersPage;
