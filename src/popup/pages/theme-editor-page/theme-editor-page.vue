<script setup lang="ts">
	import AceEditor from '@/popup/components/ace-editor/ace-editor.vue';
	import Icon from '@/popup/components/icon/icon.vue';
	import Loader from '@/popup/components/loader/loader.vue';
	import {
		type ThemeEditorPageProps,
		useThemeEditorPage,
	} from './theme-editor-page';

	const props = defineProps<ThemeEditorPageProps>();

	const {
		t,
		editorRef,
		code,
		name,
		link,
		loading,
		stored,
		repoTheme,
		isLocal,
		dirty,
		save,
		restore,
		back,
	} = useThemeEditorPage(props);
</script>

<template>
	<div class="editor-page">
		<header class="title no-select">
			<button class="icon-btn back" @click="back">
				<Icon name="back" />
			</button>
			<div v-if="isLocal" class="input-container name-input">
				<Icon name="title" />
				<input
					v-model="name"
					type="text"
					:placeholder="t('strings.untitled')"
				/>
			</div>
			<h1 v-else>{{ stored?.name ?? repoTheme?.name }}</h1>
		</header>

		<Loader v-if="loading" :label="t('loader.loadingCode')" />

		<template v-else>
			<div v-if="isLocal" class="input-container link-input">
				<Icon name="world" />
				<input
					v-model="link"
					type="text"
					:placeholder="t('labels.linkPlaceholder')"
					@keydown.ctrl.s.prevent="save"
				/>
			</div>

			<AceEditor
				ref="editorRef"
				v-model="code"
				class="code"
				@save="save"
			/>

			<div class="panel">
				<button :class="{ filled: dirty }" @click="save">
					<Icon name="save" />{{ t('buttons.saveLocally') }}
				</button>
				<button
					v-if="!isLocal && stored?.edited"
					class="danger"
					@click="restore"
				>
					<Icon name="trash" />{{ t('buttons.restoreFromCloud') }}
				</button>
			</div>
		</template>
	</div>
</template>

<style scoped lang="scss" src="./theme-editor-page.scss"></style>
