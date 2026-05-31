import { describe, expect, it } from 'vitest';
import { installChromeMock } from './chrome-mock';

installChromeMock();
const { themeMatchesUrl } = await import('@/background/apply-styles');

describe('themeMatchesUrl', () => {
	it('matches the wildcard against any url', () => {
		expect(themeMatchesUrl({ link: '*' }, 'https://anything.com/x')).toBe(
			true,
		);
	});

	it('matches an exact prefix', () => {
		expect(
			themeMatchesUrl(
				{ link: 'https://youtube.com' },
				'https://youtube.com/watch',
			),
		).toBe(true);
	});

	it('matches the www. variant', () => {
		expect(
			themeMatchesUrl(
				{ link: 'https://youtube.com' },
				'https://www.youtube.com/watch',
			),
		).toBe(true);
	});

	it('does not match a different host', () => {
		expect(
			themeMatchesUrl(
				{ link: 'https://youtube.com' },
				'https://vimeo.com',
			),
		).toBe(false);
	});

	it('does not match a host-suffix lookalike', () => {
		expect(
			themeMatchesUrl(
				{ link: 'https://youtube.com' },
				'https://youtube.com.evil.com/watch',
			),
		).toBe(false);
	});

	it('does not match an empty link', () => {
		expect(themeMatchesUrl({ link: '' }, 'https://youtube.com')).toBe(
			false,
		);
	});

	it('lower-cases the link before comparing', () => {
		expect(
			themeMatchesUrl(
				{ link: 'HTTPS://YOUTUBE.COM' },
				'https://youtube.com/x',
			),
		).toBe(true);
	});
});
