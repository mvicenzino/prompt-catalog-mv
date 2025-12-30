// Pre-built prompt templates with starter examples and guidance
export const PROMPT_TEMPLATES = [
    {
        id: 'custom',
        name: 'Start from Scratch',
        category: 'All',
        icon: 'Plus',
        description: 'Build your own custom prompt',
        supportsFile: true,
        fileHint: 'Upload any reference document to provide context',
        guidance: {
            title: 'Custom Prompt Best Practices',
            tips: [
                'Start with a clear action verb (Write, Create, Analyze, Explain)',
                'Specify the format you want (list, paragraph, table, code)',
                'Include your target audience if relevant',
                'Add constraints like word count or tone'
            ]
        },
        starterExamples: [
            'Write a professional email to reschedule a meeting',
            'Create a meal plan for the week with grocery list',
            'Help me brainstorm ideas for my presentation',
            'Summarize this article in 3 bullet points',
            'Write a thank you note for a job interview',
            'Create a workout routine for beginners'
        ]
    },
    {
        id: 'code-review',
        name: 'Code Review',
        category: 'Coding',
        icon: 'Code',
        description: 'Get feedback on your code',
        supportsFile: true,
        fileHint: 'Paste your code file or upload a .js, .py, .ts file',
        guidance: {
            title: 'Code Review Best Practices',
            tips: [
                'Include the full function/component, not just snippets',
                'Mention your tech stack and version (React 18, Python 3.11)',
                'Specify what aspects to focus on (performance, security, readability)',
                'Share any constraints (must maintain backwards compatibility)'
            ]
        },
        starterExamples: [
            'Review this React component for performance issues',
            'Check this Python function for bugs and edge cases',
            'Review my SQL query for optimization opportunities',
            'Analyze this API endpoint for security vulnerabilities',
            'Review this CSS for browser compatibility issues',
            'Check this JavaScript for memory leaks',
            'Review this TypeScript for type safety improvements'
        ]
    },
    {
        id: 'blog-writer',
        name: 'Blog Post',
        category: 'Writing',
        icon: 'FileText',
        description: 'Write engaging blog content',
        supportsFile: true,
        fileHint: 'Upload research, notes, or existing drafts to build upon',
        guidance: {
            title: 'Blog Post Best Practices',
            tips: [
                'Specify your target audience and their knowledge level',
                'Include desired word count and format (listicle, how-to, opinion)',
                'Mention tone (professional, casual, humorous, inspirational)',
                'Add any keywords or SEO requirements'
            ]
        },
        starterExamples: [
            'Write a blog post about the benefits of remote work',
            'Create an article on beginner investing tips',
            'Write a how-to guide for starting a podcast',
            'Create a listicle of productivity hacks for students',
            'Write a thought leadership piece on AI in healthcare',
            'Create a tutorial on building a personal brand'
        ]
    },
    {
        id: 'image-prompt',
        name: 'Image Prompt',
        category: 'Images',
        icon: 'Image',
        description: 'Create AI image generation prompts',
        supportsFile: true,
        fileHint: 'Upload a reference image for style matching',
        guidance: {
            title: 'Image Prompt Best Practices',
            tips: [
                'Describe the subject first, then style and mood',
                'Include lighting details (golden hour, neon, soft diffused)',
                'Specify art style (photorealistic, watercolor, anime, 3D render)',
                'Add camera/lens details for photorealistic (35mm, macro, wide angle)'
            ]
        },
        starterExamples: [
            'A cozy coffee shop interior with warm lighting, watercolor style',
            'Portrait of a cyberpunk character with neon reflections',
            'Serene mountain landscape at golden hour, photorealistic',
            'Abstract geometric pattern with vibrant gradients',
            'Vintage travel poster of Paris in art deco style',
            'Cute cartoon mascot for a tech startup',
            'Product photo of sneakers on minimalist background'
        ]
    },
    {
        id: 'explain-concept',
        name: 'Explain Topic',
        category: 'Writing',
        icon: 'Lightbulb',
        description: 'Get simple explanations',
        supportsFile: false,
        guidance: {
            title: 'Explanation Best Practices',
            tips: [
                'Specify your current understanding level',
                'Request analogies or real-world examples',
                'Ask for the "why" not just the "what"',
                'Mention if you want technical depth or simplified overview'
            ]
        },
        starterExamples: [
            'Explain blockchain technology to a 10-year-old',
            'Break down how the stock market works for beginners',
            'Explain machine learning in simple terms',
            'Describe how credit scores work and why they matter',
            'Explain the basics of nutrition and macros',
            'Break down how search engines rank websites'
        ]
    },
    {
        id: 'social-media',
        name: 'Social Media',
        category: 'Writing',
        icon: 'MessageCircle',
        description: 'Create viral social content',
        supportsFile: true,
        fileHint: 'Upload images or past successful posts as reference',
        guidance: {
            title: 'Social Media Best Practices',
            tips: [
                'Specify the platform (tone differs across LinkedIn, Twitter, IG)',
                'Include your brand voice/personality',
                'Mention any hashtags or mentions to include',
                'Specify call-to-action (engage, click, share)'
            ]
        },
        starterExamples: [
            'Write a Twitter thread about morning routines',
            'Create an engaging LinkedIn post about career growth',
            'Write Instagram captions for a travel photo series',
            'Create a TikTok script about a day in my life',
            'Write a Facebook post announcing a product launch',
            'Create a carousel post about healthy habits'
        ]
    },
    {
        id: 'debug-helper',
        name: 'Debug Code',
        category: 'Coding',
        icon: 'Bug',
        description: 'Fix bugs and errors',
        supportsFile: true,
        fileHint: 'Upload the file with the bug or paste error logs',
        guidance: {
            title: 'Debug Request Best Practices',
            tips: [
                'Include the exact error message (copy-paste)',
                'Share the relevant code context, not just the failing line',
                'Describe what you expected vs what happened',
                'Mention what you\'ve already tried'
            ]
        },
        starterExamples: [
            'Fix: TypeError undefined is not a function in React',
            'Debug: API returning 500 error on POST request',
            'Solve: CSS flexbox not centering elements properly',
            'Fix: Memory leak in useEffect cleanup',
            'Debug: Database query returning duplicate records',
            'Solve: CORS error when calling external API',
            'Fix: Form validation not triggering on submit'
        ]
    },
    {
        id: 'prd',
        name: 'Product Requirements',
        category: 'Business',
        icon: 'ClipboardList',
        description: 'Create PRDs and product specs',
        supportsFile: true,
        fileHint: 'Upload existing PRDs, mockups, or user research as reference',
        guidance: {
            title: 'PRD Best Practices',
            tips: [
                'Start with the problem statement and user pain points',
                'Include success metrics (KPIs you\'ll track)',
                'Define scope clearly - what\'s in/out of this release',
                'Add technical constraints and dependencies',
                'Include edge cases and error states'
            ]
        },
        starterExamples: [
            'Write a PRD for a mobile app feature that allows users to save favorites',
            'Create product requirements for an AI-powered search enhancement',
            'Draft a one-pager for a new onboarding flow redesign',
            'Write acceptance criteria for a user authentication feature',
            'Create a feature spec for in-app notifications system',
            'Draft requirements for a dashboard analytics feature',
            'Write user stories for a checkout flow improvement'
        ]
    },
    {
        id: 'strategic-plan',
        name: 'Strategic Planning',
        category: 'Business',
        icon: 'Target',
        description: 'Build strategic plans and roadmaps',
        supportsFile: true,
        fileHint: 'Upload market research, competitor analysis, or company data',
        guidance: {
            title: 'Strategic Planning Best Practices',
            tips: [
                'Define the time horizon (30/60/90 days, quarterly, annual)',
                'Include current state analysis and desired outcomes',
                'Identify key stakeholders and their priorities',
                'Add resource constraints and dependencies',
                'Include measurable milestones and checkpoints'
            ]
        },
        starterExamples: [
            'Create a 90-day go-to-market strategy for a B2B SaaS product',
            'Draft a competitive analysis framework for our industry',
            'Write a product roadmap summary for stakeholder presentation',
            'Create OKRs for Q1 focused on user growth and retention',
            'Draft a market expansion strategy for entering Europe',
            'Write an executive summary for our annual planning offsite',
            'Create a prioritization framework for our feature backlog'
        ]
    },
    {
        id: 'financial',
        name: 'Financial Analysis',
        category: 'Business',
        icon: 'TrendingUp',
        description: 'Financial models and projections',
        supportsFile: true,
        fileHint: 'Upload financial data, spreadsheets, or previous reports',
        guidance: {
            title: 'Financial Analysis Best Practices',
            tips: [
                'Specify the time period for analysis or projections',
                'Include key assumptions and their basis',
                'Define the metrics that matter (ARR, MRR, LTV, CAC)',
                'Add comparison benchmarks (industry, competitors, historical)',
                'Note any sensitivity factors or risk scenarios'
            ]
        },
        starterExamples: [
            'Create a revenue projection model for a subscription business',
            'Draft a budget proposal for the engineering team next quarter',
            'Write an ROI analysis for implementing a new tool',
            'Create a pricing strategy analysis for a freemium product',
            'Draft a cost-benefit analysis for build vs buy decision',
            'Write a financial summary for investor update',
            'Create unit economics breakdown for our core product'
        ]
    },
    {
        id: 'executive-comms',
        name: 'Executive Communications',
        category: 'Business',
        icon: 'Briefcase',
        description: 'Board decks, updates, and presentations',
        supportsFile: true,
        fileHint: 'Upload previous decks, brand guidelines, or source data',
        guidance: {
            title: 'Executive Communication Best Practices',
            tips: [
                'Lead with the bottom line (BLUF - what do they need to know/do)',
                'Know your audience - board vs investors vs all-hands',
                'Include data to support key points',
                'Anticipate questions and address them proactively',
                'Keep it concise - executives are time-constrained'
            ]
        },
        starterExamples: [
            'Write an executive summary for our monthly board meeting',
            'Create a company all-hands presentation outline',
            'Draft a stakeholder update on project status and risks',
            'Write talking points for a media interview about our product',
            'Create an investor pitch deck narrative',
            'Draft a quarterly business review presentation',
            'Write a change management communication for org restructure'
        ]
    }
];

// Simple sections for the builder
export const BUILDER_SECTIONS = [
    {
        id: 'task',
        title: 'What do you need?',
        placeholder: 'Describe what you want the AI to help you with...',
        hint: 'Be specific about your goal',
        required: true
    },
    {
        id: 'context',
        title: 'Any additional details?',
        placeholder: 'Add context, background info, or requirements (optional)',
        hint: 'The more context, the better the results',
        required: false
    }
];

// Assess prompt quality (simplified)
export function assessPromptQuality(sections) {
    const taskLength = sections.task?.length || 0;
    const contextLength = sections.context?.length || 0;

    let score = 0;
    if (taskLength > 50) score += 50;
    else if (taskLength > 20) score += 30;
    else if (taskLength > 0) score += 15;

    if (contextLength > 30) score += 50;
    else if (contextLength > 10) score += 30;
    else if (contextLength > 0) score += 15;

    return {
        score,
        level: score >= 80 ? 'excellent' : score >= 50 ? 'good' : score >= 30 ? 'basic' : 'minimal'
    };
}

// Compile sections into final prompt
export function compilePrompt(sections) {
    const parts = [];
    if (sections.task?.trim()) parts.push(sections.task.trim());
    if (sections.context?.trim()) parts.push(sections.context.trim());
    return parts.join('\n\n');
}
