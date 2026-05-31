import type { ExtensionSettings } from './types';

type ToggleableSetting = Exclude<
	keyof ExtensionSettings,
	'lastThemesUpdate' | 'storageSchemaVersion'
>;

export interface SettingDef {
	id: ToggleableSetting;
	/** Hidden in the Chrome Web Store build (self-update is irrelevant there). */
	hideInStoreBuild?: boolean;
	/** Description interpolates the last-update timestamp. */
	dynamicDescription?: boolean;
}

export const SETTING_DEFS: SettingDef[] = [
	{ id: 'useLocalJsonRepo' },
	{ id: 'checkForUpdate', hideInStoreBuild: true },
	{ id: 'showScreenshots' },
	{ id: 'backgroundUpdate', dynamicDescription: true },
];
