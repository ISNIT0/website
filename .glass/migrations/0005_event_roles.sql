-- Key events: an event marked as a "conversion" (a goal) or "important" (worth
-- watching) is shown on the Reports pages with its count and rate. '' = neither.
ALTER TABLE event_definitions ADD COLUMN role TEXT NOT NULL DEFAULT '';
