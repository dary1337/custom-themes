import { loadRepos } from '@/services/repo';
import {
	getExtensionSettings,
	getUserSettings,
	setExtensionSetting,
} from '@/services/storage';
import { updateAllThemes } from '@/services/updater';
import {
	ALARM_UPDATE_THEMES,
	BACKGROUND_UPDATE_PERIOD_MINUTES,
} from '@/shared/constants';

/** Re-fetch and recompile all enabled clean themes, then stamp the timestamp. */
export async function runThemeUpdate(): Promise<void> {
	const settings = await getExtensionSettings();
	const repos = await loadRepos(settings.useLocalJsonRepo);
	if (!repos) return;

	const userSettings = await getUserSettings();
	await updateAllThemes(userSettings, repos);
	await setExtensionSetting('lastThemesUpdate', Date.now());
	console.info('[background] themes updated', new Date().toLocaleString());
}

/**
 * Ensure the daily update alarm exists when background updates are enabled.
 * Runs an immediate update the first time the alarm is created.
 */
export async function setupBackgroundUpdates(): Promise<void> {
	const settings = await getExtensionSettings();
	if (!settings.backgroundUpdate) return;

	// `@types/chrome` types `alarms.get` as non-optional, but at runtime it resolves
	// to `undefined` when the alarm doesn't exist yet.
	const existing = (await chrome.alarms.get(ALARM_UPDATE_THEMES)) as
		| chrome.alarms.Alarm
		| undefined;
	if (existing) return;

	await chrome.alarms.create(ALARM_UPDATE_THEMES, {
		delayInMinutes: 1,
		periodInMinutes: BACKGROUND_UPDATE_PERIOD_MINUTES,
	});
	await runThemeUpdate();
}

export function registerAlarmListener(): void {
	chrome.alarms.onAlarm.addListener((alarm) => {
		if (alarm.name === ALARM_UPDATE_THEMES) void runThemeUpdate();
	});
}
