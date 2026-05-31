import type { RepoTheme, UserTheme } from '@/shared/types';
import { loadStyles, type UpdatableTheme } from '@/services/updater';
import { ALL_SITES } from '@/shared/constants';
import { useThemesStore } from '@/stores/themes';
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

export interface ThemeEditorPageProps {
	tab: string;
	id: string;
}

export interface AceEditorExposed {
	format: () => void;
}

export interface ThemeEditorPageState {
	t: ReturnType<typeof useI18n>['t'];
	editorRef: Ref<AceEditorExposed | undefined>;
	code: Ref<string>;
	name: Ref<string>;
	link: Ref<string>;
	loading: Ref<boolean>;
	stored: ComputedRef<UserTheme | undefined>;
	repoTheme: ComputedRef<RepoTheme | undefined>;
	isLocal: ComputedRef<boolean>;
	dirty: ComputedRef<boolean>;
	save: () => Promise<void>;
	restore: () => Promise<void>;
	back: () => void;
}

function normalizeLink(value: string): string {
	const trimmed = value.trim();
	if (!trimmed || trimmed === ALL_SITES) return trimmed;
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

export function useThemeEditorPage(
	props: ThemeEditorPageProps,
): ThemeEditorPageState {
	const { t } = useI18n();
	const router = useRouter();
	const themes = useThemesStore();

	const editorRef = ref<AceEditorExposed>();
	const code = ref('');
	const loadedSource = ref('');
	const name = ref('');
	const link = ref('');
	const loading = ref(true);
	const saving = ref(false);

	const stored = computed(() => themes.get(props.id));
	const repoTheme = computed<RepoTheme | undefined>(() => {
		const all = [
			...(themes.repos?.["Author's"] ?? []),
			...(themes.repos?.Community ?? []),
		];
		return all.find((theme) => String(theme.id) === props.id);
	});
	const isLocal = computed(() => stored.value?.local ?? false);
	const target = computed<UpdatableTheme | undefined>(() =>
		isLocal.value ? stored.value : repoTheme.value,
	);

	const dirty = computed(() => {
		if (code.value !== loadedSource.value) return true;
		if (!isLocal.value) return false;
		const current = stored.value;
		if (!current) return false;
		return name.value !== current.name || link.value !== current.link;
	});

	async function loadSource(): Promise<void> {
		loading.value = true;
		try {
			const s = stored.value;
			name.value = s?.name ?? '';
			link.value = s?.link ?? '';
			let source = '';
			if (isLocal.value || s?.edited) source = s?.sourceCSS ?? '';
			else if (repoTheme.value)
				source = await loadStyles(repoTheme.value.cssLink);
			loadedSource.value = source;
			code.value = source;
		} finally {
			loading.value = false;
		}
	}

	onMounted(() => {
		void loadSource();
	});

	async function save(): Promise<void> {
		if (!target.value || saving.value) return;
		saving.value = true;
		try {
			const patch = isLocal.value
				? { name: name.value, link: normalizeLink(link.value) }
				: undefined;
			await themes.saveEdit(target.value, code.value, patch);
			// Beautify the editor, then sync `code`/`loadedSource` to the formatted
			// value so `dirty` stays false right after saving.
			editorRef.value?.format();
			loadedSource.value = code.value;
		} finally {
			saving.value = false;
		}
	}

	async function restore(): Promise<void> {
		if (!repoTheme.value) return;
		loading.value = true;
		try {
			await themes.restore(repoTheme.value);
		} finally {
			// Always reload (and reset loading) even if the restore fetch fails.
			await loadSource();
		}
	}

	function back(): void {
		void router.push({
			name: 'theme',
			params: { tab: props.tab, id: props.id },
		});
	}

	return {
		t,
		editorRef,
		code,
		name,
		link,
		loading,
		stored,
		repoTheme,
		isLocal,
		dirty,
		save,
		restore,
		back,
	};
}
