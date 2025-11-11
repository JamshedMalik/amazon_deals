## Operations

Observability:
- Logs are structured JSON written to stdout/stderr for GitHub Actions log inspection.

Retries and errors:
- Telegram requests are retried on 429/5xx with exponential backoff and respect `retry_after`.
- Actor run errors cause a job failure (non-zero exit).

Deduplication:
- Sent IDs are stored in Apify KV Store `deals-dedupe-store`, key `sentIds`.
- Entries older than `DEDUPE_TTL_DAYS` are pruned on load.
 - In HTTP/File modes, an in-memory store is used by default (no persistence across runs).

Changing filters:
- Set `MIN_DISCOUNT_PCT` and `MAX_ITEMS` via repo variables or secrets.

Runbook:
1. If GA fails, check logs for “Fatal error”.
2. Validate secrets are present.
3. Confirm `APIFY_ACTOR_ID` matches your actor if using a custom one.
4. Re-run the workflow manually after fixing issues.

Common issues:
- 403 from Telegram: bot not added/authorized or wrong chat id. Ensure numeric id (channels start with `-100...`) and the bot can post.
- 400 from HTTP source: the URL may require auth or params. Use a public JSON URL or include required tokens/params.
- Corporate registry blocks `@apify/client`: use HTTP/File modes or run in GitHub Actions, or allowlist `https://registry.npmjs.org/`.

Dry run:
- Set `DRY_RUN=true` to validate formatting and flow without sending messages.



