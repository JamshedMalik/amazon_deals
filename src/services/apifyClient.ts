import { ApifyClient } from "@apify/client";
import { logger } from "./logger.js";

export interface RunDealsResult<T> {
	items: T[];
	datasetId: string;
}

export class DealsApifyClient {
	private client: ApifyClient;

	constructor(private readonly token: string) {
		this.client = new ApifyClient({ token });
	}

	async runDealsActor<T = unknown>(actorId: string, input: unknown, maxItems?: number): Promise<RunDealsResult<T>> {
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
		return this.client.keyValueStore(name);
	}
}


