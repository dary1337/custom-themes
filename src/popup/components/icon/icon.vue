<script setup lang="ts">
	import { type IconProps, useIcon } from './icon';

	const props = defineProps<IconProps>();
	const { markup } = useIcon(props);
</script>

<template>
	<!-- eslint-disable-next-line vue/no-v-html -- icons are trusted compile-time SVG constants -->
	<span class="icon" v-html="markup" />
</template>

<style scoped lang="scss" src="./icon.scss"></style>
