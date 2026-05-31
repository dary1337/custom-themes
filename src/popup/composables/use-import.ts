import { parseImport } from '@/services/exporter';
import { useThemesStore } from '@/stores/themes';
import { useNotification } from '@kyvg/vue3-notification';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

/** Opens a file picker, validates the JSON, and merges imported themes. */
export function useThemeImport() {
	const { t } = useI18n();
	const router = useRouter();
	const { notify } = useNotification();
	const themes = useThemesStore();

	function promptImport(): void {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.addEventListener('change', () => {
			const file = input.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.addEventListener('load', () => {
				const text = reader.result;
				if (typeof text !== 'string') {
					notify({ type: 'error', text: t('strings.somethingWrong') });
					return;
				}
				void (async () => {
					try {
						const imported = parseImport(text);
						await themes.importThemes(imported);
						await router.push({
							name: 'themes',
							params: { tab: 'Local' },
						});
					} catch (error) {
						console.warn('[import] failed', error);
						notify({
							type: 'error',
							text: t('strings.somethingWrong'),
						});
					}
				})();
			});
			reader.readAsText(file);
		});
		input.click();
	}

	return { promptImport };
}
