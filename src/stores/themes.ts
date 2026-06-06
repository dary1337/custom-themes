import type {
	RepoIndex,
	RepoTheme,
	ThemeId,
	UserSettings,
	UserTheme,
} from '@/shared/types';
import { mergeImported } from '@/services/exporter';
import { loadRepos } from '@/services/repo';
import {
	getUserSettings,
	setExtensionSetting,
	setUserSettings,
} from '@/services/storage';
import {
	type UpdatableTheme,
	updateAllThemes,
	updateTheme,
} from '@/services/updater';
import { sendMessage } from '@/shared/messaging';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useSettingsStore } from './settings';

function randomId(): string {
	return crypto.randomUUID();
}

export const useThemesStore = defineStore('themes', () => {
	const settingsStore = useSettingsStore();

	const repos = ref<RepoIndex>();
	const userSettings = ref<UserSettings>({});
	const reposLoading = ref(false);

	const reposAvailable = computed(() =>
		Boolean(repos.value?.["Author's"]?.length),
	);
	const localThemes = computed<UserTheme[]>(() =>
		Object.values(userSettings.value).filter((t) => t.local),
	);
	const hasLocalThemes = computed(() => localThemes.value.length > 0);

	function get(id: ThemeId): UserTheme | undefined {
		return userSettings.value[String(id)];
	}

	async function loadUserSettings(): Promise<void> {
		userSettings.value = await getUserSettings();
	}

	async function loadReposIndex(): Promise<void> {
		reposLoading.value = true;
		try {
			repos.value = await loadRepos(
				settingsStore.settings.useLocalJsonRepo,
			);
		} finally {
			reposLoading.value = false;
		}
	}

	/**
	 * Persist a mutation produced by the updater service and refresh state.
	 * Deep-cloned so callers can safely mutate nested fields without touching
	 * the live ref.
	 */
	async function mutate(
		fn: (draft: UserSettings) => Promise<unknown>,
	): Promise<void> {
		// `userSettings.value` is a Vue reactive proxy, which `structuredClone`
		// can't clone (DataCloneError). The data is pure JSON (it's what we
		// persist), so a JSON round-trip both deep-clones and strips reactivity.
		const draft = JSON.parse(
			JSON.stringify(userSettings.value),
		) as UserSettings;
		await fn(draft);
		userSettings.value = draft;
	}

	async function toggle(
		theme: UpdatableTheme,
		checked: boolean,
	): Promise<void> {
		await mutate((draft) => updateTheme(draft, theme, checked));
		await sendMessage({ type: 'APPLY_ACTIVE_TAB' });
	}

	async function saveEdit(
		theme: UpdatableTheme,
		sourceCSS: string,
		patch?: { name?: string; link?: string },
	): Promise<void> {
		const merged: UpdatableTheme = { ...theme, ...patch };
		const checked = get(theme.id)?.checked ?? true;
		await mutate((draft) =>
			updateTheme(draft, merged, checked, sourceCSS || ' '),
		);
		await sendMessage({ type: 'APPLY_ACTIVE_TAB' });
	}

	/** Discard local edits to a repo theme and re-fetch the published version. */
	async function restore(repoTheme: RepoTheme): Promise<void> {
		await mutate(async (draft) => {
			const existing = draft[String(repoTheme.id)];
			const wasChecked = existing?.checked ?? true;
			if (existing) existing.edited = false;
			await updateTheme(draft, repoTheme, wasChecked);
		});
		await sendMessage({ type: 'APPLY_ACTIVE_TAB' });
	}

	async function createLocal(name: string): Promise<UserTheme> {
		const theme: UserTheme = {
			id: randomId(),
			name,
			link: '',
			checked: true,
			compiledCss: '',
			sourceCSS: '',
			edited: false,
			local: true,
		};
		userSettings.value = {
			...userSettings.value,
			[String(theme.id)]: theme,
		};
		await setUserSettings(userSettings.value);
		return theme;
	}

	async function remove(id: ThemeId): Promise<void> {
		const next = { ...userSettings.value };
		Reflect.deleteProperty(next, String(id));
		userSettings.value = next;
		await setUserSettings(next);
	}

	async function importThemes(themes: UserTheme[]): Promise<void> {
		userSettings.value = mergeImported(userSettings.value, themes);
		await setUserSettings(userSettings.value);
	}

	async function updateAll(): Promise<void> {
		const current = repos.value;
		if (!current) return;
		await mutate((draft) => updateAllThemes(draft, current));
		await setExtensionSetting('lastThemesUpdate', Date.now());
	}

	return {
		repos,
		userSettings,
		reposLoading,
		reposAvailable,
		localThemes,
		hasLocalThemes,
		get,
		loadUserSettings,
		loadReposIndex,
		toggle,
		saveEdit,
		restore,
		createLocal,
		remove,
		importThemes,
		updateAll,
	};
});
