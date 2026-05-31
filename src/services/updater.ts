import type {
	RepoIndex,
	ThemeId,
	UserSettings,
	UserTheme,
} from '@/shared/types';
import { setUserSettings } from './storage';

// `css-compiler` pulls in postcss (~100KB). Loaded on demand so the popup's
// initial bundle stays light — only paid the first time a theme is compiled.
async function compileCss(source: string): Promise<string> {
	const compiler = await import('./css-compiler');
	return compiler.compileCss(source);
}

/** A theme that can be (re)compiled into user settings — repo or local. */
export interface UpdatableTheme {
	id: ThemeId;
	name: string;
	link: string;
	cssLink?: string | undefined;
	version?: string | undefined;
	edited?: boolean | undefined;
	local?: boolean | undefined;
}

/** Fetch the raw source CSS for a remote theme. */
export async function loadStyles(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.warn(
				'[updater] failed to load styles',
				url,
				response.status,
				response.statusText,
			);
			return '';
		}
		return await response.text();
	} catch (error) {
		console.warn('[updater] failed to load styles', url, error);
		return '';
	}
}

/**
 * Resolve the source CSS for a theme update.
 * - explicit `customCSS` wins (an edit being saved);
 * - an already edited/local theme reuses its stored source;
 * - otherwise the remote `cssLink` is fetched.
 */
async function resolveSourceCss(
	existing: UserTheme | undefined,
	theme: UpdatableTheme,
	customCSS: string | undefined,
): Promise<string> {
	if (customCSS !== undefined) return customCSS;
	if (existing?.edited || existing?.local) return existing.sourceCSS;
	if (theme.cssLink) return loadStyles(theme.cssLink);
	return '';
}

/**
 * Create, update, or remove a user theme, persisting the result.
 *
 * Disabling a clean (non-edited) theme removes it entirely. Otherwise the
 * source CSS is resolved, compiled, and stored. Source CSS is only persisted
 * for edited/local themes; clean remote themes are re-fetched on demand.
 *
 * Returns the source CSS that was compiled, or `undefined` when nothing was
 * stored (removed, or empty source).
 */
export async function updateTheme(
	userSettings: UserSettings,
	theme: UpdatableTheme,
	checked: boolean,
	customCSS?: string,
	persist = true,
): Promise<string | undefined> {
	const key = String(theme.id);
	const existing = userSettings[key];

	if (!checked && !theme.edited && customCSS === undefined) {
		Reflect.deleteProperty(userSettings, key);
		if (persist) await setUserSettings(userSettings);
		return undefined;
	}

	const sourceCSS = await resolveSourceCss(existing, theme, customCSS);
	if (!sourceCSS) return undefined;

	const edited =
		Boolean(theme.edited) ||
		existing?.edited === true ||
		customCSS !== undefined;
	const local = Boolean(theme.local) || existing?.local === true;

	const updated: UserTheme = {
		id: theme.id,
		name: theme.name,
		link: theme.link,
		checked,
		compiledCss: await compileCss(sourceCSS),
		edited,
		// Persist source only for edited/local themes; clean repo themes re-fetch
		// on demand, so storing the resolved source would just bloat storage.
		sourceCSS: edited || local ? sourceCSS : '',
		local,
		...(theme.version !== undefined ? { version: theme.version } : {}),
	};

	userSettings[key] = updated;
	if (persist) await setUserSettings(userSettings);
	return sourceCSS;
}

/**
 * Re-fetch and recompile every enabled, clean (non-local, non-edited) repo
 * theme. Used by the daily background update. Mutates and persists
 * `userSettings`.
 */
export async function updateAllThemes(
	userSettings: UserSettings,
	repos: RepoIndex,
): Promise<void> {
	const tabs: (keyof RepoIndex)[] = ["Author's", 'Community'];
	let changed = false;
	for (const tab of tabs) {
		for (const theme of repos[tab]) {
			const current = userSettings[String(theme.id)];
			if (
				current &&
				current.checked &&
				!current.local &&
				!current.edited
			) {
				await updateTheme(userSettings, theme, true, undefined, false);
				changed = true;
			}
		}
	}
	if (changed) await setUserSettings(userSettings);
}

/** Whether a repo theme's version differs from the stored, clean copy. */
export function hasUpdateAvailable(
	stored: UserTheme | undefined,
	repoTheme: { version?: string | undefined },
): boolean {
	if (!stored || stored.edited) return false;
	return stored.version !== repoTheme.version;
}
