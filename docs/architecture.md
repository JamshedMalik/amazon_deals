## Architecture

Flow:
1. `src/index.ts` loads config and orchestrates the pipeline.
2. `src/services/apifyClient.ts` triggers the Apify actor and fetches dataset items.
   - Loaded lazily at runtime to avoid install-time dependency in HTTP/File modes.
3. `src/services/dealFormatter.ts` maps raw items to a `Deal` and composes a Telegram caption.
4. `src/services/dedupeStore.ts` persists sent IDs in an Apify Key-Value Store (durable across runs).
5. `src/services/telegramClient.ts` posts messages/photos to Telegram with MarkdownV2.
6. `src/services/twitterClient.ts` is a stub to support future extension to Twitter.
7. `src/services/httpSource.ts` fetches items from a public JSON endpoint (testing mode).
8. `src/services/fileSource.ts` reads items from a local JSON file (testing mode).

Key decisions:
- Deduplication uses Apify KV Store for persistence across GitHub Actions runs.
- MarkdownV2 is used for rich Telegram formatting with careful escaping.
- Actor input is fixed to `{ domainCodes: ["de"] }` per requirement.
- Actor ID is configurable via `APIFY_ACTOR_ID` to accommodate variations in actor naming.
- File/HTTP sources enable testing in restricted environments; `DRY_RUN` supports safe validation without posting.


