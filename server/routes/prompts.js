import express from 'express';
import crypto from 'crypto';
import { query } from '../db.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate a short unique ID for sharing
const generateShareId = () => crypto.randomBytes(6).toString('base64url');

// Admin check helper
const isAdmin = (userId) => {
    const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
    return adminIds.includes(userId);
};

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
                       CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END as "isFavorite",
                       v.vote_type as "userVote"
                FROM prompts p
                LEFT JOIN favorites f ON p.id = f.prompt_id AND f.user_id = $1
                LEFT JOIN votes v ON p.id = v.prompt_id AND v.user_id = $1
                WHERE p.user_id = $1 OR p.user_id IS NULL
                ORDER BY p.created_at DESC
            `;
            params = [userId];
        } else {
            // Unauthenticated: Show public templates
            text = `
                SELECT p.*, false as "isFavorite", NULL as "userVote"
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

        // Check if prompt exists
        const check = await query('SELECT * FROM prompts WHERE id = $1', [promptId]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Prompt not found' });

        // Admins can delete any prompt, others can only delete their own
        const userIsAdmin = isAdmin(userId);
        const isOwner = check.rows[0].user_id === userId;

        if (!userIsAdmin && !isOwner) {
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

// Fork a prompt (create a copy with reference to original)
router.post('/:id/fork', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;

        // Get the original prompt (can fork any prompt you can view - your own or shared)
        const original = await query(
            `SELECT * FROM prompts WHERE id = $1 AND (user_id = $2 OR share_id IS NOT NULL)`,
            [promptId, userId]
        );

        if (original.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        const p = original.rows[0];

        // Create the forked prompt
        const forkResult = await query(
            `INSERT INTO prompts (user_id, title, content, category, source, tags, forked_from)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [userId, `${p.title} (Fork)`, p.content, p.category, p.source, p.tags, promptId]
        );

        // Increment fork count on original
        await query(
            'UPDATE prompts SET fork_count = COALESCE(fork_count, 0) + 1 WHERE id = $1',
            [promptId]
        );

        res.json({ ...forkResult.rows[0], isFavorite: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get fork parent info (for displaying lineage)
router.get('/:id/parent', authenticateToken, async (req, res) => {
    try {
        const promptId = req.params.id;

        const result = await query(
            `SELECT p.forked_from, parent.title as parent_title, parent.share_id as parent_share_id
             FROM prompts p
             LEFT JOIN prompts parent ON p.forked_from = parent.id
             WHERE p.id = $1`,
            [promptId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        const { forked_from, parent_title, parent_share_id } = result.rows[0];

        if (!forked_from) {
            return res.json({ forkedFrom: null });
        }

        res.json({
            forkedFrom: {
                id: forked_from,
                title: parent_title,
                shareId: parent_share_id
            }
        });
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

// Vote on a prompt (upvote or downvote)
router.post('/:id/vote', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;
        const { voteType } = req.body; // 'up', 'down', or 'none' (to remove vote)

        if (!['up', 'down', 'none'].includes(voteType)) {
            return res.status(400).json({ message: 'Invalid vote type' });
        }

        // Check if prompt exists
        const promptCheck = await query('SELECT id, upvotes, downvotes FROM prompts WHERE id = $1', [promptId]);
        if (promptCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        // Get existing vote
        const existingVote = await query(
            'SELECT vote_type FROM votes WHERE prompt_id = $1 AND user_id = $2',
            [promptId, userId]
        );

        const hadVote = existingVote.rows.length > 0;
        const previousVote = hadVote ? existingVote.rows[0].vote_type : null;

        // Remove vote
        if (voteType === 'none') {
            if (hadVote) {
                await query('DELETE FROM votes WHERE prompt_id = $1 AND user_id = $2', [promptId, userId]);
                // Decrement the appropriate counter
                if (previousVote === 'up') {
                    await query('UPDATE prompts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1', [promptId]);
                } else if (previousVote === 'down') {
                    await query('UPDATE prompts SET downvotes = GREATEST(0, downvotes - 1) WHERE id = $1', [promptId]);
                }
            }
        } else {
            // Add or change vote
            if (hadVote) {
                // Update existing vote
                if (previousVote !== voteType) {
                    await query(
                        'UPDATE votes SET vote_type = $1, created_at = NOW() WHERE prompt_id = $2 AND user_id = $3',
                        [voteType, promptId, userId]
                    );
                    // Update counters
                    if (previousVote === 'up') {
                        await query('UPDATE prompts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1', [promptId]);
                    } else {
                        await query('UPDATE prompts SET downvotes = GREATEST(0, downvotes - 1) WHERE id = $1', [promptId]);
                    }
                    if (voteType === 'up') {
                        await query('UPDATE prompts SET upvotes = upvotes + 1 WHERE id = $1', [promptId]);
                    } else {
                        await query('UPDATE prompts SET downvotes = downvotes + 1 WHERE id = $1', [promptId]);
                    }
                }
            } else {
                // Insert new vote
                await query(
                    'INSERT INTO votes (prompt_id, user_id, vote_type) VALUES ($1, $2, $3)',
                    [promptId, userId, voteType]
                );
                // Increment counter
                if (voteType === 'up') {
                    await query('UPDATE prompts SET upvotes = upvotes + 1 WHERE id = $1', [promptId]);
                } else {
                    await query('UPDATE prompts SET downvotes = downvotes + 1 WHERE id = $1', [promptId]);
                }
            }
        }

        // Get updated counts and user's vote
        const updated = await query('SELECT upvotes, downvotes FROM prompts WHERE id = $1', [promptId]);
        const userVote = await query('SELECT vote_type FROM votes WHERE prompt_id = $1 AND user_id = $2', [promptId, userId]);

        res.json({
            upvotes: updated.rows[0].upvotes,
            downvotes: updated.rows[0].downvotes,
            userVote: userVote.rows.length > 0 ? userVote.rows[0].vote_type : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's vote for a prompt
router.get('/:id/vote', authenticateToken, requireAuth, async (req, res) => {
    try {
        const promptId = req.params.id;
        const userId = req.auth.userId;

        const vote = await query(
            'SELECT vote_type FROM votes WHERE prompt_id = $1 AND user_id = $2',
            [promptId, userId]
        );

        res.json({
            userVote: vote.rows.length > 0 ? vote.rows[0].vote_type : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= ADMIN ENDPOINTS =============

// Get all default/template prompts (admin only)
router.get('/admin/templates', authenticateToken, requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId;

        if (!isAdmin(userId)) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const result = await query(
            `SELECT id, title, content, category, source, tags, is_public, created_at
             FROM prompts
             WHERE user_id IS NULL
             ORDER BY created_at DESC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a default/template prompt (admin only)
router.delete('/admin/:id', authenticateToken, requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const promptId = req.params.id;

        if (!isAdmin(userId)) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Verify this is a template prompt (user_id IS NULL)
        const check = await query('SELECT * FROM prompts WHERE id = $1', [promptId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        if (check.rows[0].user_id !== null) {
            return res.status(400).json({ message: 'Can only delete template prompts (user_id must be NULL)' });
        }

        await query('DELETE FROM prompts WHERE id = $1', [promptId]);
        res.json({ message: 'Template prompt deleted successfully', id: promptId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Bulk delete default/template prompts (admin only)
router.post('/admin/bulk-delete', authenticateToken, requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { ids } = req.body;

        if (!isAdmin(userId)) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Must provide array of prompt IDs' });
        }

        // Delete only template prompts (user_id IS NULL)
        const result = await query(
            `DELETE FROM prompts WHERE id = ANY($1) AND user_id IS NULL RETURNING id`,
            [ids]
        );

        res.json({
            message: `Deleted ${result.rows.length} template prompts`,
            deletedIds: result.rows.map(r => r.id)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
