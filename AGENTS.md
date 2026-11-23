<!-- glass:start -->
## Analytics (Dataflare)

This project uses Dataflare for analytics, session replay, feature flags and A/B tests. It runs in our own Cloudflare account; deployment config is in `.glass/`.

- Dashboard: https://simmsreeve.com/_glass/app (print the key with `npx dataflare-cli key`)
- MCP server `glass` is configured in `.mcp.json`. Start with the `overview` tool, then `list_events` for exact event names.
- Terminal: `npx dataflare-cli query web --from -7d`, `npx dataflare-cli sql "SELECT …"`, `npx dataflare-cli --help`

Tracking (project `website`):
- Install (src/main.ts (or main.tsx) — after `npm install dataflare-web`): `glass.init({ host: 'https://simmsreeve.com/_glass', project: 'website' });`
- Custom events: `glass.capture('signup_completed', { plan: 'pro' })`. After login: `glass.identify(user.id, { plan })`.
- Consent: if the site has a cookie banner, load Dataflare with `data-persistence="cookieless"` and call `glass.consent(true)` when the visitor accepts (`false` on reject). Cookieless stores nothing on the device; session replay starts after consent unless you add `data-replay-cookieless="true"` (records without storing anything; call `glass.consent(false)` on load for visitors who rejected). Mention Dataflare on the privacy page.
- If the code already has an analytics helper (a `track()` that calls gtag, fbq or PostHog), add `glass.capture` inside it rather than at every call site.
- Events that mean success (signup, purchase, pledge): `mark_event` with role "conversion" so Reports show conversion rates per source.
- Name events object_action in snake_case and past tense (signup_completed, plan_upgraded, invite_sent). Put variable details in properties ({ plan: "pro" }), never in the event name. Never send emails, names or other personal data as properties.
- After adding an event and deploying, confirm it arrives: `npx dataflare-cli events <name>` (or MCP `describe_event`).
- After a custom event is shipping, call define_event (or `dataflare events <name> --describe "…"`). The description must say how and when the event is fired (which user action or code path). Document every property with what it means and which values to expect (e.g. description: "Fired when the user finishes checkout after payment succeeds."; properties: { plan: "Chosen plan id (free|pro|enterprise)", amount: "Charge in the account currency" }). list_events returns undocumented custom events — document those before relying on them in funnels or trends.
- Prefer MCP `define_event` so you can set both the event description and each property's meaning in one call.
- Feature flags: `glass.flag('key')` returns "on", a variant key, or null. Create with `npx dataflare-cli flags set <key> --rollout 10`.

Upgrades (the Worker version is pinned in `.glass/config.json`):
- `.github/workflows/glass.yml` deploys whatever `.glass/` holds when it changes on the default branch. If that file is missing, run `npx dataflare-cli ci` and add the `CLOUDFLARE_API_TOKEN` repository secret.
- To upgrade: `npx dataflare-cli@latest upgrade` stages the new Worker and migrations into `.glass/` without deploying. Commit and push (or open a PR); CI deploys. Ask before pushing if pushes also deploy the site.
- Do not deploy Dataflare from a laptop (`dataflare upgrade --local`, wrangler) once the workflow exists, and never commit `.glass/credentials.json`.
- `dataflare upgrade` refuses to replace a newer Worker with an older CLI. If it does, use `@latest`; do not pass `--allow-downgrade`.
<!-- glass:end -->
