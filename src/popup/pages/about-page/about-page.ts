import { fetchReleaseNotes } from '@/services/release';
import { links } from '@/shared/constants';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, type Router } from 'vue-router';

export interface AboutPageState {
	t: ReturnType<typeof useI18n>['t'];
	router: Router;
	links: typeof links;
	version: string;
	changelog: Ref<string[]>;
	usedLibs: string[];
}

export function useAboutPage(): AboutPageState {
	const { t } = useI18n();
	const router = useRouter();

	const version = chrome.runtime.getManifest().version;
	const changelog = ref<string[]>([]);
	const usedLibs = ['Ace Editor', 'js-beautify'];

	async function loadChangelog(): Promise<void> {
		changelog.value = await fetchReleaseNotes(version);
	}

	onMounted(() => {
		void loadChangelog();
	});

	return { t, router, links, version, changelog, usedLibs };
}
