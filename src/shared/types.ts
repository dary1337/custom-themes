/**
 * Theme ids come in two flavours that must be preserved as-is for storage
 * compatibility: repo themes use numeric ids (see repos.json), locally created
 * themes use random alphanumeric strings. Object keys coerce both to strings.
 */
export type ThemeId = string | number;

export type RepoTab = "Author's" | 'Community';

/** A theme entry as published in repos.json. */
export interface RepoTheme {
	id: ThemeId;
	name: string;
	link: string;
	cssLink: string;
	version: string;
	// Optional fields are explicitly `T | undefined` to match zod's parsed output
	// under `exactOptionalPropertyTypes: true` — `undefined` is the natural
	// representation of a missing field after JSON.parse.
	author?: string | undefined;
	authorLink?: string | undefined;
	repoLink?: string | undefined;
	screenshots?: string[] | undefined;
}

export type RepoIndex = Record<RepoTab, RepoTheme[]>;

/**
 * A theme as persisted in chrome.storage.local under `userSettings[id]`.
 * Represents the user's relationship with a theme: whether it's enabled, the
 * compiled CSS that gets injected, and (for local/edited themes) the source.
 */
export interface UserTheme {
	id: ThemeId;
	name: string;
	link: string;
	checked: boolean;
	compiledCss: string;
	sourceCSS: string;
	edited: boolean;
	local: boolean;
	version?: string | undefined;
}

export type UserSettings = Record<string, UserTheme>;

export interface ExtensionSettings {
	useLocalJsonRepo: boolean;
	checkForUpdate: boolean;
	showScreenshots: boolean;
	backgroundUpdate: boolean;
	lastThemesUpdate?: number | undefined;
	/** Schema version for storage migrations. Absent === legacy (v1). */
	storageSchemaVersion?: number | undefined;
}

export type Locale = 'en' | 'ru';

export interface StorageShape {
	userSettings: UserSettings;
	extensionSettings: ExtensionSettings;
	repos: RepoIndex;
	/** Parsed changelog lines cached per version to spare the GitHub API. */
	releaseNotes: Record<string, string[]>;
}
