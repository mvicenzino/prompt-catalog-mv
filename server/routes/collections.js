import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all collections for user
router.get('/', authenticateToken, requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId;

        const result = await query(`
            SELECT c.*,
                   COALESCE(
                       (SELECT json_agg(cp.prompt_id) FROM collection_prompts cp WHERE cp.collection_id = c.id),
                       '[]'
                   ) as "promptIds"
            FROM collections c
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching collections:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a collection
router.post('/', authenticateToken, requireAuth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.auth.userId;

        const result = await query(`
            INSERT INTO collections (user_id, name, description)
            VALUES ($1, $2, $3)
            RETURNING *, '[]'::json as "promptIds"
        `, [userId, name, description || '']);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating collection:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a collection
router.put('/:id', authenticateToken, requireAuth, async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { name, description } = req.body;
        const userId = req.auth.userId;

        // Check ownership
        const check = await query('SELECT * FROM collections WHERE id = $1 AND user_id = $2', [collectionId, userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        const result = await query(`
            UPDATE collections
            SET name = $1, description = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `, [name, description, collectionId]);

        // Get prompt IDs
        const promptsResult = await query(
            'SELECT prompt_id FROM collection_prompts WHERE collection_id = $1',
            [collectionId]
        );

        res.json({
            ...result.rows[0],
            promptIds: promptsResult.rows.map(r => r.prompt_id)
        });
    } catch (err) {
        console.error('Error updating collection:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a collection
router.delete('/:id', authenticateToken, requireAuth, async (req, res) => {
    try {
        const collectionId = req.params.id;
        const userId = req.auth.userId;

        // Check ownership
        const check = await query('SELECT * FROM collections WHERE id = $1 AND user_id = $2', [collectionId, userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        await query('DELETE FROM collections WHERE id = $1', [collectionId]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error('Error deleting collection:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add prompt to collection
router.post('/:id/prompts', authenticateToken, requireAuth, async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { promptId } = req.body;
        const userId = req.auth.userId;

        // Check collection ownership
        const check = await query('SELECT * FROM collections WHERE id = $1 AND user_id = $2', [collectionId, userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Check if already exists
        const existing = await query(
            'SELECT * FROM collection_prompts WHERE collection_id = $1 AND prompt_id = $2',
            [collectionId, promptId]
        );

        if (existing.rows.length === 0) {
            await query(
                'INSERT INTO collection_prompts (collection_id, prompt_id) VALUES ($1, $2)',
                [collectionId, promptId]
            );
        }

        // Return updated prompt IDs
        const promptsResult = await query(
            'SELECT prompt_id FROM collection_prompts WHERE collection_id = $1',
            [collectionId]
        );

        res.json({ promptIds: promptsResult.rows.map(r => r.prompt_id) });
    } catch (err) {
        console.error('Error adding prompt to collection:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove prompt from collection
router.delete('/:id/prompts/:promptId', authenticateToken, requireAuth, async (req, res) => {
    try {
        const collectionId = req.params.id;
        const promptId = req.params.promptId;
        const userId = req.auth.userId;

        // Check collection ownership
        const check = await query('SELECT * FROM collections WHERE id = $1 AND user_id = $2', [collectionId, userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        await query(
            'DELETE FROM collection_prompts WHERE collection_id = $1 AND prompt_id = $2',
            [collectionId, promptId]
        );

        // Return updated prompt IDs
        const promptsResult = await query(
            'SELECT prompt_id FROM collection_prompts WHERE collection_id = $1',
            [collectionId]
        );

        res.json({ promptIds: promptsResult.rows.map(r => r.prompt_id) });
    } catch (err) {
        console.error('Error removing prompt from collection:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
