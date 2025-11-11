/* Minimal structured logger */
export const logger = {
	info: (msg: string, meta?: unknown) => {
		console.log(JSON.stringify({ level: "info", msg, ...(meta ? { meta } : {}) }));
	},
	warn: (msg: string, meta?: unknown) => {
		console.warn(JSON.stringify({ level: "warn", msg, ...(meta ? { meta } : {}) }));
	},
	error: (msg: string, meta?: unknown) => {
		console.error(JSON.stringify({ level: "error", msg, ...(meta ? { meta } : {}) }));
	}
};


