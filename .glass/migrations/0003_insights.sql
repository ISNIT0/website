-- Saved insight analyses (trends / funnel / retention) shown on the Insights tab.
CREATE TABLE IF NOT EXISTS insights (
  project TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  -- trends | funnel | retention
  kind TEXT NOT NULL,
  -- JSON query spec without kind/project (series, steps, cohortEvent, …)
  spec TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (project, key)
);
