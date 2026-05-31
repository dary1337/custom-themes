<script setup lang="ts">
	import { type ScreenshotsProps, useScreenshots } from './screenshots';

	defineProps<ScreenshotsProps>();

	const { lightbox, lightboxRef, open, close } = useScreenshots();
</script>

<template>
	<div class="screenshots no-select">
		<img
			v-for="src in screenshots"
			:key="src"
			:src="src"
			loading="lazy"
			alt=""
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
