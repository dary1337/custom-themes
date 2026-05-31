<script setup lang="ts">
	import Icon from '@/popup/components/icon/icon.vue';
	import Loader from '@/popup/components/loader/loader.vue';
	import { useAppFooter } from './app-footer';

	const { t, router, links, full, updating, updateThemes, openFullWindow } =
		useAppFooter();
</script>

<template>
	<footer class="footer no-select">
		<Loader v-if="updating" :label="t('loader.updatingThemes')" />
		<template v-else>
			<a :href="links.repo" target="_blank" rel="noopener noreferrer">{{
				t('github')
			}}</a>
			<div class="actions">
				<button
					class="icon-btn"
					:title="t('buttons.update')"
					@click="updateThemes"
				>
					<Icon name="update" />
				</button>
				<button
					class="icon-btn"
					:title="t('titles.settings')"
					@click="router.push('/settings')"
				>
					<Icon name="settings" />
				</button>
				<button
					v-if="!full"
					class="icon-btn"
					:title="t('titles.openInWindow')"
					@click="openFullWindow"
				>
					<Icon name="openInNew" />
				</button>
				<button
					class="icon-btn"
					:title="t('titles.about')"
					@click="router.push('/about')"
				>
					<Icon name="info" />
				</button>
			</div>
		</template>
	</footer>
</template>

<style scoped lang="scss" src="./app-footer.scss"></style>
