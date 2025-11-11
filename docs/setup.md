## Setup

1. Create GitHub Secrets in your repository:
   - `APIFY_TOKEN`: Apify API token
   - `TELEGRAM_BOT_TOKEN`: Telegram bot token
   - `TELEGRAM_CHAT_ID`: Channel or chat ID (e.g. `-1001234567890`)
   - Optional: `APIFY_ACTOR_ID` to override default actor id (see below)

2. Default actor input:
   ```json
   { "domainCodes": ["de"] }
   ```

3. Optional environment configuration (set as Repository → Settings → Secrets and variables → Variables):
   - `MAX_ITEMS` (default 30)
   - `MIN_DISCOUNT_PCT` (default 20)
   - `DEDUPE_TTL_DAYS` (default 7)

4. GitHub Actions:
   - Cron is set to run hourly at `:15`. Adjust in `.github/workflows/deals.yml`.
   - You can also run manually via “Run workflow”.

5. Actor ID:
   - Default in code: `apify/amazon-deals-scraper`
   - If your actor differs (e.g., community actor), set `APIFY_ACTOR_ID` secret or variable accordingly.

6. Local run:
   ```bash
   npm ci
   npm run build
   # Option A: using .env
   cp .env.example .env   # fill values
   node dist/index.js

   # Option B: ad-hoc environment variables
   APIFY_TOKEN=xxx TELEGRAM_BOT_TOKEN=yyy TELEGRAM_CHAT_ID=zzz node dist/index.js
   ```


