import { useThemeImport } from '@/popup/composables/use-import';
import { downloadThemes } from '@/services/exporter';
import { isChromeStoreBuild } from '@/shared/constants';
import { SETTING_DEFS, type SettingDef } from '@/shared/settings-defs';
import { useSettingsStore } from '@/stores/settings';
import { useThemesStore } from '@/stores/themes';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, type Router } from 'vue-router';

export interface ConfirmDialogRef {
	ask: (text: string) => Promise<boolean>;
}

export interface SettingsPageState {
	t: ReturnType<typeof useI18n>['t'];
	settings: ReturnType<typeof useSettingsStore>;
	confirm: Ref<ConfirmDialogRef | undefined>;
	visibleSettings: ComputedRef<SettingDef[]>;
	description: (id: string, dynamic?: boolean) => string;
	promptImport: () => void;
	exportThemes: () => void;
	reset: () => Promise<void>;
	back: () => void;
}

export function useSettingsPage(): SettingsPageState {
	const { t } = useI18n();
	const router: Router = useRouter();
	const settings = useSettingsStore();
	const themes = useThemesStore();
	const { promptImport } = useThemeImport();

	const confirm = ref<ConfirmDialogRef>();
	const storeBuild = isChromeStoreBuild();

	const visibleSettings = computed<SettingDef[]>(() =>
		SETTING_DEFS.filter((def) => !(def.hideInStoreBuild && storeBuild)),
	);

	function description(id: string, dynamic?: boolean): string {
		if (!dynamic) return t(`settings.${id}.description`);
		const last = settings.settings.lastThemesUpdate;
		const lastUpdate = last
			? new Date(last).toLocaleString()
			: t('strings.never');
		return t(`settings.${id}.description`, { lastUpdate });
	}

	function exportThemes(): void {
		downloadThemes(themes.userSettings);
	}

	async function reset(): Promise<void> {
		const ok = await confirm.value?.ask(t('strings.confirmReset'));
		if (!ok) return;
		await settings.reset();
		await themes.loadUserSettings();
		await router.push('/');
	}

	function back(): void {
		router.back();
	}

	return {
		t,
		settings,
		confirm,
		visibleSettings,
		description,
		promptImport,
		exportThemes,
		reset,
		back,
	};
}
