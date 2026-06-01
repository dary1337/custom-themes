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

/** True only when `latest` is a strictly higher semantic version than `current`. */
function isNewerVersion(latest: string, current: string): boolean {
	const toParts = (v: string): number[] =>
		v.split('.').map((n) => Number.parseInt(n, 10) || 0);
	const a = toParts(latest);
	const b = toParts(current);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const x = a[i] ?? 0;
		const y = b[i] ?? 0;
		if (x !== y) return x > y;
	}
	return false;
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
			if (isNewerVersion(latest, current))
				releaseUrl.value = release.html_url;
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
