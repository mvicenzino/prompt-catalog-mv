// Prompt Builder sections following Claude best practices
export const BUILDER_SECTIONS = [
    {
        id: 'role',
        title: 'Role Definition',
        placeholder: 'Act as a [expert type] with expertise in [domain]...',
        hint: 'Define who the AI should be. Be specific about expertise level and domain.',
        required: false,
        examples: [
            'Act as a senior software engineer specializing in React and TypeScript',
            'You are an experienced marketing copywriter with 10 years in B2B SaaS',
            'Assume the role of a data scientist expert in machine learning'
        ],
        template: 'You are a {role} with expertise in {domain}.',
        keywords: ['act as', 'you are', 'assume the role', 'pretend to be']
    },
    {
        id: 'task',
        title: 'Task / Intent',
        placeholder: 'I want you to help me [action] a [thing]...',
        hint: 'Clearly state what you want the AI to do. Use action verbs.',
        required: true,
        examples: [
            'Help me write a compelling product description for...',
            'Create a step-by-step tutorial explaining how to...',
            'Analyze this code and suggest performance improvements'
        ],
        template: 'I want you to {action} {target}.',
        keywords: ['help me', 'create', 'write', 'analyze', 'generate', 'explain']
    },
    {
        id: 'context',
        title: 'Context / Background',
        placeholder: 'Background: [relevant information]...',
        hint: 'Provide relevant background information, constraints, or requirements.',
        required: false,
        examples: [
            'The target audience is beginners with no coding experience',
            'We are using React 18 with TypeScript and Tailwind CSS',
            'This is for an enterprise B2B application serving 10,000 users'
        ],
        template: 'Context: {background}. Target audience: {audience}.',
        keywords: ['context', 'background', 'audience', 'requirements', 'using']
    },
    {
        id: 'format',
        title: 'Output Format',
        placeholder: 'Format the output as [format type]...',
        hint: 'Specify how you want the response structured.',
        required: false,
        examples: [
            'Format as a numbered list with clear headings',
            'Provide the code with inline comments explaining each section',
            'Output as JSON with the following structure: {...}'
        ],
        template: 'Format the response as {format}.',
        keywords: ['format', 'output', 'structure', 'present', 'organize']
    },
    {
        id: 'examples',
        title: 'Examples (Optional)',
        placeholder: 'Example input: [input] -> Example output: [output]',
        hint: 'Provide examples of desired inputs and outputs for better results.',
        required: false,
        examples: [
            'Example: "blue sky" -> "A brilliant azure expanse stretches endlessly..."',
            'Good example: [example]\nBad example: [example]'
        ],
        template: 'Here is an example:\nInput: {example_input}\nOutput: {example_output}',
        keywords: ['example', 'like this', 'similar to', 'for instance']
    },
    {
        id: 'constraints',
        title: 'Constraints & Guidelines',
        placeholder: 'Important: [constraint]. Do not [restriction]...',
        hint: 'Set boundaries and restrictions for the response.',
        required: false,
        examples: [
            'Keep the response under 200 words',
            'Use only professional, formal language',
            'Do not include any external links or references',
            'Focus only on the technical aspects, not the business side'
        ],
        template: 'Important constraints:\n- {constraint1}\n- {constraint2}',
        keywords: ['important', 'do not', 'avoid', 'must', 'should not', 'limit']
    }
];

// Pre-built prompt templates
export const PROMPT_TEMPLATES = [
    {
        id: 'custom',
        name: 'Start from Scratch',
        category: 'All',
        icon: 'Plus',
        description: 'Build your prompt step by step with guided sections',
        sections: {
            role: '',
            task: '',
            context: '',
            format: '',
            examples: '',
            constraints: ''
        }
    },
    {
        id: 'code-review',
        name: 'Code Review',
        category: 'Coding',
        icon: 'Code',
        description: 'Get detailed feedback on your code',
        sections: {
            role: 'You are an experienced senior software engineer conducting a thorough code review.',
            task: 'Review the following code and provide detailed feedback on code quality, potential bugs, and improvements.',
            context: '',
            format: 'Organize your feedback into:\n1. Critical Issues (bugs, security concerns)\n2. Suggested Improvements\n3. Best Practices\n4. Code Style',
            examples: '',
            constraints: 'Be constructive and explain the reasoning behind each suggestion. Focus on actionable feedback.'
        }
    },
    {
        id: 'blog-writer',
        name: 'Blog Post Writer',
        category: 'Writing',
        icon: 'FileText',
        description: 'Generate engaging blog content',
        sections: {
            role: 'You are a professional content writer who creates engaging, well-researched blog posts.',
            task: 'Write a comprehensive blog post about [TOPIC].',
            context: 'Target audience: [AUDIENCE]. Tone: [TONE - professional/casual/educational].',
            format: 'Include:\n- Catchy headline\n- Engaging introduction with hook\n- 3-5 main sections with subheadings\n- Practical examples or tips\n- Conclusion with call-to-action',
            examples: '',
            constraints: 'Length: approximately [WORD_COUNT] words. Make it SEO-friendly with natural keyword usage.'
        }
    },
    {
        id: 'image-prompt',
        name: 'AI Image Prompt',
        category: 'Images',
        icon: 'Image',
        description: 'Create detailed prompts for AI image generation',
        sections: {
            role: '',
            task: 'Generate an image of [SUBJECT].',
            context: 'Style: [STYLE - photorealistic/illustration/oil painting/etc.]\nMood: [MOOD - dramatic/peaceful/energetic/etc.]',
            format: '[MEDIUM], [QUALITY - 4K, highly detailed], [LIGHTING], [CAMERA_ANGLE if applicable]',
            examples: '',
            constraints: ''
        }
    },
    {
        id: 'explain-concept',
        name: 'Concept Explainer',
        category: 'Writing',
        icon: 'Lightbulb',
        description: 'Get clear explanations of complex topics',
        sections: {
            role: 'You are an expert educator who excels at explaining complex topics in simple, accessible terms.',
            task: 'Explain [CONCEPT] in a way that [AUDIENCE_LEVEL] can understand.',
            context: '',
            format: 'Use:\n- Simple analogies from everyday life\n- Concrete examples\n- Step-by-step breakdown\n- Visual descriptions when helpful',
            examples: '',
            constraints: 'Avoid jargon. Use clear, simple language. Check understanding at each step.'
        }
    },
    {
        id: 'social-media',
        name: 'Social Media Post',
        category: 'Writing',
        icon: 'MessageCircle',
        description: 'Create engaging social content',
        sections: {
            role: 'You are a social media expert who creates viral, engaging content.',
            task: 'Create a [PLATFORM] post about [TOPIC].',
            context: 'Brand voice: [VOICE]. Goal: [GOAL - engagement/awareness/conversion].',
            format: 'Include:\n- Hook in first line\n- Key message\n- Call-to-action\n- Relevant hashtags',
            examples: '',
            constraints: 'Keep within platform character limits. Make it shareable and engaging.'
        }
    },
    {
        id: 'debug-helper',
        name: 'Debug Helper',
        category: 'Coding',
        icon: 'Bug',
        description: 'Get help debugging issues',
        sections: {
            role: 'You are an expert debugger with deep knowledge of [LANGUAGE/FRAMEWORK].',
            task: 'Help me debug this issue: [DESCRIBE_PROBLEM]',
            context: 'Error message: [ERROR]\nExpected behavior: [EXPECTED]\nActual behavior: [ACTUAL]',
            format: '1. Identify the root cause\n2. Explain why this is happening\n3. Provide the fix with code\n4. Explain how to prevent this in the future',
            examples: '',
            constraints: 'Be thorough but concise. Include code examples for the fix.'
        }
    }
];

// Intent detection patterns for smart suggestions
export const INTENT_PATTERNS = {
    codeGeneration: {
        patterns: ['write code', 'create a function', 'implement', 'build a', 'develop', 'code for'],
        category: 'Coding',
        suggestions: [
            'Specify the programming language',
            'Include error handling requirements',
            'Mention testing expectations',
            'Define input/output types'
        ]
    },
    codeReview: {
        patterns: ['review', 'check this code', 'find bugs', 'optimize', 'improve this code'],
        category: 'Coding',
        suggestions: [
            'Specify what aspects to focus on (performance, security, readability)',
            'Mention the codebase context',
            'Include coding standards to follow'
        ]
    },
    contentWriting: {
        patterns: ['write', 'blog', 'article', 'copy', 'email', 'content', 'post'],
        category: 'Writing',
        suggestions: [
            'Define the target audience',
            'Specify the desired tone',
            'Include word count or length requirements',
            'Mention SEO keywords if relevant'
        ]
    },
    imageGeneration: {
        patterns: ['image', 'picture', 'illustration', 'art', 'visual', 'generate', 'draw', 'create an image'],
        category: 'Images',
        suggestions: [
            'Specify the art style (photorealistic, cartoon, oil painting)',
            'Include lighting and mood',
            'Add camera angle or perspective',
            'Mention aspect ratio'
        ]
    },
    explanation: {
        patterns: ['explain', 'what is', 'how does', 'teach me', 'help me understand', 'describe'],
        category: 'Writing',
        suggestions: [
            'Specify your current knowledge level',
            'Ask for examples or analogies',
            'Request step-by-step breakdown'
        ]
    },
    analysis: {
        patterns: ['analyze', 'compare', 'evaluate', 'assess', 'breakdown', 'critique'],
        category: 'Writing',
        suggestions: [
            'Define the criteria for analysis',
            'Specify what conclusions you need',
            'Request a structured format'
        ]
    }
};

// Detect intent from text
export function detectIntent(text) {
    if (!text) return [];

    const lowerText = text.toLowerCase();
    const matches = [];

    for (const [intentType, config] of Object.entries(INTENT_PATTERNS)) {
        let matchCount = 0;
        for (const pattern of config.patterns) {
            if (lowerText.includes(pattern)) {
                matchCount++;
            }
        }
        if (matchCount > 0) {
            matches.push({
                type: intentType,
                category: config.category,
                suggestions: config.suggestions,
                confidence: matchCount / config.patterns.length
            });
        }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
}

// Assess prompt quality
export function assessPromptQuality(sections) {
    const scores = {
        role: sections.role?.length > 20 ? 15 : sections.role?.length > 0 ? 8 : 0,
        task: sections.task?.length > 30 ? 30 : sections.task?.length > 10 ? 15 : 0,
        context: sections.context?.length > 20 ? 15 : sections.context?.length > 0 ? 8 : 0,
        format: sections.format?.length > 10 ? 15 : sections.format?.length > 0 ? 8 : 0,
        examples: sections.examples?.length > 20 ? 15 : 0,
        constraints: sections.constraints?.length > 10 ? 10 : 0
    };

    const total = Object.values(scores).reduce((sum, s) => sum + s, 0);

    return {
        score: total,
        level: total >= 80 ? 'excellent' : total >= 60 ? 'good' : total >= 40 ? 'basic' : 'minimal',
        suggestions: generateImprovementSuggestions(sections, scores)
    };
}

function generateImprovementSuggestions(sections, scores) {
    const suggestions = [];

    if (scores.task < 15) {
        suggestions.push('Be more specific about what you want the AI to do');
    }
    if (scores.role === 0) {
        suggestions.push('Add a role definition to get more focused responses');
    }
    if (scores.format === 0) {
        suggestions.push('Specify an output format for better structured responses');
    }
    if (scores.context < 8) {
        suggestions.push('Add more context to help the AI understand your needs');
    }
    if (scores.constraints === 0 && sections.task?.length > 20) {
        suggestions.push('Consider adding constraints to refine the output');
    }

    return suggestions;
}

// Compile sections into final prompt
export function compilePrompt(sections) {
    const parts = [];

    if (sections.role?.trim()) parts.push(sections.role.trim());
    if (sections.task?.trim()) parts.push(sections.task.trim());
    if (sections.context?.trim()) parts.push(sections.context.trim());
    if (sections.format?.trim()) parts.push(sections.format.trim());
    if (sections.examples?.trim()) parts.push(sections.examples.trim());
    if (sections.constraints?.trim()) parts.push(sections.constraints.trim());

    return parts.join('\n\n');
}
