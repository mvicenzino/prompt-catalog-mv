-- Users table is no longer strictly needed for auth, but we can keep it if we want to sync Clerk users later.
-- For now, we will remove the foreign key constraint to allow any Clerk ID.

CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255), -- Clerk User ID
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    source VARCHAR(100),
    tags TEXT[], -- Array of strings
    is_public BOOLEAN DEFAULT FALSE,
    attachment JSONB, -- File attachment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id VARCHAR(255), -- Clerk User ID
    prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, prompt_id)
);
