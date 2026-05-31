<script setup lang="ts">
	import Icon from '@/popup/components/icon/icon.vue';
	import ThemeSwitch from '@/popup/components/theme-switch/theme-switch.vue';
	import { type ThemeCardProps, useThemeCard } from './theme-card';

	const props = defineProps<ThemeCardProps>();

	const {
		t,
		author,
		authorLink,
		isAllSites,
		linkText,
		isEdited,
		isSelected,
		checked,
		updateAvailable,
		select,
		openEditor,
	} = useThemeCard(props);
</script>

<template>
	<div
		class="card"
		:class="{ selected: isSelected, selectable }"
		@click="select"
	>
		<div class="info">
			<div class="title-row">
				<label class="name">{{ theme.name }}</label>
				<button
					v-if="isEdited"
					class="edit-flag"
					:title="t('buttons.edit')"
					@click.stop="openEditor"
				>
					<Icon name="edit" />
				</button>
			</div>

			<label v-if="isAllSites" class="dimmed">{{
				t('strings.allSites')
			}}</label>
			<a
				v-else
				:href="theme.link"
				target="_blank"
				rel="noopener noreferrer"
				@click.stop
				>{{ linkText }}</a
			>

			<a
				v-if="tab !== 'Author\'s' && author"
				:href="authorLink"
				target="_blank"
				rel="noopener noreferrer"
				@click.stop
				>{{ author }}</a
			>

			<label v-if="updateAvailable" class="dimmed">{{
				t('strings.updateAvailable')
			}}</label>
		</div>

		<ThemeSwitch v-model="checked" />
	</div>
</template>

<style scoped lang="scss" src="./theme-card.scss"></style>
