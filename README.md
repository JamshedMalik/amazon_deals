Apify Amazon Deals → Telegram
=============================

Fetch Amazon deals from Apify (DE marketplace), format, dedupe, and post to Telegram on a GitHub Actions cron.

Quickstart
----------
1. Add GitHub Secrets:
   - `APIFY_TOKEN`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - Optional: `APIFY_ACTOR_ID`
2. Adjust cron in `.github/workflows/deals.yml` if needed.
3. Manual run: Actions → “Run workflow”.

Local Run
---------
```bash
npm ci
npm run build
# Option A: using .env
cp .env.example .env   # fill values
node dist/index.js

# Option B: ad-hoc env vars
APIFY_TOKEN=xxx TELEGRAM_BOT_TOKEN=yyy TELEGRAM_CHAT_ID=zzz node dist/index.js
```

Configuration
-------------
- Defaults: `MAX_ITEMS=30`, `MIN_DISCOUNT_PCT=20`, `DEDUPE_TTL_DAYS=7`
- Actor input fixed to `{ "domainCodes": ["de"] }`

Docs
----
- `docs/architecture.md`
- `docs/setup.md`
- `docs/operations.md`
- `docs/extending-twitter.md`


