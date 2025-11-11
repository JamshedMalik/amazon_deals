import axios from "axios";
import { logger } from "./logger.js";

export async function fetchItemsFromHttp<T = unknown>(url: string, maxItems?: number): Promise<T[]> {
	logger.info("Fetching items from HTTP source", { url, maxItems });
	const res = await axios.get(url, { timeout: 30000 });
	const data = res.data;
	let items: unknown;
	if (Array.isArray(data)) {
		items = data;
	} else if (data && typeof data === "object" && Array.isArray((data as any).items)) {
		items = (data as any).items;
	} else {
		throw new Error("HTTP source response is not an array nor an object with items[]");
	}
	const arr = items as T[];
	return typeof maxItems === "number" ? arr.slice(0, maxItems) : arr;
}


