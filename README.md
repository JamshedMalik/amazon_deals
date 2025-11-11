Apify Amazon Deals → Telegram
=============================

Fetch Amazon deals from Apify (DE marketplace), format, dedupe, and post to Telegram on a GitHub Actions cron.

Quickstart (Local)
------------------
1. Create `.env` at the project root with at least:
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   - For testing without sending: `DRY_RUN=true`
   - Optional sources:
     - File: `USE_FILE_SOURCE=true`, `FILE_SOURCE_PATH=path/to/deals.json`
     - HTTP: `USE_HTTP_SOURCE=true`, `HTTP_SOURCE_URL=https://.../deals.json`
     - Apify (default): `APIFY_TOKEN=...` (uses `{ "domainCodes": ["de"] }`)
2. Install dependencies (skip optional Apify client if not needed):
   - `npm install --omit=optional`
3. Build and run:
   - `npm run build`
   - `node dist/index.js`

Quickstart (GitHub Actions)
---------------------------
1. Add repository Secrets (Settings → Secrets and variables → Actions → New repository secret):
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   - Optional for Apify: `APIFY_TOKEN`
2. Add repository Variables (optional but recommended):
   - `DRY_RUN`, `MAX_ITEMS`, `MIN_DISCOUNT_PCT`, `DEDUPE_TTL_DAYS`
   - `USE_FILE_SOURCE`, `FILE_SOURCE_PATH`
   - `USE_HTTP_SOURCE`, `HTTP_SOURCE_URL`
3. Trigger the workflow:
   - Actions → “Amazon Deals to Telegram” → Run workflow
   - Start with `DRY_RUN=true` and `MAX_ITEMS=1`
4. Scheduler:
   - Adjust cron in `.github/workflows/deals.yml` if needed (default hourly at :15).

Configuration
-------------
- Defaults: `MAX_ITEMS=30`, `MIN_DISCOUNT_PCT=20`, `DEDUPE_TTL_DAYS=7`
- Sources:
  - File: `USE_FILE_SOURCE=true`, `FILE_SOURCE_PATH=...`
  - HTTP: `USE_HTTP_SOURCE=true`, `HTTP_SOURCE_URL=...` (must be public JSON)
  - Apify: `APIFY_TOKEN` (actor id can be overridden via `APIFY_ACTOR_ID`)
- DRY_RUN support: set `DRY_RUN=true` to log messages instead of sending
- Actor input default is `{ "domainCodes": ["de"] }`

Docs
----
- `docs/architecture.md`
- `docs/setup.md` (local + GitHub step-by-step)
- `docs/operations.md` (troubleshooting, proxies, permissions, dedupe)
- `docs/extending-twitter.md`


