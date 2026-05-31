export const CHROME_STORE_EXTENSION_ID = 'bepolblndbcmpffmmoedkdlpdkfenikn';

export const isChromeStoreBuild = (): boolean =>
	chrome.runtime.id === CHROME_STORE_EXTENSION_ID;

export const links = {
	repo: 'https://github.com/dary1337/custom-themes',
	newIssue: 'https://github.com/dary1337/custom-themes/issues/new',
	telegram: 'https://t.me/dary1337',
	reposJson:
		'https://raw.githubusercontent.com/dary1337/custom-themes/master/repos.json',
	latestRelease:
		'https://api.github.com/repos/dary1337/custom-themes/releases/latest',
} as const;

export const STORAGE_SCHEMA_VERSION = 2;

export const ALARM_UPDATE_THEMES = 'UPDATE_THEMES';
export const BACKGROUND_UPDATE_PERIOD_MINUTES = 1440;

/** Match-all sentinel used in a theme's `link` field. */
export const ALL_SITES = '*';

/** webNavigation transition types that should trigger CSS injection. */
export const INJECT_TRANSITION_TYPES = [
	'reload',
	'link',
	'typed',
	'generated',
	'auto_bookmark',
	'form_submit',
] as const;
