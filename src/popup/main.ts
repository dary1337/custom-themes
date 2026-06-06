import { i18n } from '@/i18n';
import Notifications from '@kyvg/vue3-notification';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './app.vue';
import { router } from './router';
import '@/styles/base.scss';

createApp(App)
	.use(createPinia())
	.use(router)
	.use(i18n)
	.use(Notifications)
	.mount('#app');
