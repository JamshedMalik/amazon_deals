import axios from "axios";
import { logger } from "./logger.js";

export interface TelegramClientOptions {
	botToken: string;
	chatId: string;
}

export class TelegramClient {
	private readonly baseUrl: string;
	constructor(private readonly options: TelegramClientOptions) {
		this.baseUrl = `https://api.telegram.org/bot${options.botToken}`;
	}

	private async retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
		try {
			return await fn();
		} catch (err: any) {
			if (retries <= 0) throw err;
			const status = err?.response?.status;
			if (status && (status === 429 || status >= 500)) {
				const wait = err?.response?.data?.parameters?.retry_after
					? Number(err.response.data.parameters.retry_after) * 1000
					: delayMs;
				logger.warn("Telegram request failed; retrying", { status, waitMs: wait });
				await new Promise((r) => setTimeout(r, wait));
				return this.retry(fn, retries - 1, Math.min(wait * 2, 10000));
			}
			throw err;
		}
	}

	async sendMessageMarkdownV2(text: string): Promise<void> {
		await this.retry(async () => {
			await axios.post(`${this.baseUrl}/sendMessage`, {
				chat_id: this.options.chatId,
				text,
				parse_mode: "MarkdownV2",
				disable_web_page_preview: false
			});
		});
	}

	async sendPhotoWithCaption(photoUrl: string, caption: string): Promise<void> {
		await this.retry(async () => {
			await axios.post(`${this.baseUrl}/sendPhoto`, {
				chat_id: this.options.chatId,
				photo: photoUrl,
				caption,
				parse_mode: "MarkdownV2"
			});
		});
	}
}


