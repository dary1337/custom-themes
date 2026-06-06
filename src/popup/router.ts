import {
	createRouter,
	createWebHashHistory,
	type RouteRecordRaw,
} from 'vue-router';

const routes: RouteRecordRaw[] = [
	{ path: '/', redirect: "/themes/Author's" },
	{
		path: '/themes/:tab',
		name: 'themes',
		component: () => import('./pages/themes-page/themes-page.vue'),
		props: true,
		children: [
			{
				path: ':id',
				name: 'theme',
				component: () =>
					import('./pages/theme-details-page/theme-details-page.vue'),
				props: true,
			},
			{
				path: ':id/edit',
				name: 'editor',
				component: () =>
					import('./pages/theme-editor-page/theme-editor-page.vue'),
				props: true,
			},
		],
	},
	{
		path: '/settings',
		name: 'settings',
		component: () => import('./pages/settings-page/settings-page.vue'),
	},
	{
		path: '/about',
		name: 'about',
		component: () => import('./pages/about-page/about-page.vue'),
	},
];

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
});
