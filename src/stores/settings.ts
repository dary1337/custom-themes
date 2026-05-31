import type { ExtensionSettings } from '@/shared/types';
import {
	DEFAULT_EXTENSION_SETTINGS,
	getExtensionSettings,
	resetAll,
	setExtensionSetting,
} from '@/services/storage';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
	const settings = ref<ExtensionSettings>({ ...DEFAULT_EXTENSION_SETTINGS });
	const loaded = ref(false);

	async function load(): Promise<void> {
		settings.value = await getExtensionSettings();
		loaded.value = true;
	}

	async function update<K extends keyof ExtensionSettings>(
		key: K,
		value: ExtensionSettings[K],
	): Promise<void> {
		// Persist first so a storage failure leaves the in-memory store unchanged.
		await setExtensionSetting(key, value);
		settings.value = { ...settings.value, [key]: value };
	}

	async function reset(): Promise<void> {
		await resetAll();
		await load();
	}

	return { settings, loaded, load, update, reset };
});
