import type { RuntimeMessage } from '@/shared/messaging';
import { migrateStorage } from '@/services/storage';
import { INJECT_TRANSITION_TYPES } from '@/shared/constants';
import {
	registerAlarmListener,
	runThemeUpdate,
	setupBackgroundUpdates,
} from './alarms';
import { injectIntoActiveTab, injectStylesIntoTab } from './apply-styles';

const injectTransitions = new Set<string>(INJECT_TRANSITION_TYPES);

chrome.webNavigation.onCommitted.addListener((details) => {
	if (details.frameId !== 0) return;
	if (!injectTransitions.has(details.transitionType)) return;
	if (!details.url) return;

	const { tabId, url } = details;
	void (async () => {
		try {
			const count = await injectStylesIntoTab(tabId, url);
			if (count)
				console.debug(`[background] injected ${count} theme(s)`, url);
		} catch (error) {
			console.warn('[background] failed to inject styles', url, error);
		}
	})();
});

chrome.runtime.onMessage.addListener(
	(message: RuntimeMessage, _sender, sendResponse) => {
		const handle = async (): Promise<void> => {
			switch (message.type) {
				case 'APPLY_ACTIVE_TAB':
					await injectIntoActiveTab();
					return;
				case 'RUN_BACKGROUND_UPDATE':
					await runThemeUpdate();
			}
		};
		handle()
			.catch((error: unknown) => {
				console.warn(
					'[background] message handler failed',
					message,
					error,
				);
			})
			.finally(() => {
				sendResponse();
			});
		return true; // keep the channel open for the async response
	},
);

registerAlarmListener();

void (async () => {
	await migrateStorage();
	await setupBackgroundUpdates();
})();
