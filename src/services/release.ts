import { releaseByTagUrl } from '@/shared/constants';
import { githubReleaseSchema } from '@/shared/schemas';

/** Turn a release's markdown body into clean, bullet-free changelog lines. */
function parseNotes(body: string | null | undefined): string[] {
	if (!body) return [];
	return body
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith('#'))
		.map((line) => line.replace(/^[-*+]\s+/, ''));
}

async function fetchNotesForTag(tag: string): Promise<string[] | undefined> {
	try {
		const response = await fetch(releaseByTagUrl(tag));
		if (!response.ok) return undefined;
		const release = githubReleaseSchema.parse(await response.json());
		return parseNotes(release.body);
	} catch (error) {
		console.warn('[release] failed to load release notes', tag, error);
		return undefined;
	}
}

/**
 * Changelog for the installed version, read from its GitHub release body.
 * Tries the `v`-prefixed tag first, then the bare version; returns an empty
 * list when the release is missing or the network is unavailable.
 */
export async function fetchReleaseNotes(version: string): Promise<string[]> {
	return (
		(await fetchNotesForTag(`v${version}`)) ??
		(await fetchNotesForTag(version)) ??
		[]
	);
}
