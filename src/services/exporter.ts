import type { ThemeId, UserSettings, UserTheme } from '@/shared/types';
import { importFileSchema } from '@/shared/schemas';

/**
 * Serialize one local theme by id, or all local themes when id is omitted.
 * Returns `null` (as a JSON string) when a specific id doesn't exist, so the
 * downloaded file is always valid JSON.
 */
export function serializeThemes(
	userSettings: UserSettings,
	themeId?: ThemeId,
): string {
	if (themeId !== undefined) {
		return JSON.stringify(userSettings[String(themeId)] ?? null);
	}
	return JSON.stringify(
		Object.values(userSettings).filter((theme) => theme.local),
	);
}

export function downloadThemes(
	userSettings: UserSettings,
	themeId?: ThemeId,
): void {
	const json = serializeThemes(userSettings, themeId);
	const url = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`;
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = `custom-theme-${themeId ?? 'all'}.json`;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
}

/**
 * Parse and validate an exported file, returning the contained themes.
 * Throws if the JSON is malformed or fails schema validation.
 */
export function parseImport(raw: string): UserTheme[] {
	const parsed = importFileSchema.parse(JSON.parse(raw));
	return Array.isArray(parsed) ? parsed : [parsed];
}

/** Merge imported themes into user settings (imported entries win by id). */
export function mergeImported(
	userSettings: UserSettings,
	themes: UserTheme[],
): UserSettings {
	const merged = { ...userSettings };
	for (const theme of themes) merged[String(theme.id)] = theme;
	return merged;
}
