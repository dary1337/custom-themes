<script setup lang="ts">
	import ConfirmDialog from '@/popup/components/confirm-dialog/confirm-dialog.vue';
	import Icon from '@/popup/components/icon/icon.vue';
	import ThemeSwitch from '@/popup/components/theme-switch/theme-switch.vue';
	import { useSettingsPage } from './settings-page';

	const {
		t,
		settings,
		confirm,
		visibleSettings,
		description,
		promptImport,
		exportThemes,
		reset,
		back,
	} = useSettingsPage();
</script>

<template>
	<main class="settings no-select">
		<header class="title">
			<button class="icon-btn back" @click="back">
				<Icon name="back" />
			</button>
			<h1>{{ t('titles.settings') }}</h1>
		</header>

		<div class="list">
			<div v-for="def in visibleSettings" :key="def.id" class="row">
				<div class="label">
					<label>{{ t(`settings.${def.id}.name`) }}</label>
					<label class="dimmed">{{
						description(def.id, def.dynamicDescription)
					}}</label>
				</div>
				<ThemeSwitch
					:model-value="Boolean(settings.settings[def.id])"
					@update:model-value="settings.update(def.id, $event)"
				/>
			</div>

			<div class="bottom">
				<button @click="promptImport">
					<Icon name="import" />{{ t('buttons.importThemes') }}
				</button>
				<button @click="exportThemes">
					<Icon name="export" />{{ t('buttons.exportThemes') }}
				</button>
				<button class="danger" @click="reset">
					<Icon name="trash" />{{ t('buttons.resetExtension') }}
				</button>
			</div>
		</div>

		<ConfirmDialog ref="confirm" />
	</main>
</template>

<style scoped lang="scss" src="./settings-page.scss"></style>
