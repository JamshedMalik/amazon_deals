import "dotenv/config";
import { loadConfig } from "./config.js";
import { mapRawItemToDeal, formatTelegramCaption } from "./services/dealFormatter.js";
import { TelegramClient } from "./services/telegramClient.js";
import { DedupeStore } from "./services/dedupeStore.js";
import { logger } from "./services/logger.js";
import type { ApifyRawItem } from "./types/deal.js";
import { fetchItemsFromHttp } from "./services/httpSource.js";
import { fetchItemsFromFile } from "./services/fileSource.js";

async function main() {
	const config = loadConfig();
	logger.info("Loaded config", {
		maxItems: config.maxItems,
		minDiscountPct: config.minDiscountPct,
		ttlDays: config.dedupeTtlDays,
		useHttpSource: config.useHttpSource,
		useFileSource: config.useFileSource,
		dryRun: config.dryRun
	});

	const telegram = new TelegramClient({
		botToken: config.telegramBotToken,
		chatId: config.telegramChatId
	});

	let items: ApifyRawItem[] = [];
	if (config.useFileSource && config.fileSourcePath) {
		items = await fetchItemsFromFile<ApifyRawItem>(config.fileSourcePath);
	} else if (config.useHttpSource && config.httpSourceUrl) {
		items = await fetchItemsFromHttp<ApifyRawItem>(config.httpSourceUrl);
	} else {
		// Dynamic import so HTTP-only testing doesn't require @apify/client to be installed
		const { DealsApifyClient } = await import("./services/apifyClient.js");
		const apify = new DealsApifyClient(config.apifyToken);
		// Run actor and fetch items
		const run = await apify.runDealsActor<ApifyRawItem>(
			config.apifyActorId,
			config.apifyInput,
			undefined
		);
		items = run.items;
		// Use Apify KV for dedupe persistence across runs
		const kv = apify.getKeyValueStoreClient("deals-dedupe-store");
		const dedupe = new DedupeStore(kv, config.dedupeTtlDays);
		const state = await dedupe.load();
		await processAndSend(items, config.minDiscountPct, config.maxItems, telegram, dedupe, state);
		await dedupe.save(state);
		logger.info("Posting complete");
		return;
	}

	// If using HTTP source, use an in-memory dedupe (no persistence) by default
	const inMemoryKV = {
		store: { ids: {} as Record<string, number> },
		async getRecord<T = any>(_key: string) {
			return { value: this.store as unknown as T };
		},
		async setRecord<T = any>(_key: string, data: { value: T }) {
			// @ts-ignore
			this.store = data.value;
		}
	};
	const dummyDedupe = new DedupeStore(inMemoryKV as any, config.dedupeTtlDays);
	const state = await dummyDedupe.load();
	await processAndSend(items, config.minDiscountPct, config.maxItems, telegram, dummyDedupe, state);
	logger.info("Posting complete (file/http source)");
}

async function processAndSend(
	items: ApifyRawItem[],
	minDiscountPct: number | undefined,
	maxItems: number,
	telegram: TelegramClient,
	dedupe: DedupeStore,
	state: Awaited<ReturnType<DedupeStore["load"]>>
) {
	// Map and filter
	const mapped = items
		.map(mapRawItemToDeal)
		.filter((d): d is NonNullable<typeof d> => Boolean(d));

	const filtered = mapped.filter((d) => {
		if (minDiscountPct !== undefined && d.discountPct !== undefined) {
			return d.discountPct >= minDiscountPct;
		}
		// If no discount info, include cautiously
		return true;
	});

	const limited = filtered.slice(0, maxItems);
	logger.info("Deals after filter", { total: mapped.length, selected: limited.length });

	let sentCount = 0;
	for (const deal of limited) {
		if (dedupe.isSent(state, deal.id)) {
			continue;
		}
		const caption = formatTelegramCaption(deal);
		if (process.env && (process.env.DRY_RUN === "true" || process.env.DRY_RUN === "1")) {
			// honor env directly as well as config to allow quick overrides
			logger.info("DRY_RUN: would send message", { id: deal.id, title: deal.title });
		} else if ((global as any).APP_CONFIG?.dryRun || false) {
			// fallback if APP_CONFIG is provided (not required)
			logger.info("DRY_RUN: would send message", { id: deal.id, title: deal.title });
		} else if ((await import("./config.js")).loadConfig().dryRun) {
			logger.info("DRY_RUN: would send message", { id: deal.id, title: deal.title });
		} else {
			if (deal.imageUrl) {
				await telegram.sendPhotoWithCaption(deal.imageUrl, caption);
			} else {
				await telegram.sendMessageMarkdownV2(caption);
			}
			dedupe.markSent(state, deal.id);
		}
		sentCount += 1;
	}
	logger.info("Posting complete", { sent: sentCount });
}

main().catch((err) => {
	logger.error("Fatal error", { err: String(err?.stack || err) });
	process.exit(1);
});


