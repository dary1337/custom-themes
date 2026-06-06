import postcss, { type ChildNode, type Node } from 'postcss';

export type CssLoader = (url: string) => Promise<string>;

export interface CompileOptions {
	/** How to fetch the contents of an `@import`ed stylesheet. */
	loadCss?: CssLoader;
}

const defaultLoadCss: CssLoader = async (url) => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.warn(
				'[css-compiler] failed to load import',
				url,
				response.status,
				response.statusText,
			);
			return '';
		}
		return await response.text();
	} catch (error) {
		console.warn('[css-compiler] failed to load import', url, error);
		return '';
	}
};

/** At-rules whose descendant declarations must not receive `!important`. */
const NO_IMPORTANT_AT_RULES = new Set([
	'font-face',
	'keyframes',
	'-webkit-keyframes',
]);

/** Extract the URL from an `@import` params string: url("x") | url(x) | "x". */
function parseImportUrl(params: string): string | null {
	const trimmed = params.trim();
	const urlMatch = /^url\(\s*(['"]?)([^'")]+)\1\s*\)/i.exec(trimmed);
	if (urlMatch?.[2]) return urlMatch[2].trim();
	const stringMatch = /^(['"])([^'"]+)\1/.exec(trimmed);
	if (stringMatch?.[2]) return stringMatch[2].trim();
	return null;
}

function hasNoImportantAncestor(node: ChildNode): boolean {
	let current: Node | undefined = node.parent;
	while (current) {
		if (
			current.type === 'atrule' &&
			// `type === 'atrule'` is a runtime tag, not a TS discriminant on the
			// base `Node`, so the assertion is what unlocks `.name`.
			NO_IMPORTANT_AT_RULES.has(
				(current as postcss.AtRule).name.toLowerCase(),
			)
		) {
			return true;
		}
		current = current.parent;
	}
	return false;
}

/** Recursively inline `@import`ed stylesheets, guarding against cycles. */
async function inlineImports(
	css: string,
	loadCss: CssLoader,
	seen: Set<string>,
): Promise<string> {
	const root = postcss.parse(css);
	const imports: { node: postcss.AtRule; url: string }[] = [];

	root.walkAtRules('import', (rule) => {
		const url = parseImportUrl(rule.params);
		if (url) imports.push({ node: rule, url });
	});

	await Promise.all(
		imports.map(async ({ node, url }) => {
			if (seen.has(url)) {
				node.remove();
				return;
			}
			seen.add(url);
			const imported = await loadCss(url);
			const inlined = await inlineImports(imported, loadCss, seen);
			node.replaceWith(postcss.parse(inlined));
		}),
	);

	return root.toString();
}

const stripComments: postcss.Plugin = {
	postcssPlugin: 'strip-comments',
	OnceExit(root) {
		root.walkComments((comment) => {
			comment.remove();
		});
	},
};

const addImportant: postcss.Plugin = {
	postcssPlugin: 'add-important',
	OnceExit(root) {
		root.walkDecls((decl) => {
			if (decl.important) return;
			if (hasNoImportantAncestor(decl)) return;
			decl.important = true;
		});
	},
};

/**
 * Compile a theme's source CSS into the form that gets injected into pages:
 * remote `@import`s are inlined, comments stripped, and `!important` is added
 * to every declaration so themes reliably override site styles. Declarations
 * inside `@font-face`/`@keyframes` are left untouched (where `!important` is
 * invalid and would drop the rule).
 */
export async function compileCss(
	source = '',
	options: CompileOptions = {},
): Promise<string> {
	const loadCss = options.loadCss ?? defaultLoadCss;
	const inlined = await inlineImports(source, loadCss, new Set());
	const result = await postcss([stripComments, addImportant]).process(
		inlined,
		{ from: undefined },
	);
	return result.css.trim();
}
