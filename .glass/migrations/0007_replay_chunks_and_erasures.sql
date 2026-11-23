-- One row per replay chunk counted into the session index. The SDK retries an
-- upload whose response was lost, so the same chunk can arrive twice; the index
-- only adds a chunk's counts when its row here is new. chunk is the object key's
-- last part (`<start>-<page>-<seq>`), which a retry repeats exactly.
CREATE TABLE IF NOT EXISTS replay_chunks (
  project TEXT NOT NULL,
  session_id TEXT NOT NULL,
  chunk TEXT NOT NULL,
  PRIMARY KEY (project, session_id, chunk)
);

-- Erasures that one request could not finish. Erasing a person removes their
-- replays a slice at a time (each session is several R2 calls, and an invocation
-- has a budget); the hourly job carries on from here until nothing matches, then
-- deletes the person and identity rows and this one. ids is a JSON array of the
-- person and device ids at the time of the request.
CREATE TABLE IF NOT EXISTS erasures (
  project TEXT NOT NULL,
  person_id TEXT NOT NULL,
  ids TEXT NOT NULL,
  requested_at INTEGER NOT NULL,
  PRIMARY KEY (project, person_id)
);
