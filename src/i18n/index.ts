import type { Locale } from '@/shared/types';
import { createI18n } from 'vue-i18n';
import { en } from './en';
import { ru } from './ru';

function detectLocale(): Locale {
	return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export const i18n = createI18n({
	legacy: false,
	locale: detectLocale(),
	fallbackLocale: 'en',
	messages: { en, ru },
});
