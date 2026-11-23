-- Session replay: frustration counts for filtering and sorting, cached summaries, and notes.

-- Page loads in the session (counted from each page's first chunk).
ALTER TABLE replays ADD COLUMN pages INTEGER NOT NULL DEFAULT 0;
ALTER TABLE replays ADD COLUMN rage_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE replays ADD COLUMN console_errors INTEGER NOT NULL DEFAULT 0;
ALTER TABLE replays ADD COLUMN failed_requests INTEGER NOT NULL DEFAULT 0;
-- Known once the session is summarised.
ALTER TABLE replays ADD COLUMN dead_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE replays ADD COLUMN active_ms INTEGER;
-- Searchable text from the summary: pages visited, elements clicked, errors.
ALTER TABLE replays ADD COLUMN digest TEXT NOT NULL DEFAULT '';
-- How many chunks the cached summary covers; NULL until summarised. A new chunk makes it stale.
ALTER TABLE replays ADD COLUMN summary_chunks INTEGER;

CREATE INDEX IF NOT EXISTS replays_by_end ON replays (project, ended_at);

-- Notes people and agents leave at a moment of a session.
CREATE TABLE IF NOT EXISTS replay_notes (
  project TEXT NOT NULL,
  session_id TEXT NOT NULL,
  id TEXT NOT NULL,
  -- Epoch ms of the moment the note is about.
  ts_ms INTEGER NOT NULL,
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  PRIMARY KEY (project, session_id, id)
);
