export interface Deal {
	id: string;
	title: string;
	url: string;
	imageUrl?: string;
	priceCurrent?: number;
	priceOriginal?: number;
	discountPct?: number;
	rating?: number;
	reviewsCount?: number;
	endsAt?: string;
	category?: string;
	asin?: string;
	source: "apify-amazon-deals";
}

export interface ApifyRawItem {
	// Common fields observed in Apify Amazon scrapers. Keep optional and defensive.
	asin?: string;
	title?: string;
	url?: string;
	image?: string;
	thumbnail?: string;
	price?: number | string;
	discountedPrice?: number | string;
	originalPrice?: number | string;
	rating?: number | string;
	reviewsCount?: number | string;
	endTime?: string;
	dealEndsAt?: string;
	category?: string;
	domain?: string;
	// Fallbacks / other possible keys
	productUrl?: string;
	imageUrl?: string;
	currentPrice?: number | string;
}

