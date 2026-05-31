import { vi } from 'vitest';

/** Minimal in-memory chrome.storage.local + chrome.runtime mock for tests. */
export function installChromeMock(initial: Record<string, unknown> = {}): {
	store: Record<string, unknown>;
} {
	const store: Record<string, unknown> = { ...initial };

	const local = {
		get: vi.fn(
			(
				keys: string | string[],
				cb: (items: Record<string, unknown>) => void,
			) => {
				const list = Array.isArray(keys) ? keys : [keys];
				const result: Record<string, unknown> = {};
				for (const k of list) if (k in store) result[k] = store[k];
				cb(result);
			},
		),
		set: vi.fn((items: Record<string, unknown>, cb?: () => void) => {
			Object.assign(store, items);
			cb?.();
		}),
	};

	globalThis.chrome = {
		storage: { local },
		runtime: { id: 'test-extension-id' },
	} as unknown as typeof chrome;

	return { store };
}
