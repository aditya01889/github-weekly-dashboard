-- Create weekly_snapshots table
CREATE TABLE weekly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_user_id TEXT NOT NULL,
  week_start DATE NOT NULL,
  repo_scope TEXT NOT NULL,
  metrics JSONB NOT NULL,
  verdict JSONB NOT NULL,
  targets JSONB NOT NULL,
  qualified BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicates
ALTER TABLE weekly_snapshots ADD CONSTRAINT weekly_snapshots_unique 
  UNIQUE (github_user_id, week_start, repo_scope);

-- Create indexes for performance
CREATE INDEX idx_weekly_snapshots_user_week ON weekly_snapshots(github_user_id, week_start DESC);
CREATE INDEX idx_weekly_snapshots_user_repo ON weekly_snapshots(github_user_id, repo_scope, week_start DESC);
