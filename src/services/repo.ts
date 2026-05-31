import type { RepoIndex } from '@/shared/types';
import { links } from '@/shared/constants';
import { repoIndexSchema } from '@/shared/schemas';
import { getRepos, setRepos } from './storage';

function parseRepoIndex(data: unknown): RepoIndex | undefined {
	const result = repoIndexSchema.safeParse(data);
	if (!result.success) {
		console.warn(
			'[repo] repos.json failed validation',
			result.error.issues,
		);
		return undefined;
	}
	return result.data;
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
	const response = await fetch(url, init);
	if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
	return response.json();
}

async function loadBundledRepos(): Promise<RepoIndex | undefined> {
	try {
		return parseRepoIndex(
			await fetchJson(chrome.runtime.getURL('repos.json')),
		);
	} catch (error) {
		console.warn('[repo] failed to load bundled repos.json', error);
		return undefined;
	}
}

/**
 * Resolve the theme index. When `useLocal` is set the bundled file is used and
 * the network is never touched. Otherwise the remote index is fetched, cached,
 * and validated; on any failure we fall back to the last cached copy and then
 * to the bundled file.
 */
export async function loadRepos(
	useLocal = false,
): Promise<RepoIndex | undefined> {
	if (useLocal) {
		return (await loadBundledRepos()) ?? (await getRepos());
	}

	try {
		const remote = parseRepoIndex(
			await fetchJson(links.reposJson, { cache: 'no-cache' }),
		);
		if (remote) {
			await setRepos(remote);
			return remote;
		}
	} catch (error) {
		console.warn('[repo] failed to fetch remote repos.json', error);
	}

	return (await getRepos()) ?? (await loadBundledRepos());
}
