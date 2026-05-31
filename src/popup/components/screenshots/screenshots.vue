<script setup lang="ts">
	import { type ScreenshotsProps, useScreenshots } from './screenshots';

	defineProps<ScreenshotsProps>();

	const { lightbox, open, close } = useScreenshots();
</script>

<template>
	<div class="screenshots no-select">
		<img
			v-for="src in screenshots"
			:key="src"
			:src="src"
			loading="lazy"
			alt=""
			@click="open(src)"
		/>
	</div>

	<Teleport to="body">
		<Transition name="lightbox">
			<div v-if="lightbox" class="lightbox" @click="close">
				<img :src="lightbox" alt="" />
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped lang="scss" src="./screenshots.scss"></style>
