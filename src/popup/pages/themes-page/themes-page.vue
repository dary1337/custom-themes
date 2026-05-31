<script setup lang="ts">
	import AppFooter from '@/popup/components/app-footer/app-footer.vue';
	import Icon from '@/popup/components/icon/icon.vue';
	import Loader from '@/popup/components/loader/loader.vue';
	import TabBar from '@/popup/components/tab-bar/tab-bar.vue';
	import ThemeCard from '@/popup/components/theme-card/theme-card.vue';
	import { type ThemesPageProps, useThemesPage } from './themes-page';

	const props = defineProps<ThemesPageProps>();

	const {
		t,
		themes,
		settings,
		ui,
		full,
		activeTab,
		displayedThemes,
		showRepoError,
		hasDetail,
		promptImport,
		createTheme,
		loadLocalRepos,
	} = useThemesPage(props);
</script>

<template>
	<div class="layout" :class="{ full }">
		<main class="list-pane">
			<h1>{{ t('appName') }}</h1>
			<TabBar :current-tab="activeTab" />

			<div
				v-if="full && activeTab === 'Local' && !ui.search"
				class="local-actions"
			>
				<button @click="createTheme">
					<Icon name="add" />{{ t('buttons.createTheme') }}
				</button>
				<button @click="promptImport">
					<Icon name="import" />{{ t('buttons.importTheme') }}
				</button>
			</div>

			<Loader
				v-if="themes.reposLoading"
				:label="t('loader.loadingRepo')"
			/>

			<div v-else-if="showRepoError" class="repo-error">
				<label class="dimmed">{{
					t('strings.reposUnavailable')
				}}</label>
				<button
					v-if="!settings.settings.useLocalJsonRepo"
					@click="loadLocalRepos"
				>
					{{ t('buttons.loadLocalVersion') }}
				</button>
			</div>

			<div v-else class="cards">
				<ThemeCard
					v-for="theme in displayedThemes"
					:key="String(theme.id)"
					:theme="theme"
					:tab="activeTab"
					:selectable="full"
				/>
			</div>

			<AppFooter />
		</main>

		<section v-if="full" class="detail-pane">
			<router-view v-if="hasDetail" />
			<div v-else class="empty no-select">
				<label class="dimmed">{{ t('labels.selectTheme') }}</label>
				<button class="create" @click="createTheme">
					<Icon name="add" />{{ t('buttons.createTheme') }}
				</button>
			</div>
		</section>
	</div>
</template>

<style scoped lang="scss" src="./themes-page.scss"></style>
