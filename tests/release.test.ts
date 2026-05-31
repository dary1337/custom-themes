import { fetchReleaseNotes } from '@/services/release';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installChromeMock } from './chrome-mock';

beforeEach(() => {
	vi.restoreAllMocks();
	installChromeMock();
});

function releaseResponse(body: string): Response {
	return new Response(
		JSON.stringify({
			tag_name: 'v1.2.0',
			html_url: 'https://github.com/x/y/releases/tag/v1.2.0',
			body,
		}),
		{ status: 200 },
	);
}

describe('fetchReleaseNotes', () => {
	it('parses and strips bullet markers and headings from the body', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () =>
				releaseResponse('## Notes\n- Added X\n* Fixed Y\n\nPlain line'),
			),
		);
		expect(await fetchReleaseNotes('1.2.0')).toEqual([
			'Added X',
			'Fixed Y',
			'Plain line',
		]);
	});

	it('falls back to the bare tag when the v-prefixed tag is missing', async () => {
		const fetchMock = vi.fn(async (url: string) =>
			url.endsWith('/v1.2.0')
				? new Response('', { status: 404 })
				: releaseResponse('- Only bare'),
		);
		vi.stubGlobal('fetch', fetchMock);

		expect(await fetchReleaseNotes('1.2.0')).toEqual(['Only bare']);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('returns an empty list when no release exists', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('', { status: 404 })),
		);
		expect(await fetchReleaseNotes('9.9.9')).toEqual([]);
	});

	it('caches notes and skips the network on the next call', async () => {
		const fetchMock = vi.fn(async () => releaseResponse('- Cached'));
		vi.stubGlobal('fetch', fetchMock);

		expect(await fetchReleaseNotes('1.2.0')).toEqual(['Cached']);
		expect(await fetchReleaseNotes('1.2.0')).toEqual(['Cached']);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
