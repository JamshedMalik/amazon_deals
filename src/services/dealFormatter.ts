import { Deal, ApifyRawItem } from "../types/deal.js";

function toNumber(value: unknown): number | undefined {
	if (value === null || value === undefined) return undefined;
	if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
	if (typeof value === "string") {
		const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
		const parsed = Number(cleaned);
		return Number.isFinite(parsed) ? parsed : undefined;
	}
	return undefined;
}

export function mapRawItemToDeal(item: ApifyRawItem): Deal | null {
	const title = item.title?.trim();
	const url = (item.url || item.productUrl)?.trim();
	if (!title || !url) return null;

	const priceCurrent =
		toNumber(item.discountedPrice ?? item.currentPrice ?? item.price) ?? undefined;
	const priceOriginal = toNumber(item.originalPrice) ?? undefined;
	let discountPct: number | undefined = undefined;
	if (priceCurrent !== undefined && priceOriginal !== undefined && priceOriginal > 0) {
		discountPct = Math.round(((priceOriginal - priceCurrent) / priceOriginal) * 100);
	}
	const imageUrl = (item.imageUrl || item.image || item.thumbnail)?.trim() || undefined;
	const rating = toNumber(item.rating);
	const reviewsCount = toNumber(item.reviewsCount);
	const endsAt = item.dealEndsAt || item.endTime;

	const asin = item.asin;
	const idBase = asin || `${title}|${url}`;
	const id = Buffer.from(idBase).toString("base64url");

	return {
		id,
		title,
		url,
		imageUrl,
		priceCurrent,
		priceOriginal,
		discountPct,
		rating,
		reviewsCount,
		endsAt,
		category: item.category,
		asin,
		source: "apify-amazon-deals"
	};
}

function escapeMarkdownV2(text: string): string {
	// Telegram MarkdownV2 requires escaping these chars: _ * [ ] ( ) ~ ` > # + - = | { } . !
	return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, (m) => `\\${m}`);
}

export function formatTelegramCaption(deal: Deal): string {
	const title = escapeMarkdownV2(deal.title);
	const parts: string[] = [];
	parts.push(`*${title}*`);
	if (deal.priceCurrent !== undefined) {
		const curr = deal.priceCurrent.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
		let priceLine = `Preis: ${escapeMarkdownV2(curr)}`;
		if (deal.priceOriginal !== undefined && deal.priceOriginal > deal.priceCurrent) {
			const orig = deal.priceOriginal.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
			const disc = deal.discountPct !== undefined ? `  \\-${deal.discountPct}%` : "";
			priceLine += `  ~${escapeMarkdownV2(orig)}~${disc}`;
		}
		parts.push(priceLine);
	}
	if (deal.rating !== undefined) {
		const stars = `${deal.rating.toFixed(1)} ⭐`;
		const rc = deal.reviewsCount !== undefined ? ` (${deal.reviewsCount.toLocaleString("de-DE")})` : "";
		parts.push(`Bewertung: ${escapeMarkdownV2(stars + rc)}`);
	}
	if (deal.endsAt) {
		parts.push(`Endet: ${escapeMarkdownV2(deal.endsAt)}`);
	}
	parts.push(`[Jetzt ansehen](${escapeMarkdownV2(deal.url)})`);
	return parts.join("\n");
}


