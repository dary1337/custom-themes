import type { RepoTheme, UserTheme } from '@/shared/types';
import type { ThemeTab } from '@/stores/ui';
import { hasUpdateAvailable } from '@/services/updater';
import { ALL_SITES } from '@/shared/constants';
import { useThemesStore } from '@/stores/themes';
import { computed, type ComputedRef, type WritableComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

export interface ThemeCardProps {
	theme: RepoTheme | UserTheme;
	tab: ThemeTab;
	selectable: boolean;
}

export interface ThemeCardState {
	t: ReturnType<typeof useI18n>['t'];
	author: ComputedRef<string | undefined>;
	authorLink: ComputedRef<string | undefined>;
	isAllSites: ComputedRef<boolean>;
	linkText: ComputedRef<string>;
	isEdited: ComputedRef<boolean>;
	isSelected: ComputedRef<boolean>;
	checked: WritableComputedRef<boolean>;
	updateAvailable: ComputedRef<boolean>;
	select: () => void;
	openEditor: () => void;
}

export function useThemeCard(props: ThemeCardProps): ThemeCardState {
	const { t } = useI18n();
	const router = useRouter();
	const themes = useThemesStore();

	const stored = computed(() => themes.get(props.theme.id));
	const author = computed(() =>
		'author' in props.theme ? props.theme.author : undefined,
	);
	const authorLink = computed(() =>
		'authorLink' in props.theme ? props.theme.authorLink : undefined,
	);
	const isAllSites = computed(() => props.theme.link === ALL_SITES);
	const linkText = computed(() =>
		props.theme.link.replace(/^https?:\/\//, ''),
	);
	const isEdited = computed(() => stored.value?.edited ?? false);
	const isSelected = computed(
		() => router.currentRoute.value.params.id === String(props.theme.id),
	);

	const checked = computed<boolean>({
		get: () => stored.value?.checked ?? false,
		set: (value) => {
			void themes.toggle(props.theme, value);
		},
	});

	const updateAvailable = computed(
		() =>
			checked.value &&
			'version' in props.theme &&
			hasUpdateAvailable(stored.value, props.theme),
	);

	function select(): void {
		if (props.selectable) {
			void router.push({
				name: 'theme',
				params: { tab: props.tab, id: String(props.theme.id) },
			});
		}
	}

	function openEditor(): void {
		void router.push({
			name: 'editor',
			params: { tab: props.tab, id: String(props.theme.id) },
		});
	}

	return {
		t,
		author,
		authorLink,
		isAllSites,
		linkText,
		isEdited,
		isSelected,
		checked,
		updateAvailable,
		select,
		openEditor,
	};
}
