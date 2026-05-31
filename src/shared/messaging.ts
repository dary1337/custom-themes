/** Typed message contract between the popup and the background service worker. */
export type RuntimeMessage =
	| { type: 'APPLY_ACTIVE_TAB' }
	| { type: 'RUN_BACKGROUND_UPDATE' };

export async function sendMessage(message: RuntimeMessage): Promise<void> {
	try {
		await chrome.runtime.sendMessage(message);
	} catch {
		// SW asleep / no receiver — expected when the popup fires a message
		// before the worker has woken up to handle it.
	}
}
