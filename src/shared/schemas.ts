import { z } from 'zod';

/** repo theme ids are numeric in repos.json; local ids are strings. */
const themeIdSchema = z.union([z.string(), z.number()]);

const httpUrl = z
	.string()
	.url()
	.refine((value) => /^https?:\/\//i.test(value), {
		message: 'must use http or https scheme',
	});

export const repoThemeSchema = z.object({
	id: themeIdSchema,
	name: z.string(),
	link: z.string(),
	cssLink: httpUrl,
	version: z.string(),
	author: z.string().optional(),
	authorLink: httpUrl.optional(),
	repoLink: httpUrl.optional(),
	screenshots: z.array(httpUrl).optional(),
});

export const repoIndexSchema = z.object({
	"Author's": z.array(repoThemeSchema),
	Community: z.array(repoThemeSchema),
});

/** A single user/local theme as stored and as exported to JSON. */
export const userThemeSchema = z.object({
	id: themeIdSchema,
	name: z.string(),
	link: z.string(),
	checked: z.boolean(),
	compiledCss: z.string(),
	sourceCSS: z.string(),
	edited: z.boolean(),
	local: z.boolean(),
	version: z.string().optional(),
});

/** Import accepts either a single theme or an array (matches legacy export). */
export const importFileSchema = z.union([
	userThemeSchema,
	z.array(userThemeSchema),
]);

/** Subset of the GitHub Releases API response we actually consume. */
export const githubReleaseSchema = z.object({
	tag_name: z.string(),
	html_url: z.string().url(),
});

export type RepoThemeInput = z.input<typeof repoThemeSchema>;
export type ImportFile = z.infer<typeof importFileSchema>;
export type GithubRelease = z.infer<typeof githubReleaseSchema>;
