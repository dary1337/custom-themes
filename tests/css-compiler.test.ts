import { compileCss } from '@/services/css-compiler';
import { describe, expect, it, vi } from 'vitest';

describe('compileCss', () => {
	it('adds !important to declarations', async () => {
		const out = await compileCss('body { color: red; background: blue; }');
		expect(out).toContain('color: red !important');
		expect(out).toContain('background: blue !important');
	});

	it('does not double up !important', async () => {
		const out = await compileCss('a { color: red !important; }');
		expect(out.match(/!important/g)).toHaveLength(1);
	});

	it('strips comments', async () => {
		const out = await compileCss('/* hello */ a { color: red; } /* bye */');
		expect(out).not.toContain('hello');
		expect(out).not.toContain('bye');
	});

	it('does not break calc() with internal operators', async () => {
		const out = await compileCss('a { width: calc(100% - 10px); }');
		expect(out).toContain('width: calc(100% - 10px) !important');
	});

	it('does not break url(data:) values', async () => {
		const css = 'a { background: url(data:image/svg+xml;base64,AAA==); }';
		const out = await compileCss(css);
		expect(out).toContain('url(data:image/svg+xml;base64,AAA==)');
		expect(out).toContain('!important');
	});

	it('leaves @font-face declarations without !important', async () => {
		const css = '@font-face { font-family: "X"; src: url(x.woff2); }';
		const out = await compileCss(css);
		expect(out).not.toContain('!important');
	});

	it('leaves @keyframes declarations without !important', async () => {
		const css =
			'@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }';
		const out = await compileCss(css);
		expect(out).not.toContain('!important');
	});

	it('inlines @import url("...") via the loader', async () => {
		const loadCss = vi.fn(async (url: string) => {
			if (url === 'https://cdn/base.css')
				return '.base { color: green; }';
			return '';
		});
		const out = await compileCss(
			'@import url("https://cdn/base.css"); a { color: red; }',
			{ loadCss },
		);
		expect(loadCss).toHaveBeenCalledWith('https://cdn/base.css');
		expect(out).toContain('.base');
		expect(out).toContain('color: green !important');
		expect(out).toContain('color: red !important');
		expect(out).not.toContain('@import');
	});

	it('inlines nested @imports', async () => {
		const loadCss = vi.fn(async (url: string) => {
			if (url === 'a.css') return '@import url("b.css"); .a {}';
			if (url === 'b.css') return '.b { color: red; }';
			return '';
		});
		const out = await compileCss('@import url("a.css");', { loadCss });
		expect(out).toContain('.b');
		expect(out).toContain('color: red !important');
	});

	it('guards against import cycles', async () => {
		const loadCss = vi.fn(async (url: string) => {
			if (url === 'a.css')
				return '@import url("b.css"); .a { color: red; }';
			if (url === 'b.css')
				return '@import url("a.css"); .b { color: blue; }';
			return '';
		});
		const out = await compileCss('@import url("a.css");', { loadCss });
		// Each file fetched exactly once despite the cycle.
		expect(loadCss).toHaveBeenCalledTimes(2);
		expect(out).toContain('.a');
		expect(out).toContain('.b');
	});

	it('handles empty input', async () => {
		expect(await compileCss('')).toBe('');
	});
});
