import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import unicorn from 'eslint-plugin-unicorn';
import promise from 'eslint-plugin-promise';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
	{
		ignores: [
			'dist',
			'node_modules',
			'coverage',
			'**/*.config.{js,ts}',
			'**/*.html',
		],
	},

	js.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	...pluginVue.configs['flat/recommended'],

	{
		languageOptions: {
			globals: { ...globals.browser, chrome: 'readonly' },
			parserOptions: {
				parser: tseslint.parser,
				project: [
					'./tsconfig.json',
					'./tsconfig.test.json',
					'./tsconfig.node.json',
				],
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.vue'],
			},
		},
		plugins: {
			unicorn,
			promise,
			perfectionist,
		},
		rules: {
			// Quality gates
			eqeqeq: ['error', 'always'],
			curly: ['error', 'multi-line'],
			'no-console': [
				'warn',
				{ allow: ['warn', 'error', 'info', 'debug'] },
			],
			'no-implicit-coercion': 'error',
			'object-shorthand': 'error',
			'prefer-template': 'error',

			// TS — modern best practice
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ fixStyle: 'inline-type-imports' },
			],
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': [
				'error',
				{ checksVoidReturn: { attributes: false } },
			],
			'@typescript-eslint/no-unnecessary-condition': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{ allowNumber: true, allowBoolean: true },
			],
			'@typescript-eslint/no-confusing-void-expression': [
				'error',
				{ ignoreArrowShorthand: true },
			],
			// `@types/chrome` marks the entire `chrome` namespace as deprecated (legacy
			// Chrome Apps), but for MV3 extensions it's the only API. False positive
			// across the codebase — disable globally.
			'@typescript-eslint/no-deprecated': 'off',

			'@typescript-eslint/naming-convention': [
				'error',
				{ selector: 'typeLike', format: ['PascalCase'] },
				{ selector: 'function', format: ['camelCase'] },
				{
					selector: 'parameter',
					format: ['camelCase'],
					leadingUnderscore: 'allow',
				},
				{
					selector: 'variable',
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'allow',
				},
				{
					selector: [
						'objectLiteralProperty',
						'typeProperty',
						'classProperty',
					],
					format: null,
				},
				{
					selector: 'enumMember',
					format: ['UPPER_CASE', 'PascalCase'],
				},
			],

			// Promises
			'promise/no-return-wrap': 'error',
			'promise/param-names': 'error',
			'promise/no-nesting': 'warn',

			// Imports — sort and group consistently
			'perfectionist/sort-imports': [
				'error',
				{
					type: 'natural',
					order: 'asc',
					groups: [
						'type',
						['builtin', 'external'],
						'internal-type',
						'internal',
						['parent-type', 'sibling-type', 'index-type'],
						['parent', 'sibling', 'index'],
						'style',
					],
					internalPattern: ['@/.+'],
					newlinesBetween: 'ignore',
				},
			],

			// Filenames — kebab-case for .ts, PascalCase for .vue (overrides below)
			'unicorn/filename-case': ['error', { case: 'kebabCase' }],
			'unicorn/prefer-node-protocol': 'error',
			'unicorn/no-useless-undefined': 'off', // collides with Vue v-model defaults

			// Vue 3 — enforce modern composition style
			'vue/component-api-style': [
				'error',
				['script-setup', 'composition'],
			],
			'vue/define-macros-order': [
				'error',
				{ order: ['defineProps', 'defineEmits', 'defineModel'] },
			],
			'vue/define-props-declaration': ['error', 'type-based'],
			'vue/define-emits-declaration': ['error', 'type-based'],
			'vue/block-lang': ['error', { script: { lang: 'ts' } }],
			'vue/prefer-true-attribute-shorthand': 'error',
			'vue/no-unused-refs': 'error',
			'vue/multi-word-component-names': 'off', // Icon, Loader etc are fine
			'vue/attribute-hyphenation': ['error', 'always'],
			'vue/v-on-event-hyphenation': ['error', 'always'],
		},
	},

	// HTML entry points (popup index.html) and other non-source files don't need
	// the kebab-case rule
	{ files: ['**/*.html'], rules: { 'unicorn/filename-case': 'off' } },

	// Tests: looser rules where pragmatism beats purity
	{
		files: ['tests/**/*.ts'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			// Mock signatures often need to be async to match the real type
			'@typescript-eslint/require-await': 'off',
		},
	},

	prettier,
);
