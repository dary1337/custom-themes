export const en = {
	appName: 'Custom Themes',
	github: 'Github',
	tabs: {
		fromAuthor: "Author's",
		community: 'Community',
		local: 'Local',
	},
	buttons: {
		edit: 'Edit',
		export: 'Export',
		update: 'Update',
		updateExtension: 'Update extension',
		suggestGithub: 'Suggest via GitHub',
		suggestTelegram: 'Suggest via Telegram',
		badLayout: 'Layout problem?',
		restoreFromCloud: 'Restore cloud version',
		saveLocally: 'Save locally',
		delete: 'Delete',
		createTheme: 'Create theme',
		importTheme: 'Import theme',
		importThemes: 'Import themes',
		exportThemes: 'Export local themes',
		resetExtension: 'Reset extension',
		loadLocalVersion: 'Load local version',
	},
	settings: {
		useLocalJsonRepo: {
			name: 'Use local themes file',
			description: 'Disable updating of available themes',
		},
		checkForUpdate: {
			name: 'Check for updates',
			description: 'Notifies only about important updates',
		},
		showScreenshots: {
			name: 'Show screenshots in theme info',
			description: '',
		},
		backgroundUpdate: {
			name: 'Update themes in background',
			description: 'Updated every day. Last updated: {lastUpdate}',
		},
	},
	loader: {
		loadingCode: 'Code loading...',
		loadingRepo: 'Repository fetching...',
		updatingThemes: 'Updating themes...',
		restoringTheme: 'Restoring theme...',
	},
	strings: {
		untitled: 'Untitled',
		allSites: 'All sites',
		updateVer: 'Update',
		usedLibs: 'Used libs',
		none: 'None',
		local: 'Local',
		copiedPreset: 'Preset copied, paste it into the message',
		somethingWrong: 'Something went wrong :(',
		never: 'Never',
		updateAvailable: 'Update available',
		reposUnavailable: 'Repository is not available',
		confirmReset: 'Are you sure you want to reset all data?',
	},
	titles: {
		settings: 'Settings',
		about: 'About',
		openInWindow: 'Open in window',
	},
	labels: {
		website: 'Website',
		author: 'Author',
		source: 'Source',
		version: 'Version',
		selectTheme: 'Select a theme on the left or create a new one',
		noScreenshots:
			'*Perhaps there are screenshots in the repository, look at the source',
		linkPlaceholder: 'https://example.com or *',
		search: 'Search',
		openSearch: 'Open search',
		closeSearch: 'Close search',
		screenshot: 'Screenshot',
	},
	about: {
		intro: 'Custom Themes is a free, passion-driven extension. The main idea is to share my "creations" with people, as well as give this opportunity to others.',
		feedback:
			'I will be glad to any criticism and suggestions on {github} or {telegram}.',
	},
	suggestTemplate:
		'Hi, I would like to suggest a theme\nTitle: {name}\nWebsite: {link}\n```css\n{css}```',
	changelog: [
		'Added icon in extensions tab',
		'Added last time when themes were updated',
		'Fixed bug when themes were updated incorrectly',
		'Fixed bug when extension increased its size',
	],
};

export type MessageSchema = typeof en;
