-- Dataflare D1 schema, v1.
--
-- D1 always holds Dataflare's mutable state (projects, persons, identities, flags,
-- experiments, replay index). In the default "d1" store it also holds events;
-- in "lake" mode events live in Iceberg tables with the same columns.
--
-- Never edit a migration that has shipped. Add a new numbered file instead;
-- `dataflare upgrade` applies pending migrations with `wrangler d1 migrations apply`.

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  -- JSON array of allowed origins for browser ingest; NULL or [] allows any origin.
  allowed_origins TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT NOT NULL,
  project TEXT NOT NULL,
  event TEXT NOT NULL,
  ts_ms INTEGER NOT NULL,
  distinct_id TEXT NOT NULL,
  user_id TEXT,
  person_id TEXT NOT NULL,
  session_id TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  host TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  referrer_host TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_term TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL DEFAULT '',
  os TEXT NOT NULL DEFAULT '',
  flags TEXT NOT NULL DEFAULT '{}',
  props TEXT NOT NULL DEFAULT '{}',
  person_props TEXT NOT NULL DEFAULT '{}',
  lib TEXT NOT NULL DEFAULT '',
  received_ms INTEGER NOT NULL,
  PRIMARY KEY (project, id)
);

CREATE INDEX IF NOT EXISTS events_by_time ON events (project, ts_ms);
CREATE INDEX IF NOT EXISTS events_by_name ON events (project, event, ts_ms);
CREATE INDEX IF NOT EXISTS events_by_person ON events (project, person_id, ts_ms);
CREATE INDEX IF NOT EXISTS events_by_session ON events (project, session_id);

-- distinct_id (device) -> person_id (your user id), written by identify().
-- The first link wins, so a shared device never moves old events to a new user.
CREATE TABLE IF NOT EXISTS identities (
  project TEXT NOT NULL,
  distinct_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (project, distinct_id)
);

CREATE TABLE IF NOT EXISTS persons (
  project TEXT NOT NULL,
  person_id TEXT NOT NULL,
  props TEXT NOT NULL DEFAULT '{}',
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  PRIMARY KEY (project, person_id)
);

CREATE INDEX IF NOT EXISTS persons_by_last_seen ON persons (project, last_seen);

CREATE TABLE IF NOT EXISTS flags (
  project TEXT NOT NULL,
  key TEXT NOT NULL,
  -- JSON FlagDefinition (see packages/core/src/flags.ts)
  definition TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (project, key)
);

CREATE TABLE IF NOT EXISTS experiments (
  project TEXT NOT NULL,
  key TEXT NOT NULL,
  flag_key TEXT NOT NULL,
  -- JSON: { goal, secondary?, hypothesis? }
  definition TEXT NOT NULL,
  -- draft | running | stopped | shipped
  status TEXT NOT NULL DEFAULT 'draft',
  started_at INTEGER,
  ended_at INTEGER,
  shipped_variant TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (project, key)
);

CREATE TABLE IF NOT EXISTS event_definitions (
  project TEXT NOT NULL,
  event TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT '',
  -- JSON object: property name -> description
  properties TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (project, event)
);

CREATE TABLE IF NOT EXISTS replays (
  project TEXT NOT NULL,
  session_id TEXT NOT NULL,
  distinct_id TEXT NOT NULL,
  user_id TEXT,
  started_at INTEGER NOT NULL,
  ended_at INTEGER NOT NULL,
  chunks INTEGER NOT NULL DEFAULT 0,
  bytes INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  start_url TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (project, session_id)
);

CREATE INDEX IF NOT EXISTS replays_by_time ON replays (project, started_at);
CREATE INDEX IF NOT EXISTS replays_by_person ON replays (project, distinct_id);
