import { links } from '@/shared/constants';
import { useThemesStore } from '@/stores/themes';
import { isFullPage } from '@/stores/ui';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

export function useAppFooter() {
	const { t } = useI18n();
	const router = useRouter();
	const themes = useThemesStore();

	const full = isFullPage();
	const updating = ref(false);

	async function updateThemes(): Promise<void> {
		if (updating.value) return;
		updating.value = true;
		try {
			await themes.updateAll();
		} finally {
			updating.value = false;
		}
	}

	function openFullWindow(): void {
		void chrome.tabs.create({
			url: chrome.runtime.getURL('src/popup/index.html'),
		});
	}

	return { t, router, links, full, updating, updateThemes, openFullWindow };
}
