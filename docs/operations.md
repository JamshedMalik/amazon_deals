## Operations

Observability:
- Logs are structured JSON written to stdout/stderr for GitHub Actions log inspection.

Retries and errors:
- Telegram requests are retried on 429/5xx with exponential backoff and respect `retry_after`.
- Actor run errors cause a job failure (non-zero exit).

Deduplication:
- Sent IDs are stored in Apify KV Store `deals-dedupe-store`, key `sentIds`.
- Entries older than `DEDUPE_TTL_DAYS` are pruned on load.

Changing filters:
- Set `MIN_DISCOUNT_PCT` and `MAX_ITEMS` via repo variables or secrets.

Runbook:
1. If GA fails, check logs for “Fatal error”.
2. Validate secrets are present.
3. Confirm `APIFY_ACTOR_ID` matches your actor if using a custom one.
4. Re-run the workflow manually after fixing issues.


