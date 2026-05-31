import type { ConfirmDialogRef } from '@/popup/pages/settings-page/settings-page';
import type { RepoTheme, UserTheme } from '@/shared/types';
import { downloadThemes } from '@/services/exporter';
import { hasUpdateAvailable } from '@/services/updater';
import { links } from '@/shared/constants';
import { useSettingsStore } from '@/stores/settings';
import { useThemesStore } from '@/stores/themes';
import { useNotification } from '@kyvg/vue3-notification';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

export interface ThemeDetailsPageProps {
	tab: string;
	id: string;
}

export interface ThemeDetailsPageState {
	t: ReturnType<typeof useI18n>['t'];
	links: typeof links;
	confirm: Ref<ConfirmDialogRef | undefined>;
	stored: ComputedRef<UserTheme | undefined>;
	repoTheme: ComputedRef<RepoTheme | undefined>;
	theme: ComputedRef<RepoTheme | UserTheme | undefined>;
	screenshots: ComputedRef<string[]>;
	showScreenshots: ComputedRef<boolean>;
	versionLabel: ComputedRef<string | undefined>;
	updateAvailable: ComputedRef<boolean>;
	isLocal: ComputedRef<boolean>;
	isAuthorTheme: ComputedRef<boolean>;
	close: () => void;
	edit: () => void;
	applyUpdate: () => Promise<void>;
	exportTheme: () => void;
	remove: () => Promise<void>;
	suggest: (channel: 'github' | 'telegram') => Promise<void>;
	reportBadLayout: () => void;
}

export function useThemeDetailsPage(
	props: ThemeDetailsPageProps,
): ThemeDetailsPageState {
	const { t } = useI18n();
	const router = useRouter();
	const { notify } = useNotification();
	const themes = useThemesStore();
	const settings = useSettingsStore();

	const confirm = ref<ConfirmDialogRef>();

	const stored = computed(() => themes.get(props.id));
	const repoTheme = computed<RepoTheme | undefined>(() => {
		const all = [
			...(themes.repos?.["Author's"] ?? []),
			...(themes.repos?.Community ?? []),
		];
		return all.find((theme) => String(theme.id) === props.id);
	});
	const isLocal = computed(() => stored.value?.local ?? false);
	const theme = computed<RepoTheme | UserTheme | undefined>(() =>
		isLocal.value ? stored.value : (repoTheme.value ?? stored.value),
	);

	const screenshots = computed<string[]>(
		() => repoTheme.value?.screenshots ?? [],
	);
	const showScreenshots = computed(
		() => settings.settings.showScreenshots && !isLocal.value,
	);
	const versionLabel = computed<string | undefined>(() =>
		stored.value?.edited || isLocal.value
			? t('strings.local')
			: (stored.value?.version ?? repoTheme.value?.version),
	);
	const updateAvailable = computed(
		() =>
			repoTheme.value !== undefined &&
			hasUpdateAvailable(stored.value, repoTheme.value),
	);
	const isAuthorTheme = computed(
		() =>
			themes.repos?.["Author's"].some((x) => String(x.id) === props.id) ??
			false,
	);

	function close(): void {
		void router.push({ name: 'themes', params: { tab: props.tab } });
	}

	function edit(): void {
		void router.push({
			name: 'editor',
			params: { tab: props.tab, id: props.id },
		});
	}

	async function applyUpdate(): Promise<void> {
		if (repoTheme.value)
			await themes.toggle(repoTheme.value, stored.value?.checked ?? true);
	}

	function exportTheme(): void {
		downloadThemes(themes.userSettings, props.id);
	}

	async function remove(): Promise<void> {
		const ok = await confirm.value?.ask(`${t('buttons.delete')}?`);
		if (!ok) return;
		await themes.remove(props.id);
		close();
	}

	async function suggest(channel: 'github' | 'telegram'): Promise<void> {
		const local = stored.value;
		if (!local) return;
		const message = t('suggestTemplate', {
			name: local.name,
			link: local.link,
			css: local.sourceCSS,
		});
		try {
			await navigator.clipboard.writeText(message);
			notify({ type: 'success', text: t('strings.copiedPreset') });
		} catch (error) {
			console.warn('[suggest] clipboard write failed', error);
			notify({ type: 'error', text: t('strings.somethingWrong') });
		}
		window.open(
			channel === 'github' ? links.newIssue : links.telegram,
			'_blank',
			'noopener',
		);
	}

	function reportBadLayout(): void {
		window.open(links.newIssue, '_blank', 'noopener');
	}

	return {
		t,
		links,
		confirm,
		stored,
		repoTheme,
		theme,
		screenshots,
		showScreenshots,
		versionLabel,
		updateAvailable,
		isLocal,
		isAuthorTheme,
		close,
		edit,
		applyUpdate,
		exportTheme,
		remove,
		suggest,
		reportBadLayout,
	};
}
