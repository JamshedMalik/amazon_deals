// Stub for future extension
export interface TwitterClientOptions {
	// Intentionally empty; to be filled when enabling Twitter posting
}

export class TwitterClient {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	constructor(_options?: TwitterClientOptions) {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async postTweet(_text: string, _imageUrl?: string): Promise<void> {
		// no-op stub
	}
}


