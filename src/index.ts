import "dotenv/config";
import { loadConfig } from "./config.js";
import { DealsApifyClient } from "./services/apifyClient.js";
import { mapRawItemToDeal, formatTelegramCaption } from "./services/dealFormatter.js";
import { TelegramClient } from "./services/telegramClient.js";
import { DedupeStore } from "./services/dedupeStore.js";
import { logger } from "./services/logger.js";
import type { ApifyRawItem } from "./types/deal.js";

async function main() {
	const config = loadConfig();
	logger.info("Loaded config", {
		maxItems: config.maxItems,
		minDiscountPct: config.minDiscountPct,
		ttlDays: config.dedupeTtlDays
	});

	const apify = new DealsApifyClient(config.apifyToken);
	const telegram = new TelegramClient({
		botToken: config.telegramBotToken,
		chatId: config.telegramChatId
	});

	// Run actor and fetch items
	const { items } = await apify.runDealsActor<ApifyRawItem>(
		config.apifyActorId,
		config.apifyInput,
		undefined
	);

	// Map and filter
	const mapped = items
		.map(mapRawItemToDeal)
		.filter((d): d is NonNullable<typeof d> => Boolean(d));

	const filtered = mapped.filter((d) => {
		if (config.minDiscountPct !== undefined && d.discountPct !== undefined) {
			return d.discountPct >= config.minDiscountPct;
		}
		// If no discount info, include cautiously
		return true;
	});

	const limited = filtered.slice(0, config.maxItems);
	logger.info("Deals after filter", { total: mapped.length, selected: limited.length });

	// Dedupe using Apify KV store to persist across runs
	const kv = apify.getKeyValueStoreClient("deals-dedupe-store");
	const dedupe = new DedupeStore(kv, config.dedupeTtlDays);
	const state = await dedupe.load();

	let sentCount = 0;
	for (const deal of limited) {
		if (dedupe.isSent(state, deal.id)) {
			continue;
		}
		const caption = formatTelegramCaption(deal);
		if (deal.imageUrl) {
			await telegram.sendPhotoWithCaption(deal.imageUrl, caption);
		} else {
			await telegram.sendMessageMarkdownV2(caption);
		}
		dedupe.markSent(state, deal.id);
		sentCount += 1;
	}
	await dedupe.save(state);
	logger.info("Posting complete", { sent: sentCount });
}

main().catch((err) => {
	logger.error("Fatal error", { err: String(err?.stack || err) });
	process.exit(1);
});


