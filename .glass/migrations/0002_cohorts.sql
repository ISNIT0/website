-- Saved person cohorts: reusable filters for the People tab and insights.
CREATE TABLE IF NOT EXISTS cohorts (
  project TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  -- JSON: { "filters": Filter[], "didEvent"?: string, "from"?: string }
  definition TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (project, key)
);
