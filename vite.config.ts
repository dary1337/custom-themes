import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest';

/**
 * `repos.json` is the published theme index; it must live at the repo root so
 * the GitHub raw URL keeps working for already-installed extensions. This copies
 * it into the bundle (for the offline/local fallback) and serves it in dev.
 */
function bundleReposJson(): Plugin {
	const reposPath = fileURLToPath(new URL('./repos.json', import.meta.url));
	return {
		name: 'bundle-repos-json',
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'repos.json',
				source: readFileSync(reposPath, 'utf-8'),
			});
		},
		configureServer(server) {
			server.middlewares.use('/repos.json', (_req, res) => {
				res.setHeader('Content-Type', 'application/json');
				res.end(readFileSync(reposPath, 'utf-8'));
			});
		},
	};
}

export default defineConfig({
	plugins: [vue(), crx({ manifest }), bundleReposJson()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		target: 'esnext',
		// The Ace editor (~650 KB) is lazy-loaded only on the editor route.
		chunkSizeWarningLimit: 700,
		rollupOptions: {
			input: {
				popup: 'src/popup/index.html',
			},
		},
	},
	server: {
		port: 5173,
		strictPort: true,
		hmr: {
			port: 5173,
		},
	},
});
