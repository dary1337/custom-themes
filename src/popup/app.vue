<script setup lang="ts">
	import Icon from '@/popup/components/icon/icon.vue';
	import { useApp } from './app';

	const { t, releaseUrl } = useApp();
</script>

<template>
	<a
		v-if="releaseUrl"
		class="update-banner"
		:href="releaseUrl"
		target="_blank"
		rel="noopener noreferrer"
	>
		<Icon name="update" />{{ t('buttons.updateExtension') }}
	</a>

	<router-view />

	<notifications position="bottom center" :duration="3000" />
</template>

<style scoped lang="scss" src="./app.scss"></style>
