import { useThemesStore } from '@/stores/themes';
import { isFullPage, type ThemeTab, useUiStore } from '@/stores/ui';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, type Router } from 'vue-router';

export interface TabBarProps {
	currentTab: ThemeTab;
}

export interface TabBarState {
	t: ReturnType<typeof useI18n>['t'];
	router: Router;
	ui: ReturnType<typeof useUiStore>;
	full: boolean;
	searchOpen: Ref<boolean>;
	tabs: ComputedRef<{ id: ThemeTab; label: string }[]>;
	selectTab: (tab: ThemeTab) => void;
	toggleSearch: () => void;
}

export function useTabBar(props: TabBarProps): TabBarState {
	const { t } = useI18n();
	const router = useRouter();
	const themes = useThemesStore();
	const ui = useUiStore();

	const full = isFullPage();
	const searchOpen = ref(false);

	const tabs = computed<{ id: ThemeTab; label: string }[]>(() => {
		const list: { id: ThemeTab; label: string }[] = [
			{ id: "Author's", label: t('tabs.fromAuthor') },
			{ id: 'Community', label: t('tabs.community') },
		];
		if (themes.hasLocalThemes || full)
			list.push({ id: 'Local', label: t('tabs.local') });
		return list;
	});

	function selectTab(tab: ThemeTab): void {
		if (tab === props.currentTab) return;
		void router.push({ name: 'themes', params: { tab } });
	}

	function toggleSearch(): void {
		searchOpen.value = !searchOpen.value;
		if (!searchOpen.value) ui.setSearch('');
	}

	return { t, router, ui, full, searchOpen, tabs, selectTab, toggleSearch };
}
