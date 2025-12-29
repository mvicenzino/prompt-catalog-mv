import express from 'express';
import crypto from 'crypto';
import { query } from '../db.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate a short unique ID for sharing
const generateShareId = () => crypto.randomBytes(6).toString('base64url');

// Get all prompts (public + user's own)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.auth ? req.auth.userId : null;

        if (userId) {
            // Check if user has any prompts
            const userPromptsCount = await query('SELECT count(*) FROM prompts WHERE user_id = $1', [userId]);

            if (parseInt(userPromptsCount.rows[0].count) === 0) {
                // Auto-seed: Copy public templates to this user
                const seedQuery = `
                    INSERT INTO prompts (user_id, title, content, category, source, tags, is_public, attachment, created_at)
                    SELECT $1, title, content, category, source, tags, false, attachment, NOW()
                    FROM prompts
                    WHERE user_id IS NULL AND is_public = true
                    RETURNING *
                `;
                await query(seedQuery, [userId]);
            }
        }

        let text;
        let params = [];

        if (userId) {
            // Return user's own prompts (which now include the seeded ones)
            // AND public templates? 
            // If we copied them, we don't need to show the templates anymore, 
            // otherwise they see duplicates (their copy + original template).
            // So we ONLY show prompts where user_id = $1 OR (user_id IS NULL AND is_public = true AND NOT EXISTS (SELECT 1 FROM prompts p2 WHERE p2.user_id = $1 AND p2.title = prompts.title))?
            // Simpler: Just show user's prompts. If they deleted a seeded prompt, it's gone for them.
            // But what about NEW public templates added later?
            // For now, let's stick to: User sees THEIR prompts.
            // But wait, if they just signed up, they have a copy.
            // If they are not signed in, they see public templates.

            text = `
                SELECT p.*, 
                       CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END as "isFavorite"
                FROM prompts p
                LEFT JOIN favorites f ON p.id = f.prompt_id AND f.user_id = $1
                WHERE p.user_id = $1
                ORDER BY p.created_at DESC
            `;
            params = [userId];
        } else {
            // Unauthenticated: Show public templates
            text = `
                SELECT p.*, false as "isFavorite"
                FROM prompts p
                WHERE p.user_id IS NULL AND p.is_public = true
                ORDER BY p.created_at DESC
            `;
        }

        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a prompt
router.post('/', authenticateToken, requireAuth, async (req, res) => {
    try {
        const { title, content, category, source, tags, is_public, attachment } = req.body;
        const userId = req.auth.userId;

        const text = `
            INSERT INTO prompts (user_id, title, content, category, source, tags, is_public, attachment)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [userId, title, content, category, source, tags, is_public || false, attachment];
        const result = await query(text, values);

        // Return the new prompt with isFavorite = false (default)
        res.json({ ...result.rows[0], isFavorite: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle favorite
router.post('/:id/favorite', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;

        // Check if already favorite
        const check = await query('SELECT * FROM favorites WHERE user_id = $1 AND prompt_id = $2', [userId, promptId]);

        if (check.rows.length > 0) {
            // Remove favorite
            await query('DELETE FROM favorites WHERE user_id = $1 AND prompt_id = $2', [userId, promptId]);
            res.json({ isFavorite: false });
        } else {
            // Add favorite
            await query('INSERT INTO favorites (user_id, prompt_id) VALUES ($1, $2)', [userId, promptId]);
            res.json({ isFavorite: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete prompt
router.delete('/:id', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;

        // Check ownership
        const check = await query('SELECT * FROM prompts WHERE id = $1', [promptId]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Prompt not found' });

        if (check.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await query('DELETE FROM prompts WHERE id = $1', [promptId]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update prompt (with version history)
router.put('/:id', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;
        const { title, content, category, source, tags, is_public, attachment } = req.body;

        // Check ownership and get current data
        const check = await query('SELECT * FROM prompts WHERE id = $1', [promptId]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Prompt not found' });

        const currentPrompt = check.rows[0];
        if (currentPrompt.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Create version snapshot (exclude versions array and large attachment data)
        const versionSnapshot = {
            title: currentPrompt.title,
            content: currentPrompt.content,
            category: currentPrompt.category,
            source: currentPrompt.source,
            tags: currentPrompt.tags,
            savedAt: new Date().toISOString()
        };

        // Get existing versions or initialize empty array
        const existingVersions = currentPrompt.versions || [];
        // Keep last 10 versions to prevent unbounded growth
        const updatedVersions = [...existingVersions, versionSnapshot].slice(-10);

        const text = `
            UPDATE prompts
            SET title = $1, content = $2, category = $3, source = $4, tags = $5,
                is_public = $6, attachment = $7, versions = $8, updated_at = NOW()
            WHERE id = $9
            RETURNING *
        `;
        const values = [title, content, category, source, tags, is_public, attachment, JSON.stringify(updatedVersions), promptId];
        const result = await query(text, values);

        const favCheck = await query('SELECT * FROM favorites WHERE user_id = $1 AND prompt_id = $2', [userId, promptId]);
        const isFavorite = favCheck.rows.length > 0;

        res.json({ ...result.rows[0], isFavorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get version history for a prompt
router.get('/:id/versions', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;

        const result = await query('SELECT versions FROM prompts WHERE id = $1 AND user_id = $2', [promptId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        res.json(result.rows[0].versions || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate or get share link for a prompt
router.post('/:id/share', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;

        // Check ownership
        const check = await query('SELECT share_id FROM prompts WHERE id = $1 AND user_id = $2', [promptId, userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        let shareId = check.rows[0].share_id;

        // Generate new share_id if not exists
        if (!shareId) {
            shareId = generateShareId();
            await query('UPDATE prompts SET share_id = $1 WHERE id = $2', [shareId, promptId]);
        }

        res.json({ shareId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Track usage stats (views, copies, AI launches)
router.post('/:id/stats', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;
        const { event } = req.body; // 'view', 'copy', or 'aiLaunch'

        if (!['view', 'copy', 'aiLaunch'].includes(event)) {
            return res.status(400).json({ message: 'Invalid event type' });
        }

        // Check ownership
        const check = await query('SELECT stats FROM prompts WHERE id = $1 AND user_id = $2', [promptId, userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        const currentStats = check.rows[0].stats || { views: 0, copies: 0, aiLaunches: 0 };
        const statKey = event === 'view' ? 'views' : event === 'copy' ? 'copies' : 'aiLaunches';
        currentStats[statKey] = (currentStats[statKey] || 0) + 1;

        await query('UPDATE prompts SET stats = $1 WHERE id = $2', [JSON.stringify(currentStats), promptId]);

        res.json({ stats: currentStats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get shared prompt (public, no auth required)
router.get('/shared/:shareId', async (req, res) => {
    try {
        const { shareId } = req.params;

        const result = await query(
            'SELECT id, title, content, category, source, tags, created_at FROM prompts WHERE share_id = $1',
            [shareId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shared prompt not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
