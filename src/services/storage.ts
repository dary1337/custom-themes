import type {
	ExtensionSettings,
	RepoIndex,
	StorageShape,
	UserSettings,
	UserTheme,
} from '@/shared/types';
import { STORAGE_SCHEMA_VERSION } from '@/shared/constants';

const DEFAULT_EXTENSION_SETTINGS: ExtensionSettings = {
	useLocalJsonRepo: false,
	checkForUpdate: true,
	showScreenshots: true,
	backgroundUpdate: true,
};

function get<K extends keyof StorageShape>(
	key: K,
): Promise<StorageShape[K] | undefined> {
	return new Promise((resolve) => {
		chrome.storage.local.get(
			key,
			(result: Record<string, StorageShape[K] | undefined>) => {
				resolve(result[key]);
			},
		);
	});
}

function set<K extends keyof StorageShape>(
	key: K,
	value: StorageShape[K],
): Promise<void> {
	return new Promise((resolve) => {
		chrome.storage.local.set({ [key]: value }, () => {
			resolve();
		});
	});
}

export async function getUserSettings(): Promise<UserSettings> {
	return (await get('userSettings')) ?? {};
}

export async function setUserSettings(
	userSettings: UserSettings,
): Promise<void> {
	await set('userSettings', userSettings);
}

export async function getExtensionSettings(): Promise<ExtensionSettings> {
	return {
		...DEFAULT_EXTENSION_SETTINGS,
		...(await get('extensionSettings')),
	};
}

export async function setExtensionSettings(
	settings: ExtensionSettings,
): Promise<void> {
	await set('extensionSettings', settings);
}

export async function setExtensionSetting<K extends keyof ExtensionSettings>(
	key: K,
	value: ExtensionSettings[K],
): Promise<void> {
	const settings = await getExtensionSettings();
	settings[key] = value;
	await setExtensionSettings(settings);
}

export async function getRepos(): Promise<RepoIndex | undefined> {
	return get('repos');
}

export async function setRepos(repos: RepoIndex): Promise<void> {
	await set('repos', repos);
}

/**
 * Normalize a possibly-incomplete legacy UserTheme into the v2 shape.
 * Legacy entries could be missing `edited`, `local`, `sourceCSS`, etc.
 */
function normalizeUserTheme(
	raw: Partial<UserTheme> & { id: UserTheme['id']; name: string },
): UserTheme {
	return {
		id: raw.id,
		name: raw.name,
		link: raw.link ?? '',
		checked: raw.checked ?? false,
		compiledCss: raw.compiledCss ?? '',
		sourceCSS: raw.sourceCSS ?? '',
		edited: raw.edited ?? false,
		local: raw.local ?? false,
		...(raw.version !== undefined ? { version: raw.version } : {}),
	};
}

/**
 * Idempotent migration from legacy (unversioned) storage to v2. Backfills
 * missing UserTheme fields and stamps the schema version. Ids are preserved
 * exactly so existing repo/userSettings matching keeps working.
 */
export async function migrateStorage(): Promise<void> {
	const settings = await getExtensionSettings();
	if (settings.storageSchemaVersion === STORAGE_SCHEMA_VERSION) return;

	// Read raw to defend against malformed legacy entries that pre-date the schema.
	const raw = ((await get('userSettings')) ?? {}) as Record<string, unknown>;
	const migrated: UserSettings = {};
	for (const [key, theme] of Object.entries(raw)) {
		if (!theme || typeof theme !== 'object') continue;
		migrated[key] = normalizeUserTheme(
			theme as Partial<UserTheme> & { id: UserTheme['id']; name: string },
		);
	}

	await setUserSettings(migrated);
	settings.storageSchemaVersion = STORAGE_SCHEMA_VERSION;
	await setExtensionSettings(settings);
}

export async function resetAll(): Promise<void> {
	await set('userSettings', {});
	await setExtensionSettings({
		...DEFAULT_EXTENSION_SETTINGS,
		storageSchemaVersion: STORAGE_SCHEMA_VERSION,
	});
}

export { DEFAULT_EXTENSION_SETTINGS };
