import { defineManifest } from '@crxjs/vite-plugin';
import pkg from '../package.json';

export default defineManifest({
	manifest_version: 3,
	name: 'Custom Themes',
	version: pkg.version,
	description: '__MSG_Description__',
	default_locale: 'en',
	permissions: ['scripting', 'storage', 'webNavigation', 'alarms'],
	host_permissions: ['https://*/*'],
	content_security_policy: {
		extension_pages: "script-src 'self'; object-src 'none'",
	},
	action: {
		default_popup: 'src/popup/index.html',
	},
	background: {
		service_worker: 'src/background/index.ts',
		type: 'module',
	},
	icons: {
		'16': 'assets/icons/icon16.png',
		'32': 'assets/icons/icon32.png',
	},
});
