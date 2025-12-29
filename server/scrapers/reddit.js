import fetch from 'node-fetch';
import pool from '../db.js';

// Subreddits to scrape for AI prompts
const SUBREDDITS = [
    'ChatGPT',
    'PromptEngineering',
    'midjourney',
    'StableDiffusion',
    'ClaudeAI',
    'LocalLLaMA',
    'ChatGPTPromptGenius'
];

// Keywords that indicate a post contains a prompt
const PROMPT_KEYWORDS = [
    'prompt:', 'here\'s my prompt', 'try this prompt', 'prompt i use',
    'system prompt', 'prompt template', 'prompt engineering',
    '[prompt]', 'prompt for', 'prompt that', 'my go-to prompt',
    'share this prompt', 'sharing my prompt', 'effective prompt'
];

// Category mapping based on subreddit
const SUBREDDIT_CATEGORIES = {
    'midjourney': 'Images',
    'StableDiffusion': 'Images',
    'ChatGPT': 'Writing',
    'ClaudeAI': 'Writing',
    'PromptEngineering': 'Writing',
    'LocalLLaMA': 'Coding',
    'ChatGPTPromptGenius': 'Writing'
};

// Extract prompt from post content
function extractPrompt(text) {
    if (!text) return null;

    // Look for text in quotes or code blocks
    const codeBlockMatch = text.match(/```([\s\S]*?)```/);
    if (codeBlockMatch) return codeBlockMatch[1].trim();

    const quoteMatch = text.match(/"([^"]{50,})"/);
    if (quoteMatch) return quoteMatch[1].trim();

    // Look for prompt after common prefixes
    const promptPrefixMatch = text.match(/(?:prompt:|here'?s? (?:the|my) prompt:?)\s*([\s\S]{50,})/i);
    if (promptPrefixMatch) return promptPrefixMatch[1].trim().split('\n\n')[0];

    // If post is short enough and contains keywords, use the whole thing
    if (text.length < 2000 && text.length > 50) {
        const hasKeyword = PROMPT_KEYWORDS.some(kw => text.toLowerCase().includes(kw));
        if (hasKeyword) return text.trim();
    }

    return null;
}

// Check if content looks like a prompt
function looksLikePrompt(text) {
    if (!text || text.length < 30) return false;

    const lowerText = text.toLowerCase();

    // Must contain some prompt-like patterns
    const hasPromptPattern =
        lowerText.includes('you are') ||
        lowerText.includes('act as') ||
        lowerText.includes('pretend') ||
        lowerText.includes('generate') ||
        lowerText.includes('create') ||
        lowerText.includes('write') ||
        lowerText.includes('help me') ||
        lowerText.includes('i want you to') ||
        /\[.*\]/.test(text); // Has variables like [topic]

    return hasPromptPattern;
}

// Generate tags from content
function generateTags(text, subreddit) {
    const tags = [];
    const lowerText = text.toLowerCase();

    // Add subreddit-based tag
    if (subreddit.toLowerCase().includes('midjourney')) tags.push('midjourney');
    if (subreddit.toLowerCase().includes('stable')) tags.push('stable-diffusion');
    if (subreddit.toLowerCase().includes('chatgpt')) tags.push('chatgpt');
    if (subreddit.toLowerCase().includes('claude')) tags.push('claude');

    // Content-based tags
    if (lowerText.includes('code') || lowerText.includes('programming')) tags.push('coding');
    if (lowerText.includes('image') || lowerText.includes('art')) tags.push('image-generation');
    if (lowerText.includes('write') || lowerText.includes('story')) tags.push('writing');
    if (lowerText.includes('business') || lowerText.includes('marketing')) tags.push('business');
    if (lowerText.includes('roleplay') || lowerText.includes('character')) tags.push('roleplay');
    if (lowerText.includes('summarize') || lowerText.includes('summary')) tags.push('summarization');

    return [...new Set(tags)].slice(0, 5);
}

// Fetch posts from a subreddit
async function fetchSubredditPosts(subreddit, limit = 25) {
    try {
        const response = await fetch(
            `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
            {
                headers: {
                    'User-Agent': 'PromptPal/1.0 (Prompt Collection Bot)'
                }
            }
        );

        if (!response.ok) {
            console.error(`Failed to fetch r/${subreddit}: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.data.children.map(child => child.data);
    } catch (err) {
        console.error(`Error fetching r/${subreddit}:`, err.message);
        return [];
    }
}

// Check if prompt already exists (by content hash)
async function promptExists(content) {
    const result = await pool.query(
        'SELECT id FROM prompts WHERE content = $1 OR title = $2',
        [content, content.substring(0, 100)]
    );
    return result.rows.length > 0;
}

// Save prompt to database
async function savePrompt(prompt) {
    try {
        const result = await pool.query(
            `INSERT INTO prompts (title, content, category, source, tags, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING id`,
            [prompt.title, prompt.content, prompt.category, prompt.source, prompt.tags]
        );
        return result.rows[0].id;
    } catch (err) {
        console.error('Error saving prompt:', err.message);
        return null;
    }
}

// Main scrape function
export async function scrapeReddit() {
    console.log('Starting Reddit scrape...');
    const results = { scraped: 0, saved: 0, skipped: 0, errors: 0 };

    for (const subreddit of SUBREDDITS) {
        console.log(`Scraping r/${subreddit}...`);

        // Rate limiting - wait between subreddits
        await new Promise(resolve => setTimeout(resolve, 2000));

        const posts = await fetchSubredditPosts(subreddit);
        results.scraped += posts.length;

        for (const post of posts) {
            try {
                // Skip if no selftext (link-only posts)
                if (!post.selftext && !post.title) continue;

                const content = post.selftext || '';
                const title = post.title || '';

                // Try to extract a prompt
                let promptContent = extractPrompt(content);

                // If no prompt found in content, check if title is a prompt
                if (!promptContent && looksLikePrompt(title)) {
                    promptContent = title;
                }

                if (!promptContent || !looksLikePrompt(promptContent)) {
                    results.skipped++;
                    continue;
                }

                // Check for duplicates
                if (await promptExists(promptContent)) {
                    results.skipped++;
                    continue;
                }

                // Create prompt object
                const prompt = {
                    title: title.length > 100 ? title.substring(0, 97) + '...' : title,
                    content: promptContent.substring(0, 5000), // Limit content length
                    category: SUBREDDIT_CATEGORIES[subreddit] || 'Writing',
                    source: `Reddit`,
                    tags: generateTags(promptContent, subreddit)
                };

                const savedId = await savePrompt(prompt);
                if (savedId) {
                    results.saved++;
                    console.log(`  Saved: "${prompt.title.substring(0, 50)}..."`);
                } else {
                    results.errors++;
                }

            } catch (err) {
                console.error(`  Error processing post:`, err.message);
                results.errors++;
            }
        }
    }

    console.log('Reddit scrape complete:', results);
    return results;
}

// Run if called directly
if (process.argv[1].includes('reddit.js')) {
    scrapeReddit()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
