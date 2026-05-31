import type { UserTheme } from '@/shared/types';
import { getUserSettings } from '@/services/storage';
import { ALL_SITES } from '@/shared/constants';

/**
 * Whether a theme's `link` matches a page URL. Mirrors the legacy rule: an
 * exact prefix match, a `www.` variant, or the `*` wildcard. The link is
 * lower-cased; the URL is compared as-is for backwards compatibility.
 */
export function themeMatchesUrl(
	theme: Pick<UserTheme, 'link'>,
	url: string,
): boolean {
	if (!theme.link) return false;
	const link = theme.link.toLowerCase();
	if (link === ALL_SITES) return true;
	return (
		url.startsWith(link) ||
		url.startsWith(link.replace('https://', 'https://www.'))
	);
}

/**
 * Inject the compiled CSS of every enabled, matching theme into a tab.
 * One bad theme (e.g. invalid CSS rejected by the browser) doesn't block the
 * rest — each insertion is independently guarded.
 */
export async function injectStylesIntoTab(
	tabId: number,
	url: string,
): Promise<number> {
	const userSettings = await getUserSettings();
	let injected = 0;

	for (const theme of Object.values(userSettings)) {
		if (
			!theme.checked ||
			!theme.compiledCss ||
			!themeMatchesUrl(theme, url)
		)
			continue;
		try {
			await chrome.scripting.insertCSS({
				target: { tabId },
				css: theme.compiledCss,
			});
			injected++;
		} catch (error) {
			console.warn(
				'[apply-styles] insertCSS failed',
				{ tabId, themeId: theme.id },
				error,
			);
		}
	}

	return injected;
}

/** Inject matching styles into the currently active tab (instant apply). */
export async function injectIntoActiveTab(): Promise<void> {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const tab = tabs[0];
	if (tab?.id === undefined || !tab.url) return;
	await injectStylesIntoTab(tab.id, tab.url);
}
