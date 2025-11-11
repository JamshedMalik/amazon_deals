## Extending to Twitter

This project includes a stubbed `TwitterClient`. To enable:

1. Choose a Twitter API library (v2 or v1.1) and auth method.
2. Implement `postTweet(text, imageUrl?)` in `src/services/twitterClient.ts`.
3. Add secrets for Twitter credentials to GitHub and wire them into config.
4. Update `src/index.ts` to post tweets when enabled (e.g., behind env flag).
5. Consider rate limits and text length; prefer concise messaging.

Formatting:
- Keep the first 100–120 chars high-signal.
- Include URL and optionally an image.
- Avoid Markdown; Twitter doesn’t support it.


