import { z } from "zod";

const envSchema = z.object({
	APIFY_TOKEN: z.string().min(1, "APIFY_TOKEN is required"),
	TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
	TELEGRAM_CHAT_ID: z.string().min(1, "TELEGRAM_CHAT_ID is required"),
	APIFY_ACTOR_ID: z.string().optional(), // allow override of actor ID
	MAX_ITEMS: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined))
		.refine((v) => v === undefined || Number.isFinite(v), "MAX_ITEMS must be a number"),
	MIN_DISCOUNT_PCT: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined))
		.refine((v) => v === undefined || Number.isFinite(v), "MIN_DISCOUNT_PCT must be a number"),
	DEDUPE_TTL_DAYS: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined))
		.refine((v) => v === undefined || Number.isFinite(v), "DEDUPE_TTL_DAYS must be a number")
});

export type AppConfig = ReturnType<typeof loadConfig>;

export function loadConfig() {
	const parsed = envSchema.parse(process.env);
	return {
		apifyToken: parsed.APIFY_TOKEN,
		telegramBotToken: parsed.TELEGRAM_BOT_TOKEN,
		telegramChatId: parsed.TELEGRAM_CHAT_ID,
		apifyActorId:
			parsed.APIFY_ACTOR_ID ||
			// Keep configurable; user can override with APIFY_ACTOR_ID if needed
			"apify/amazon-deals-scraper",
		maxItems: parsed.MAX_ITEMS ?? 30,
		minDiscountPct: parsed.MIN_DISCOUNT_PCT ?? 20,
		dedupeTtlDays: parsed.DEDUPE_TTL_DAYS ?? 7,
		// Fixed per user request
		apifyInput: {
			domainCodes: ["de"]
		}
	};
}

