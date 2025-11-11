import { logger } from "./logger.js";

export interface RunDealsResult<T> {
	items: T[];
	datasetId: string;
}

export class DealsApifyClient {
	// Lazy client to avoid requiring @apify/client at build time for HTTP-only testing
	private client: any;

	constructor(private readonly token: string) {
		// defer actual import to first use
		this.client = null;
	}

	async runDealsActor<T = unknown>(actorId: string, input: unknown, maxItems?: number): Promise<RunDealsResult<T>> {
			if (!this.client) {
				// Use a variable for the module name so TypeScript doesn't try to resolve it at build time
				const moduleName = "@apify/client";
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const mod: any = await import(moduleName as string);
			this.client = new mod.ApifyClient({ token: this.token });
		}
		logger.info("Starting Apify actor", { actorId });
		const run = await this.client.actor(actorId).call({ input });
		const datasetId = run.defaultDatasetId;
		if (!datasetId) {
			throw new Error("Actor run did not produce a datasetId");
		}
		logger.info("Fetching dataset items", { datasetId, maxItems });
		const datasetClient = this.client.dataset(datasetId);
		const items: T[] = [];
		let offset = 0;
		const limit = 500;
		// paginate until we reach maxItems (if provided) or the dataset ends
		while (true) {
			const page = await datasetClient.listItems({ clean: true, limit, offset });
			if (page.items.length === 0) break;
			for (const it of page.items) {
				items.push(it as T);
				if (maxItems && items.length >= maxItems) {
					logger.info("Reached maxItems, stopping pagination", { count: items.length });
					return { items, datasetId };
				}
			}
			offset += page.items.length;
			if (offset >= page.total) break;
		}
		logger.info("Fetched dataset items", { count: items.length });
		return { items, datasetId };
	}

	getKeyValueStoreClient(name: string) {
		if (!this.client) {
			throw new Error("Apify client not initialized – only available in Apify mode");
		}
		return this.client.keyValueStore(name);
	}
}


