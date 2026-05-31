import type { UserTheme } from '@/shared/types';
import { getUserSettings } from '@/services/storage';
import { ALL_SITES } from '@/shared/constants';

/**
 * Whether a theme's `link` matches a page URL. The `*` wildcard matches every
 * site; otherwise the hosts must be equal (a leading `www.` on either side is
 * ignored) and, when the link carries a path, the page path must match it at a
 * segment boundary. Host equality — not a string prefix — prevents a theme for
 * `youtube.com` from leaking onto `youtube.com.evil.com`.
 */
export function themeMatchesUrl(
	theme: Pick<UserTheme, 'link'>,
	url: string,
): boolean {
	if (!theme.link) return false;
	const link = theme.link.toLowerCase();
	if (link === ALL_SITES) return true;

	let target: URL;
	let page: URL;
	try {
		target = new URL(link);
		page = new URL(url);
	} catch {
		return false;
	}

	const stripWww = (host: string): string => host.replace(/^www\./, '');
	if (stripWww(target.hostname) !== stripWww(page.hostname)) return false;

	if (target.pathname === '/') return true;
	const base = target.pathname.endsWith('/')
		? target.pathname
		: `${target.pathname}/`;
	return page.pathname === target.pathname || page.pathname.startsWith(base);
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
