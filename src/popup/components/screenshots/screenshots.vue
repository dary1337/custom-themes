<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import { type ScreenshotsProps, useScreenshots } from './screenshots';

	defineProps<ScreenshotsProps>();

	const { t } = useI18n();
	const { lightbox, lightboxRef, open, close } = useScreenshots();
</script>

<template>
	<div class="screenshots no-select">
		<img
			v-for="(src, i) in screenshots"
			:key="src"
			:src="src"
			loading="lazy"
			:alt="`${t('labels.screenshot')} ${i + 1}`"
			role="button"
			tabindex="0"
			@click="open(src)"
			@keydown.enter.prevent="open(src)"
			@keydown.space.prevent="open(src)"
		/>
	</div>

	<Teleport to="body">
		<Transition name="lightbox">
			<div
				v-if="lightbox"
				ref="lightboxRef"
				class="lightbox"
				tabindex="-1"
				@click="close"
				@keydown.esc="close"
			>
				<img :src="lightbox" alt="" />
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped lang="scss" src="./screenshots.scss"></style>
