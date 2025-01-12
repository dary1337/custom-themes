import { getExtensionSettings, getUserSettings, loadRepos, setExtensionSetting, updateThemes } from './shared.js';

async function loadStylesInTab(tabId, url) {
	const userSettings = await getUserSettings();
	let count = 0;

	if (Object.keys(userSettings).length === 0) return count;

	for (const theme of Object.keys(userSettings)) {
		const settings = userSettings[theme];

		if (!settings.checked || !settings.link) continue;

		const link = settings.link.toLowerCase();

		if (
			link === '*' ||
			//
			url.startsWith(link) ||
			url.startsWith(link.replace('https://', 'https://www.'))
		) {
			await chrome.scripting.insertCSS({
				target: {
					tabId: tabId,
					// allFrames: true,
				},
				css: settings.compiledCss,
			});
			count++;
		}
	}

	return count;
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
	if (
		[
			//
			'reload',
			'link',
			'typed',
			'generated',
			'auto_bookmark',
			'form_submit',
		].includes(details.transitionType)
	) {
		const tabId = details.tabId;
		const url = details.url;

		if (url) {
			try {
				const loaded = await loadStylesInTab(tabId, url);
				console.log(`Loaded ${loaded} styles:`, url, tabId);
			} catch (e) {
				console.log('Failed to load styles in tab:', url, tabId);
				console.log('catch', e);
			}
		}
	}
});

async function checkForBackgroundUpdates() {
	const extensionSettings = await getExtensionSettings();
	const ALARM_NAME = 'UPDATE_THEMES';

	const backgroundUpdate = async (alarmInfo) => {
		const extensionSettings = await getExtensionSettings();

		if (alarmInfo.name !== ALARM_NAME) return;

		const userSettings = await getUserSettings();
		await updateThemes(userSettings, await loadRepos(extensionSettings.useLocalJsonRepo));
		console.log(new Date().toLocaleDateString(), 'Themes updated in the background');
	};

	if (extensionSettings['backgroundUpdate']) {
		console.log('ALARM_NAME:', ALARM_NAME);

		async function createAlarm() {
			const alarm = await chrome.alarms.get(ALARM_NAME);
			console.log('createAlarm ~ alarm:', alarm);

			if (typeof alarm === 'undefined') {
				console.log('creating alarm');
				chrome.alarms.create(ALARM_NAME, {
					delayInMinutes: 1,
					periodInMinutes: 1440,
				});
				await backgroundUpdate({
					name: ALARM_NAME,
				});
			}
		}

		createAlarm();

		chrome.alarms.onAlarm.addListener(backgroundUpdate);
	}
}

checkForBackgroundUpdates();
