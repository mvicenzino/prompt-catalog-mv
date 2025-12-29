-- Users table is no longer strictly needed for auth, but we can keep it if we want to sync Clerk users later.
-- For now, we will remove the foreign key constraint to allow any Clerk ID.

CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255), -- Clerk User ID
    share_id VARCHAR(12) UNIQUE, -- Short unique ID for sharing
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    source VARCHAR(100),
    tags TEXT[], -- Array of strings
    is_public BOOLEAN DEFAULT FALSE,
    attachment JSONB, -- File attachment
    versions JSONB DEFAULT '[]', -- Version history array
    stats JSONB DEFAULT '{"views": 0, "copies": 0, "aiLaunches": 0}', -- Usage stats
    forked_from INTEGER REFERENCES prompts(id) ON DELETE SET NULL, -- Parent prompt if forked
    fork_count INTEGER DEFAULT 0, -- Number of times this prompt has been forked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id VARCHAR(255), -- Clerk User ID
    prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, prompt_id)
);

CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Clerk User ID
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_prompts (
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, prompt_id)
);
