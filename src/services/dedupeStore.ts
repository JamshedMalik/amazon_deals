import { logger } from "./logger.js";
import type { KeyValueStoreClient } from "@apify/client";

export interface DedupeState {
	// id -> epoch ms
	ids: Record<string, number>;
}

export class DedupeStore {
	private readonly key = "sentIds";
	constructor(private readonly kv: KeyValueStoreClient, private readonly ttlDays: number) {}

	private now(): number {
		return Date.now();
	}

	private cutoff(): number {
		return this.now() - this.ttlDays * 24 * 60 * 60 * 1000;
	}

	async load(): Promise<DedupeState> {
		try {
			const state = (await this.kv.getRecord<DedupeState>(this.key))?.value;
			const current: DedupeState = state?.ids ? { ids: { ...state.ids } } : { ids: {} };
			// prune old
			const limit = this.cutoff();
			for (const [id, ts] of Object.entries(current.ids)) {
				if (!ts || ts < limit) {
					delete current.ids[id];
				}
			}
			return current;
		} catch (e) {
			logger.warn("Failed to load dedupe state; starting fresh");
			return { ids: {} };
		}
	}

	async save(state: DedupeState): Promise<void> {
		await this.kv.setRecord(this.key, { value: state });
	}

	markSent(state: DedupeState, id: string): void {
		state.ids[id] = this.now();
	}

	isSent(state: DedupeState, id: string): boolean {
		return Boolean(state.ids[id]);
	}
}


