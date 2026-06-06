<script setup lang="ts">
	import type { ThemeSwitchModel } from './theme-switch';

	const model = defineModel<ThemeSwitchModel>({ required: true });
</script>

<template>
	<label class="switch" @click.stop>
		<input v-model="model" type="checkbox" />
		<span class="slider" />
	</label>
</template>

<style scoped lang="scss" src="./theme-switch.scss"></style>
