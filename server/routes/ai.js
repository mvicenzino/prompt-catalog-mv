import express from 'express';
import OpenAI from 'openai';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Lazy-initialize OpenAI client only when needed
let openaiClient = null;
function getOpenAI() {
    if (!process.env.OPENAI_API_KEY) return null;
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
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

        // Check if OpenAI API key is configured
        const openai = getOpenAI();
        if (!openai) {
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

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a prompt categorization assistant. Respond only with valid JSON. Be accurate and concise.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 150,
            temperature: 0.3
        });

        const responseText = completion.choices[0].message.content.trim();

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

export default router;
