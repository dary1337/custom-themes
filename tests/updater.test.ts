import type { RepoTheme, UserSettings, UserTheme } from '@/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installChromeMock } from './chrome-mock';

installChromeMock();

const { updateTheme, updateAllThemes, hasUpdateAvailable } =
	await import('@/services/updater');

function repoTheme(over: Partial<RepoTheme> = {}): RepoTheme {
	return {
		id: 1,
		name: 'Repo Theme',
		link: 'https://example.com',
		cssLink: 'https://cdn/theme.css',
		version: '1.0.0',
		...over,
	};
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('updateTheme', () => {
	it('fetches remote source and compiles for a clean repo theme', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('a { color: red; }')),
		);
		const userSettings: UserSettings = {};
		const source = await updateTheme(userSettings, repoTheme(), true);

		expect(source).toBe('a { color: red; }');
		const stored = userSettings['1'];
		expect(stored.compiledCss).toContain('!important');
		expect(stored.checked).toBe(true);
		expect(stored.edited).toBe(false);
		expect(stored.sourceCSS).toBe(''); // clean themes don't persist source
		expect(stored.version).toBe('1.0.0');
	});

	it('removes a clean theme when unchecked', async () => {
		const userSettings: UserSettings = {
			'1': {
				id: 1,
				name: 'X',
				link: '',
				checked: true,
				compiledCss: 'x',
				sourceCSS: '',
				edited: false,
				local: false,
			},
		};
		const result = await updateTheme(userSettings, repoTheme(), false);
		expect(result).toBeUndefined();
		expect(userSettings['1']).toBeUndefined();
	});

	it('keeps an edited theme when toggled off via a RepoTheme', async () => {
		const userSettings: UserSettings = {
			'1': {
				id: 1,
				name: 'X',
				link: '',
				checked: true,
				compiledCss: 'old',
				sourceCSS: 'c { color: green; }',
				edited: true,
				local: false,
			},
		};
		// theme-card toggles with a RepoTheme that carries no edited/local flags.
		await updateTheme(userSettings, repoTheme(), false);
		expect(userSettings['1']).toBeDefined();
		expect(userSettings['1'].checked).toBe(false);
		expect(userSettings['1'].sourceCSS).toBe('c { color: green; }');
	});

	it('persists source and marks edited when customCSS is provided', async () => {
		const userSettings: UserSettings = {};
		await updateTheme(
			userSettings,
			repoTheme(),
			true,
			'b { color: blue; }',
		);
		const stored = userSettings['1'];
		expect(stored.edited).toBe(true);
		expect(stored.sourceCSS).toBe('b { color: blue; }');
		expect(stored.compiledCss).toContain('color: blue !important');
	});

	it('reuses stored source for an edited theme instead of fetching', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const userSettings: UserSettings = {
			'1': {
				id: 1,
				name: 'X',
				link: '',
				checked: true,
				compiledCss: 'old',
				sourceCSS: 'c { color: green; }',
				edited: true,
				local: false,
			},
		};
		await updateTheme(userSettings, repoTheme(), true);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(userSettings['1'].compiledCss).toContain(
			'color: green !important',
		);
		// Editing must not wipe the stored source when re-saved without customCSS.
		expect(userSettings['1'].sourceCSS).toBe('c { color: green; }');
		expect(userSettings['1'].edited).toBe(true);
	});

	it('does not store when source resolves empty', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('')),
		);
		const userSettings: UserSettings = {};
		const result = await updateTheme(userSettings, repoTheme(), true);
		expect(result).toBeUndefined();
		expect(userSettings['1']).toBeUndefined();
	});
});

describe('updateAllThemes', () => {
	it('updates only enabled, clean repo themes', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('a { color: red; }')),
		);
		const userSettings: UserSettings = {
			'1': {
				id: 1,
				name: 'clean',
				link: '',
				checked: true,
				compiledCss: '',
				sourceCSS: '',
				edited: false,
				local: false,
			},
			'2': {
				id: 2,
				name: 'edited',
				link: '',
				checked: true,
				compiledCss: '',
				sourceCSS: 'x',
				edited: true,
				local: false,
			},
			'3': {
				id: 3,
				name: 'off',
				link: '',
				checked: false,
				compiledCss: '',
				sourceCSS: '',
				edited: false,
				local: false,
			},
		};
		const repos = {
			"Author's": [
				repoTheme({ id: 1 }),
				repoTheme({ id: 2 }),
				repoTheme({ id: 3 }),
			],
			Community: [],
		};
		await updateAllThemes(userSettings, repos);

		expect(userSettings['1'].compiledCss).toContain('!important');
		expect(userSettings['2'].compiledCss).toBe(''); // edited untouched
		expect(userSettings['3'].compiledCss).toBe(''); // disabled untouched
	});
});

describe('hasUpdateAvailable', () => {
	const stored = (over: Partial<UserTheme>): UserTheme => ({
		id: 1,
		name: 'X',
		link: '',
		checked: true,
		compiledCss: '',
		sourceCSS: '',
		edited: false,
		local: false,
		version: '1.0.0',
		...over,
	});

	it('is true when versions differ on a clean theme', () => {
		expect(
			hasUpdateAvailable(stored({ version: '1.0.0' }), {
				version: '1.0.1',
			}),
		).toBe(true);
	});
	it('is false when versions match', () => {
		expect(
			hasUpdateAvailable(stored({ version: '1.0.1' }), {
				version: '1.0.1',
			}),
		).toBe(false);
	});
	it('is false for edited themes', () => {
		expect(
			hasUpdateAvailable(stored({ edited: true }), { version: '9.9.9' }),
		).toBe(false);
	});
	it('is false when not stored', () => {
		expect(hasUpdateAvailable(undefined, { version: '1.0.0' })).toBe(false);
	});
});
