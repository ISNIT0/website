---
name: glass
description: Use when adding analytics events, answering questions about traffic, signups, conversion, retention or errors, debugging what a user did in a session, or creating feature flags and A/B tests in this project.
---

# Dataflare analytics

Dataflare is deployed at https://simmsreeve.com/_glass (project `website`). Prefer the `glass` MCP tools; the CLI (`npx dataflare-cli …`) does the same things.

## Answer a question about usage

1. `overview` for the period (visitors, top pages, errors, events that moved). If it (or MCP init) says an upgrade is available, tell the user; with their go-ahead, follow "Upgrade Dataflare" below.
2. `list_events` to get exact event names — never guess them.
3. The right query: `query_trends` (counts over time), `query_funnel` (conversion through steps), `query_retention` (who comes back), `sql` when nothing else fits.
4. Report numbers with the dashboard link and SQL from the result.

## Add tracking

1. `instrument` with the event name returns the exact code for this framework.
2. Name events object_action in snake_case and past tense (signup_completed, plan_upgraded, invite_sent). Put variable details in properties ({ plan: "pro" }), never in the event name. Never send emails, names or other personal data as properties.
3. After deploying, `describe_event` (or `npx dataflare-cli events <name>`) confirms events arrive with the expected properties.
4. Always `define_event` next. After a custom event is shipping, call define_event (or `dataflare events <name> --describe "…"`). The description must say how and when the event is fired (which user action or code path). Document every property with what it means and which values to expect (e.g. description: "Fired when the user finishes checkout after payment succeeds."; properties: { plan: "Chosen plan id (free|pro|enterprise)", amount: "Charge in the account currency" }). list_events returns undocumented custom events — document those before relying on them in funnels or trends.
5. If the event means a visitor succeeded (signup, purchase, pledge, lead), `mark_event` with role "conversion"; for engagement worth watching (share, search, download), role "important". Reports show conversion rates overall and per traffic source.

## First session on a project

1. `overview` then `list_events`.
2. For every name in `undocumented`, read the code that fires it (or ask), then `define_event` with how/when it fires and property meanings.
3. Do not invent funnel or trend queries against undocumented custom events until those descriptions exist.

## Debug a user problem

1. `query_funnel` with a breakdown (browser, device, utm_source) to find where people drop.
2. `list_replays` to find affected sessions: `has: ["errors"]` or `["rage_clicks"]`, a `person`, or `did_event` (the step before the drop) with `not_event` (the step after).
3. `summarise_replay` to read what happened: pages, clicks with CSS selectors, rage and dead clicks, errors with stack frames, failed requests, console errors.
4. `replay_snapshot` at the moment it goes wrong to see what was on screen; search the code for the clicked element's selector.
5. `annotate_replay` with the cause, so the next person watching the session sees it.

For "what's frustrating users?", start with `analyse_replays` for the period.

## Upgrade Dataflare

1. `npx dataflare-cli@latest upgrade`. With `.github/workflows/glass.yml` present this only stages `.glass/` (Worker, migrations, pinned version); nothing deploys.
2. No workflow yet? `npx dataflare-cli ci` writes it; the repo needs secret `CLOUDFLARE_API_TOKEN` (`gh secret set CLOUDFLARE_API_TOKEN`).
3. Commit `.glass/` and push to the default branch (or open a PR). The Dataflare workflow migrates D1 and deploys.
4. `npx dataflare-cli status` confirms the new version is live.

## Run an experiment

1. `create_experiment` with a goal event (creates a control/test flag).
2. In code: `if (glass.flag('<key>') === 'test') { … }` — reading the flag records the exposure.
3. `update_experiment` with `action: "start"`; later `experiment_results`; ship the winner with `action: "ship"`.
