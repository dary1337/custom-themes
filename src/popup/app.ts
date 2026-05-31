import { isChromeStoreBuild, links } from '@/shared/constants';
import { githubReleaseSchema } from '@/shared/schemas';
import { useSettingsStore } from '@/stores/settings';
import { useThemesStore } from '@/stores/themes';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

export interface AppState {
	t: ReturnType<typeof useI18n>['t'];
	releaseUrl: Ref<string | undefined>;
}

export function useApp(): AppState {
	const { t } = useI18n();
	const settings = useSettingsStore();
	const themes = useThemesStore();

	const releaseUrl = ref<string>();

	async function checkExtensionUpdate(): Promise<void> {
		if (!settings.settings.checkForUpdate || isChromeStoreBuild()) return;
		try {
			const response = await fetch(links.latestRelease);
			if (!response.ok) return;
			const release = githubReleaseSchema.parse(await response.json());
			const latest = release.tag_name.replace(/^v/, '');
			const current = chrome.runtime.getManifest().version;
			if (latest !== current) releaseUrl.value = release.html_url;
		} catch (error) {
			console.warn('[app] update check failed', error);
		}
	}

	onMounted(async () => {
		await settings.load();
		await themes.loadUserSettings();
		await themes.loadReposIndex();
		await checkExtensionUpdate();
	});

	return { t, releaseUrl };
}
