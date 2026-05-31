import type { MessageSchema } from './en';

export const ru: MessageSchema = {
	appName: 'Custom Themes',
	github: 'Github',
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
		createTheme: 'Создать тему',
		importTheme: 'Импортировать',
		importThemes: 'Импортировать темы',
		exportThemes: 'Экспортировать локальные темы',
		resetExtension: 'Сбросить расширение',
		loadLocalVersion: 'Загрузить локальную версию',
	},
	settings: {
		useLocalJsonRepo: {
			name: 'Использовать локальный файл тем',
			description: 'Отключить обновление доступных тем',
		},
		checkForUpdate: {
			name: 'Проверять обновления',
			description: 'Уведомляет только о важных обновлениях',
		},
		showScreenshots: {
			name: 'Показывать скриншоты в информации о теме',
			description: '',
		},
		backgroundUpdate: {
			name: 'Обновлять темы в фоновом режиме',
			description:
				'Происходит раз в день. Последнее обновление: {lastUpdate}',
		},
	},
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
		updateAvailable: 'Доступно обновление',
		reposUnavailable: 'Репозиторий недоступен',
		confirmReset: 'Вы уверены, что хотите сбросить все данные?',
	},
	titles: {
		settings: 'Настройки',
		about: 'О расширении',
		openInWindow: 'Открыть в окне',
	},
	labels: {
		website: 'Веб-сайт',
		author: 'Автор',
		source: 'Источник',
		version: 'Версия',
		selectTheme: 'Выберите тему слева или создайте новую',
		noScreenshots:
			'*Возможно, есть скриншоты в репозитории, посмотрите в источнике',
		linkPlaceholder: 'https://example.com или *',
		search: 'Поиск',
		openSearch: 'Открыть поиск',
		closeSearch: 'Закрыть поиск',
		screenshot: 'Скриншот',
	},
	about: {
		intro: 'Custom Themes — это бесплатное, созданное на энтузиазме расширение. Основная идея — поделиться моими «творениями» с людьми, а также дать эту возможность другим.',
		feedback:
			'Буду рад любой критике и предложениям в {github} или {telegram}.',
	},
	suggestTemplate:
		'Привет, я хочу предложить тему\nНазвание: {name}\nВеб-сайт: {link}\n```css\n{css}```',
};
