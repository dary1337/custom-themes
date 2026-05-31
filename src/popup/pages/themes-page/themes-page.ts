import type { RepoTheme, UserTheme } from '@/shared/types';
import { useThemeImport } from '@/popup/composables/use-import';
import { useSettingsStore } from '@/stores/settings';
import { useThemesStore } from '@/stores/themes';
import { isFullPage, useUiStore, type ThemeTab } from '@/stores/ui';
import { computed, watch, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, type Router } from 'vue-router';

export interface ThemesPageProps {
	tab: string;
}

export interface ThemesPageState {
	t: ReturnType<typeof useI18n>['t'];
	router: Router;
	themes: ReturnType<typeof useThemesStore>;
	settings: ReturnType<typeof useSettingsStore>;
	ui: ReturnType<typeof useUiStore>;
	full: boolean;
	activeTab: ComputedRef<ThemeTab>;
	displayedThemes: ComputedRef<(RepoTheme | UserTheme)[]>;
	showRepoError: ComputedRef<boolean>;
	hasDetail: ComputedRef<boolean>;
	promptImport: () => void;
	createTheme: () => void;
	loadLocalRepos: () => Promise<void>;
}

const VALID_TABS: ThemeTab[] = ["Author's", 'Community', 'Local'];

export function useThemesPage(props: ThemesPageProps): ThemesPageState {
	const { t } = useI18n();
	const router = useRouter();
	const themes = useThemesStore();
	const settings = useSettingsStore();
	const ui = useUiStore();
	const { promptImport } = useThemeImport();

	const full = isFullPage();

	const activeTab = computed<ThemeTab>(() =>
		VALID_TABS.includes(props.tab as ThemeTab)
			? (props.tab as ThemeTab)
			: "Author's",
	);

	watch(activeTab, (tab) => ui.setTab(tab), { immediate: true });

	const displayedThemes = computed<(RepoTheme | UserTheme)[]>(() => {
		const query = ui.search.trim().toLowerCase();
		if (query) {
			const all = [
				...themes.localThemes,
				...(themes.repos?.["Author's"] ?? []),
				...(themes.repos?.Community ?? []),
			];
			return all.filter((theme) =>
				theme.name.toLowerCase().includes(query),
			);
		}
		if (activeTab.value === 'Local') return themes.localThemes;
		return themes.repos?.[activeTab.value] ?? [];
	});

	const showRepoError = computed(
		() =>
			!themes.reposLoading &&
			!themes.reposAvailable &&
			activeTab.value !== 'Local' &&
			!ui.search,
	);
	const hasDetail = computed(() =>
		Boolean(router.currentRoute.value.params.id),
	);

	function createTheme(): void {
		const theme = themes.createLocal(t('strings.untitled'));
		void router.push({
			name: 'editor',
			params: { tab: 'Local', id: String(theme.id) },
		});
	}

	async function loadLocalRepos(): Promise<void> {
		await settings.update('useLocalJsonRepo', true);
		await themes.loadReposIndex();
	}

	return {
		t,
		router,
		themes,
		settings,
		ui,
		full,
		activeTab,
		displayedThemes,
		showRepoError,
		hasDetail,
		promptImport,
		createTheme,
		loadLocalRepos,
	};
}
