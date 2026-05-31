<script setup lang="ts">
	import { useAceEditor } from './ace-editor';

	const emit = defineEmits<{ save: [] }>();
	const model = defineModel<string>({ required: true });

	const { host, format } = useAceEditor(model, emit);

	defineExpose({ format });
</script>

<template>
	<div ref="host" class="ace-host" />
</template>

<style scoped lang="scss" src="./ace-editor.scss"></style>
