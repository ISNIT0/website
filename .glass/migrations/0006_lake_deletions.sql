-- Lake mode can't delete from the Worker (Basin SQL is read-only), so erasing a
-- person queues their ids here. The lake maintenance job (`dataflare lake maintain`,
-- run daily by the deploy workflow) deletes their rows from the Iceberg tables and
-- sets done_at. ids is a JSON array of person and device ids.
CREATE TABLE IF NOT EXISTS lake_deletions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project TEXT NOT NULL,
  ids TEXT NOT NULL,
  requested_at INTEGER NOT NULL,
  done_at INTEGER
);
CREATE INDEX IF NOT EXISTS lake_deletions_pending ON lake_deletions (done_at);
