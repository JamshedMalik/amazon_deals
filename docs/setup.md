## Setup (Local and GitHub)

Prerequisites:
- Node.js 20.x (local) or GitHub Actions (no local install required)
- Telegram bot (token from BotFather) and a target chat/channel id

Default actor input (when using Apify):
   ```json
   { "domainCodes": ["de"] }
   ```

### Local Run

1) Create `.env` (root)
```dotenv
# Choose ONE source path below (File or HTTP). If none is chosen, Apify is used.
USE_FILE_SOURCE=true
FILE_SOURCE_PATH=dataset_amazon-deals-scraper_2025-11-10_23-37-36-478.json
# USE_HTTP_SOURCE=true
# HTTP_SOURCE_URL=https://example.com/deals.json

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=-1001234567890

# Safe test
DRY_RUN=true
MAX_ITEMS=5
MIN_DISCOUNT_PCT=20
DEDUPE_TTL_DAYS=7

# For Apify mode only:
# APIFY_TOKEN=your_apify_token
# APIFY_ACTOR_ID=apify/amazon-deals-scraper
```

2) Install and build
```bash
npm install --omit=optional   # skips @apify/client for HTTP/File testing
npm run build
```

3) Run
```bash
node dist/index.js
```

Notes:
- DRY_RUN=true logs messages without sending to Telegram.
- To send for real: set `DRY_RUN=false`, ensure the bot can post in the target chat, and use the correct numeric chat id (channels start with -100…).
- If you switch to Apify mode, install full dependencies (ensure your registry allows `@apify/client`) and set `APIFY_TOKEN`.

### GitHub Actions

1) Secrets (Settings → Secrets and variables → Actions)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Optional Apify: `APIFY_TOKEN`

2) Variables (Settings → Secrets and variables → Actions → Variables)
- `DRY_RUN`, `MAX_ITEMS`, `MIN_DISCOUNT_PCT`, `DEDUPE_TTL_DAYS`
- `USE_FILE_SOURCE`, `FILE_SOURCE_PATH` (if reading a file in repo)
- `USE_HTTP_SOURCE`, `HTTP_SOURCE_URL` (public JSON)
- Optional: `APIFY_ACTOR_ID`

3) Confirm workflow file exists
- `.github/workflows/deals.yml` (already included)
- Cron default is hourly at :15; change if desired.

4) Run the workflow
- Actions → “Amazon Deals to Telegram” → Run workflow
- Start with `DRY_RUN=true` and `MAX_ITEMS=1` for a safe test

5) Logs and sending
- View logs in the run → look for “Deals after filter” and “DRY_RUN: would send message”
- When ready, set `DRY_RUN=false`


