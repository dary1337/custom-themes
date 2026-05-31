<script setup lang="ts">
	import type { LoaderProps } from './loader';

	defineProps<LoaderProps>();
</script>

<template>
	<div class="loader">
		<span class="loader-icon" />
		<label v-if="label" class="dimmed">{{ label }}</label>
	</div>
</template>

<style scoped lang="scss" src="./loader.scss"></style>
