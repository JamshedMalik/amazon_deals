import { promises as fs } from "fs";
import path from "path";
import { logger } from "./logger.js";

export async function fetchItemsFromFile<T = unknown>(filePath: string, maxItems?: number): Promise<T[]> {
	const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
	logger.info("Reading items from local file", { file: resolved, maxItems });
	const content = await fs.readFile(resolved, "utf-8");
	const data = JSON.parse(content);
	let items: unknown;
	if (Array.isArray(data)) {
		items = data;
	} else if (data && typeof data === "object" && Array.isArray((data as any).items)) {
		items = (data as any).items;
	} else {
		throw new Error("Local file content is not an array nor an object with items[]");
	}
	const arr = items as T[];
	return typeof maxItems === "number" ? arr.slice(0, maxItems) : arr;
}


