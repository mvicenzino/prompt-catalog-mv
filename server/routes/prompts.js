import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all prompts (public + user's own)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.auth ? req.auth.userId : null;

        if (userId) {
            // Check if user has any prompts
            const userPromptsCount = await query('SELECT count(*) FROM prompts WHERE user_id = $1', [userId]);
            console.log('User ID:', userId);
            console.log('User Prompts Count:', userPromptsCount.rows[0].count);

            if (parseInt(userPromptsCount.rows[0].count) === 0) {
                console.log('Auto-seeding for user...');
                // Auto-seed: Copy public templates to this user
                // We assume public templates have user_id IS NULL and is_public = true
                // Note: We need to make sure we are selecting from the same table correctly.
                const seedQuery = `
                    INSERT INTO prompts (user_id, title, content, category, source, tags, is_public, attachment, created_at)
                    SELECT $1, title, content, category, source, tags, false, attachment, NOW()
                    FROM prompts
                    WHERE user_id IS NULL AND is_public = true
                    RETURNING *
                `;
                const seedResult = await query(seedQuery, [userId]);
                console.log('Seeded prompts count:', seedResult.rowCount);
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

// Update prompt
router.put('/:id', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;
        const { title, content, category, source, tags, is_public, attachment } = req.body;

        // Check ownership
        const check = await query('SELECT * FROM prompts WHERE id = $1', [promptId]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Prompt not found' });

        if (check.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const text = `
            UPDATE prompts 
            SET title = $1, content = $2, category = $3, source = $4, tags = $5, is_public = $6, attachment = $7
            WHERE id = $8
            RETURNING *
        `;
        const values = [title, content, category, source, tags, is_public, attachment, promptId];
        const result = await query(text, values);

        const favCheck = await query('SELECT * FROM favorites WHERE user_id = $1 AND prompt_id = $2', [userId, promptId]);
        const isFavorite = favCheck.rows.length > 0;

        res.json({ ...result.rows[0], isFavorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
