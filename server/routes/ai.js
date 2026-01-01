import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { checkAIAccess } from '../middleware/subscription.js';

const router = express.Router();

// Lazy-initialize Claude client only when needed
let claudeClient = null;
function getClaude() {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    if (!claudeClient) {
        claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return claudeClient;
}

// Available categories and their descriptions for AI context
const CATEGORIES = {
    'Images': 'AI image generation prompts for Midjourney, DALL-E, Stable Diffusion, etc.',
    'Photos': 'Photography-related prompts, photo editing, camera settings, composition',
    'Apps': 'Application development, UI/UX, mobile apps, web apps, product design',
    'Coding': 'Programming, code generation, debugging, algorithms, technical documentation',
    'Writing': 'Creative writing, copywriting, blog posts, emails, storytelling, content creation'
};

// Categorize a prompt using AI
router.post('/categorize', authenticateToken, requireAuth, async (req, res) => {
    try {
        const { content, title } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Check if Claude API key is configured
        const claude = getClaude();
        if (!claude) {
            // Fallback to simple keyword-based categorization
            return res.json(fallbackCategorize(content, title));
        }

        const categoryList = Object.entries(CATEGORIES)
            .map(([name, desc]) => `- ${name}: ${desc}`)
            .join('\n');

        const prompt = `Analyze the following prompt/content and:
1. Choose the BEST matching category from this list:
${categoryList}

2. Suggest 3-5 relevant tags (single words or short phrases, no hashtags)

Content to analyze:
Title: ${title || 'Untitled'}
Content: ${content.substring(0, 1000)}

Respond in JSON format only:
{
  "category": "CategoryName",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.8
}`;

        const message = await claude.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            system: 'You are a prompt categorization assistant. Respond only with valid JSON. Be accurate and concise.'
        });

        const responseText = message.content[0].text.trim();

        // Parse the JSON response
        let result;
        try {
            // Handle potential markdown code blocks
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        } catch {
            console.error('Failed to parse AI response:', responseText);
            return res.json(fallbackCategorize(content, title));
        }

        // Validate the category
        if (!Object.keys(CATEGORIES).includes(result.category)) {
            result.category = 'Writing'; // Default fallback
        }

        // Ensure tags is an array and clean them
        if (!Array.isArray(result.tags)) {
            result.tags = [];
        }
        result.tags = result.tags
            .slice(0, 5)
            .map(tag => tag.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim())
            .filter(tag => tag.length > 0 && tag.length < 30);

        res.json({
            category: result.category,
            tags: result.tags,
            confidence: result.confidence || 0.5,
            source: 'ai'
        });

    } catch (err) {
        console.error('AI categorization error:', err);
        // Fallback on error
        res.json(fallbackCategorize(req.body.content, req.body.title));
    }
});

// Improve a prompt with better context and structure (Pro only)
router.post('/improve', authenticateToken, requireAuth, checkAIAccess, async (req, res) => {
    try {
        const { content, title } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const claude = getClaude();
        if (!claude) {
            return res.status(503).json({
                message: 'AI service not available',
                error: 'ANTHROPIC_NOT_CONFIGURED'
            });
        }

        const systemPrompt = `You are a prompt engineering expert. Your job is to improve AI prompts to be more effective, contextual, and produce better results.

When improving a prompt, follow these principles:

1. **Add Context Variables**: Use {{variable_name}} syntax for user-specific inputs like:
   - {{topic}}, {{subject}}, {{industry}}, {{audience}}
   - {{tone}} (professional, casual, formal)
   - {{length}} (brief, detailed, comprehensive)
   - {{context}} for background information
   - {{goal}} or {{objective}} for desired outcomes

2. **Structure the Prompt**: Use a clear format:
   - Role: Define who the AI should act as
   - Context: Background information needed
   - Task: Clear, specific instruction
   - Constraints: Limitations or requirements
   - Output Format: How the response should be structured

3. **Be Specific**: Replace vague instructions with concrete ones
   - Bad: "Write something good"
   - Good: "Write a {{length}} {{tone}} {{content_type}} about {{topic}} for {{audience}}"

4. **Add Quality Markers**: Include instructions for quality like:
   - "Be concise and actionable"
   - "Include specific examples"
   - "Avoid generic advice"
   - "Focus on practical implementation"

5. **Preserve Intent**: Keep the original purpose but enhance clarity

Return ONLY valid JSON with this exact structure:
{
  "improved": "the improved prompt text with {{variables}}",
  "improvements": ["list of 3-5 specific improvements made"],
  "variables": ["list of variable names added"]
}`;

        const userPrompt = `Improve this prompt to be more contextual and effective:

Title: ${title || 'Untitled'}
Original Prompt:
${content}

Make it more specific, add appropriate {{variables}} for customization, and structure it better. Keep the core intent but make it produce better AI responses.`;

        const message = await claude.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            messages: [
                { role: 'user', content: userPrompt }
            ],
            system: systemPrompt
        });

        const responseText = message.content[0].text.trim();

        // Parse the JSON response
        let result;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        } catch (parseErr) {
            console.error('Failed to parse AI improvement response:', responseText);
            return res.status(500).json({
                message: 'Failed to parse AI response',
                error: 'PARSE_ERROR'
            });
        }

        // Validate response structure
        if (!result.improved || typeof result.improved !== 'string') {
            return res.status(500).json({
                message: 'Invalid AI response structure',
                error: 'INVALID_RESPONSE'
            });
        }

        res.json({
            improved: result.improved,
            improvements: result.improvements || [],
            variables: result.variables || [],
            source: 'ai'
        });

    } catch (err) {
        console.error('AI improvement error:', err);
        res.status(500).json({
            message: 'Failed to improve prompt',
            error: err.message
        });
    }
});

// Simple keyword-based fallback categorization
function fallbackCategorize(content, title) {
    const text = ((content || '') + ' ' + (title || '')).toLowerCase();

    const patterns = {
        'Images': [
            'midjourney', 'dall-e', 'dalle', 'stable diffusion', 'image generation',
            'art style', 'render', '8k', '4k', 'photorealistic', 'digital art',
            'illustration', 'concept art', 'cinematic', 'ultra detailed'
        ],
        'Photos': [
            'photo', 'photograph', 'camera', 'lens', 'exposure', 'portrait',
            'landscape photo', 'lighting', 'f-stop', 'iso', 'shutter'
        ],
        'Coding': [
            'code', 'function', 'algorithm', 'javascript', 'python', 'typescript',
            'react', 'api', 'database', 'debug', 'programming', 'developer',
            'software', 'html', 'css', 'backend', 'frontend'
        ],
        'Apps': [
            'app', 'application', 'ui', 'ux', 'interface', 'design system',
            'mobile', 'prototype', 'wireframe', 'user experience', 'figma'
        ],
        'Writing': [
            'write', 'blog', 'article', 'story', 'email', 'copy', 'content',
            'creative', 'narrative', 'essay', 'marketing', 'headline'
        ]
    };

    let bestCategory = 'Writing';
    let maxScore = 0;
    const foundTags = [];

    for (const [category, keywords] of Object.entries(patterns)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                score++;
                if (foundTags.length < 5 && !foundTags.includes(keyword)) {
                    foundTags.push(keyword);
                }
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    return {
        category: bestCategory,
        tags: foundTags.slice(0, 5),
        confidence: Math.min(maxScore / 3, 1),
        source: 'fallback'
    };
}

// Batch improve prompts (Pro only)
router.post('/improve-batch', authenticateToken, requireAuth, checkAIAccess, async (req, res) => {
    try {
        const { prompts } = req.body; // Array of { id, content, title }

        if (!Array.isArray(prompts) || prompts.length === 0) {
            return res.status(400).json({ message: 'Prompts array is required' });
        }

        if (prompts.length > 10) {
            return res.status(400).json({ message: 'Maximum 10 prompts per batch' });
        }

        const claude = getClaude();
        if (!claude) {
            return res.status(503).json({
                message: 'AI service not available',
                error: 'ANTHROPIC_NOT_CONFIGURED'
            });
        }

        const results = [];

        for (const promptItem of prompts) {
            try {
                const systemPrompt = `You are a prompt engineering expert. Improve this AI prompt to be more effective and contextual.

Rules:
1. Add {{variable_name}} placeholders for customization (topic, audience, tone, context, goal, etc.)
2. Structure clearly: Role, Context, Task, Constraints, Output Format
3. Be specific rather than vague
4. Preserve the original intent
5. Keep it concise but effective

Return ONLY valid JSON:
{
  "improved": "the improved prompt with {{variables}}",
  "improvements": ["3-5 improvements made"],
  "variables": ["variable names added"]
}`;

                const message = await claude.messages.create({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1500,
                    messages: [
                        { role: 'user', content: `Title: ${promptItem.title}\nPrompt:\n${promptItem.content}` }
                    ],
                    system: systemPrompt
                });

                const responseText = message.content[0].text.trim();
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

                results.push({
                    id: promptItem.id,
                    success: true,
                    improved: result.improved,
                    improvements: result.improvements || [],
                    variables: result.variables || []
                });

            } catch (err) {
                results.push({
                    id: promptItem.id,
                    success: false,
                    error: err.message
                });
            }

            // Rate limiting between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.json({ results });

    } catch (err) {
        console.error('Batch improvement error:', err);
        res.status(500).json({ message: 'Batch improvement failed', error: err.message });
    }
});

export default router;
