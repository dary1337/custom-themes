import type { RepoTab } from '@/shared/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeTab = RepoTab | 'Local';

/** True when the popup is rendered as a full window rather than the toolbar popup. */
export const isFullPage = (): boolean => window.innerWidth >= 290;

export const useUiStore = defineStore('ui', () => {
	const activeTab = ref<ThemeTab>("Author's");
	const search = ref('');

	function setTab(tab: ThemeTab): void {
		activeTab.value = tab;
	}

	function setSearch(value: string): void {
		search.value = value;
	}

	return { activeTab, search, setTab, setSearch };
});
