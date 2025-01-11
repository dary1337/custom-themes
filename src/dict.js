import { isChromeStoreBuild, links } from './conts.js';

const ru_changelog = [
	//
	'Добавлен иконка во вкладке расширений',
	'Добавлено время последнего обновления тем',
	'Исправлен баг, когда темы обновлись неправильно',
	'Исправлен баг, когда расширение увеличивало свой размер',
];

const en_changelog = [
	//
	'Added icon in extensions tab',
	'Added last time when themes were updated',
	'Fixed bug when themes were updated incorrectly',
	'Fixed bug when extension increased its size',
];

export const dictionary = {
	ru: {
		tabs: {
			fromAuthor: 'Авторские',
			community: 'Сообщества',
			local: 'Локальные',
		},
		buttons: {
			edit: 'Изменить',
			export: 'Экспорт',
			update: 'Обновить',
			updateExtension: 'Обновить расширение',
			suggestGithub: 'Предложить через GitHub',
			suggestTelegram: 'Предложить через Telegram',
			badLayout: 'Проблема с отображением?',
			restoreFromCloud: 'Восстановить версию из облака',
			saveLocally: 'Сохранить локально',
			delete: 'Удалить',
			//
			createTheme: 'Создать тему',
			importTheme: 'Импортировать',
			//
			importThemes: 'Импортировать темы',
			exportThemes: 'Экспортировать локальные темы',
			resetExtension: 'Сбросить расширение',
		},
		about: `
                    <label>
                         Custom Themes - это бесплатное, созданное на энтузиазме расширение.
                         Основная идея - поделится моими "творениями" с людьми, а также дать эту возможность другим.
                    </label>
                    <label>
                         Буду рад любой критике и предложениям в
                              <a href="${links.newIssue}" target="_blank">GitHub</a>
                              или
                              <a href="${links.telegram}" target="_blank">Telegram</a>.
                    </label>`,
		settings: [
			{
				id: 'useLocalJsonRepo',
				name: 'Использовать локальный файл тем',
				description: 'Отключить обновление доступных тем',
				default: false,
			},
			isChromeStoreBuild
				? {}
				: {
						id: 'checkForUpdate',
						name: 'Проверять обновления',
						description: 'Уведомляет только о важных обновлениях',
						default: !isChromeStoreBuild,
				  },
			{
				id: 'showScreenshots',
				name: 'Показывать скриншоты в информации о теме',
				default: true,
			},
			{
				id: 'backgroundUpdate',
				name: 'Обновлять темы в фоновом режиме',
				description: `Происходит раз в день.<br/>Последнее обновление: %%lastUpdate%%`,
				default: true,
			},
		],
		loader: {
			loadingCode: 'Загрузка кода...',
			loadingRepo: 'Получение репозитория...',
			updatingThemes: 'Обновление тем...',
			restoringTheme: 'Восстановление темы...',
		},
		strings: {
			untitled: 'Без названия',
			allSites: 'Все сайты',
			updateVer: 'Обновление',
			usedLibs: 'Использованные библиотеки',
			none: 'Нет',
			local: 'Локальная',
			copiedPreset: 'Шаблон скопирован, вставьте его в сообщение',
			somethingWrong: 'Что-то пошло не так :(',
			never: 'Никогда',
		},
		titles: {
			settings: 'Настройки',
			about: 'О расширении',
		},
		labels: {
			website: 'Веб-сайт',
			author: 'Автор',
			source: 'Источник',
			version: 'Версия',
			selectTheme: 'Выберите тему слева или создайте новую',
			noScreenshots: '*Возможно, есть скриншоты в репозитории, посмотрите в источнике',
			linkPlaceholder: 'https://example.com или *',
		},
		changelog: ru_changelog,
	},
	en: {
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
			//
			createTheme: 'Create theme',
			importTheme: 'Import theme',
			// settings
			importThemes: 'Import themes',
			exportThemes: 'Export locally themes',
			resetExtension: 'Reset extension',
		},
		about: `
                    <label>
                         Custom Themes is a free, passion-driven extension. 
                         The main idea is to share My "creations" with people, as well as give this opportunity to others.
                    </label>
                    <label>
                         I will be glad to any criticism and suggestions on 
                              <a href="${links.newIssue}" target="_blank">GitHub</a>
                              or 
                              <a href="${links.telegram}" target="_blank">Telegram</a>.
                    </label>`,
		settings: [
			{
				id: 'useLocalJsonRepo',
				name: 'Use local themes file',
				description: 'Disable updating of available themes',
				default: false,
			},
			isChromeStoreBuild
				? {}
				: {
						id: 'checkForUpdate',
						name: 'Check for updates',
						description: 'Notifies only about important updates',
						default: !isChromeStoreBuild,
				  },
			{
				id: 'showScreenshots',
				name: 'Show screenshots in theme info',
				default: true,
			},
			{
				id: 'backgroundUpdate',
				name: 'Update themes in background',
				description: `Updated every day.<br/>Last updated: %%lastUpdate%%`,
				default: true,
			},
		],
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
		},
		titles: {
			settings: 'Settings',
			about: 'About',
		},
		labels: {
			website: 'Website',
			author: 'Author',
			source: 'Source',
			version: 'Version',
			selectTheme: 'Select a theme on the left or create a new one',
			noScreenshots: '*Perhaps there are screenshots in the repository, look at the source',
			linkPlaceholder: 'https://example.com or *',
		},
		changelog: en_changelog,
	},
};
