import { links } from './conts.js';

export async function loadRepos(useLocal = false) {
	try {
		if (useLocal) {
			try {
				const response = await fetch(chrome.runtime.getURL('repos.json'));

				return await response.json();
			} catch {
				const repos = await getReposFromStorage();

				if (repos == undefined) throw 'Failed load repos.json from storage and local';

				return repos;
			}
		}

		const response = await fetch(links.reposJson, {
			cache: 'no-cache',
		});

		const repos = await response.json();

		saveReposToStorage(repos);

		return repos;
	} catch (error) {
		console.error('Failed load repos.json', error);
		return undefined;
	}
}

export async function updateTheme(userSettings, theme, checked, customCSS = undefined) {
	if (!checked && !theme.edited && customCSS === undefined) {
		delete userSettings[theme.id];

		chrome.storage.local.set({ userSettings });
		return;
	}

	let sourceCSS = '';

	const updateValue = {
		id: theme.id,
		link: theme.link,
		checked: checked,
		compiledCss: await compileCss(
			(sourceCSS =
				customCSS || userSettings[theme.id]?.edited || userSettings[theme.id]?.local
					? customCSS || userSettings[theme.id].sourceCSS
					: await loadStyles(theme.cssLink))
		),
		edited: theme.edited || !!customCSS,
		sourceCSS: customCSS || '',
		local: theme.local || false,
		name: theme.name,
	};

	if (!sourceCSS) return undefined;

	if (theme.version) updateValue.version = theme.version;

	userSettings[theme.id] = updateValue;
	chrome.storage.local.set({ userSettings });

	return sourceCSS;
}

export async function updateThemes(userSettings, repos) {
	for (const tab of ["Author's", 'Community'])
		for (const theme of repos[tab]) {
			const themeSettings = userSettings[theme.id];
			if (themeSettings && themeSettings.checked && !themeSettings.local && !themeSettings.edited)
				await updateTheme(userSettings, theme, true);
		}

	setExtensionSetting('lastThemesUpdate', new Date().getTime());
}

export async function loadStyles(link) {
	const href = typeof window !== 'undefined' ? window.location.href : undefined;

	try {
		const response = await fetch(link);
		const result = await response.text();

		if (href && href !== window.location.href) throw '[loadStyles]: throw by href';

		return result;
	} catch (e) {
		console.log('[loadStyles], catch:', e);
	}
}

export async function compileCss(code = '', recursive = false) {
	let compiledCss = code;

	const regex = /@import\s+url\("([^"]+)"\)(?:;)?/g;

	const imports = compiledCss.match(regex);

	if (imports) {
		const promises = imports.map(async (x) => compileCss(await loadStyles(x.replace(regex, '$1')), true));

		const results = await Promise.all(promises);

		console.log('loading @import urls:', promises);

		compiledCss = [results.join('\n'), compiledCss.replace(regex, '')].join('\n');
	}

	if (recursive) return compiledCss;

	// console.log('compiling code:', compiledCss);

	compiledCss = compiledCss
		// comment replacement
		.replace(/\/\*[\s\S]*?\*\//g, '')
		// minification and !important addition
		.replace(/;(?!\s*!important)|!important\b|\s+/g, (match) => {
			if (match === ';') return ' !important;';
			if (match === '!important !important') return '!important';
			return ' ';
		})
		// removing !important from @font-face imports
		.replace(/(@font-face\s*{[^}]*})\s*(!\s*important)?/g, (match, p1, p2) => {
			return match.replaceAll(' !important;', ';');
		})
		.trim();

	// console.log('compiled code:', compiledCss);

	return compiledCss;
}

export async function setUserSetting(key, value) {
	const userSettings = await getUserSettings();

	userSettings[key] = value;

	chrome.storage.local.set({ userSettings });
}

export async function getUserSettings() {
	const userSettings = await new Promise((resolve) =>
		chrome.storage.local.get('userSettings', (result) => resolve(result.userSettings || {}))
	);
	console.log('userSettings', userSettings);

	return userSettings;
}

export async function setExtensionSetting(key, value) {
	const extensionSettings = await getExtensionSettings();

	extensionSettings[key] = value;

	chrome.storage.local.set({ extensionSettings });
}

export async function getExtensionSettings() {
	const extensionSettings = await new Promise((resolve) =>
		chrome.storage.local.get('extensionSettings', (result) => resolve(result.extensionSettings || {}))
	);

	console.log('extensionSettings', extensionSettings);

	return extensionSettings;
}

export function saveReposToStorage(repos) {
	if (!repos || !repos["Author's"] || !repos['Community']) return;

	chrome.storage.local.set({ repos });
}

export async function getReposFromStorage() {
	const repos = await new Promise((resolve) =>
		chrome.storage.local.get('repos', (result) => resolve(result.repos || {}))
	);

	console.log('reposFromStorage', repos);

	return repos;
}
