import { query } from './db.js';
import 'dotenv/config';

const migrate = async () => {
    try {
        console.log('Adding attachment column to prompts table...');
        await query('ALTER TABLE prompts ADD COLUMN IF NOT EXISTS attachment JSONB');
        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
