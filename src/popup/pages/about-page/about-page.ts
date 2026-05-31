import { en } from '@/i18n/en';
import { ru } from '@/i18n/ru';
import { links } from '@/shared/constants';
import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, type Router } from 'vue-router';

export interface AboutPageState {
	t: ReturnType<typeof useI18n>['t'];
	router: Router;
	links: typeof links;
	version: string;
	changelog: ComputedRef<string[]>;
	usedLibs: string[];
}

export function useAboutPage(): AboutPageState {
	const { t, locale } = useI18n();
	const router = useRouter();

	const version = chrome.runtime.getManifest().version;
	const changelog = computed<string[]>(() =>
		locale.value === 'ru' ? ru.changelog : en.changelog,
	);
	const usedLibs = ['Ace Editor', 'js-beautify'];

	return { t, router, links, version, changelog, usedLibs };
}
