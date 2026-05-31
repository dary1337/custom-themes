import type { UserSettings, UserTheme } from '@/shared/types';
import {
	mergeImported,
	parseImport,
	serializeThemes,
} from '@/services/exporter';
import { describe, expect, it } from 'vitest';

function theme(over: Partial<UserTheme> & { id: UserTheme['id'] }): UserTheme {
	return {
		name: 'T',
		link: '',
		checked: true,
		compiledCss: '',
		sourceCSS: 'a{}',
		edited: false,
		local: true,
		...over,
	};
}

const settings: UserSettings = {
	local1: theme({ id: 'local1' }),
	local2: theme({ id: 'local2' }),
	remote: theme({ id: 9, local: false }),
};

describe('serializeThemes', () => {
	it('exports all local themes when no id given', () => {
		const parsed = JSON.parse(serializeThemes(settings)) as UserTheme[];
		expect(parsed).toHaveLength(2);
		expect(parsed.every((t) => t.local)).toBe(true);
	});

	it('exports a single theme by id', () => {
		const parsed = JSON.parse(
			serializeThemes(settings, 'local1'),
		) as UserTheme;
		expect(parsed.id).toBe('local1');
	});
});

describe('parseImport', () => {
	it('parses a single theme object', () => {
		const out = parseImport(serializeThemes(settings, 'local1'));
		expect(out).toHaveLength(1);
		expect(out[0].id).toBe('local1');
	});

	it('parses an array of themes', () => {
		const out = parseImport(serializeThemes(settings));
		expect(out).toHaveLength(2);
	});

	it('rejects malformed JSON', () => {
		expect(() => parseImport('{ not json')).toThrow();
	});

	it('rejects data failing schema validation', () => {
		expect(() => parseImport(JSON.stringify({ id: 'x' }))).toThrow();
	});
});

describe('mergeImported', () => {
	it('adds imported themes without mutating the original', () => {
		const original: UserSettings = {};
		const merged = mergeImported(original, [theme({ id: 'new' })]);
		expect(merged.new).toBeDefined();
		expect(original.new).toBeUndefined();
	});

	it('overwrites by id', () => {
		const merged = mergeImported(settings, [
			theme({ id: 'local1', name: 'Replaced' }),
		]);
		expect(merged.local1.name).toBe('Replaced');
	});
});
