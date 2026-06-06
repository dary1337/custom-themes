<script setup lang="ts">
	import ConfirmDialog from '@/popup/components/confirm-dialog/confirm-dialog.vue';
	import Icon from '@/popup/components/icon/icon.vue';
	import Screenshots from '@/popup/components/screenshots/screenshots.vue';
	import { ALL_SITES } from '@/shared/constants';
	import {
		type ThemeDetailsPageProps,
		useThemeDetailsPage,
	} from './theme-details-page';

	const props = defineProps<ThemeDetailsPageProps>();

	const {
		t,
		confirm,
		stored,
		repoTheme,
		theme,
		screenshots,
		showScreenshots,
		versionLabel,
		updateAvailable,
		isLocal,
		isAuthorTheme,
		close,
		edit,
		applyUpdate,
		exportTheme,
		remove,
		suggest,
		reportBadLayout,
	} = useThemeDetailsPage(props);
</script>

<template>
	<div v-if="theme" class="details">
		<header class="title no-select">
			<h1>{{ theme.name }}</h1>
			<button class="icon-btn close" @click="close">
				<Icon name="close" />
			</button>
		</header>

		<Screenshots
			v-if="showScreenshots && screenshots.length"
			:screenshots="screenshots"
		/>
		<label v-else-if="showScreenshots" class="dimmed">{{
			t('labels.noScreenshots')
		}}</label>

		<dl class="meta">
			<dt>{{ t('labels.website') }}:</dt>
			<dd>
				<a
					v-if="theme.link && theme.link !== ALL_SITES"
					:href="theme.link"
					target="_blank"
					rel="noopener noreferrer"
					>{{ theme.link }}</a
				>
				<span v-else>{{ theme.link || t('strings.none') }}</span>
			</dd>

			<template v-if="repoTheme?.authorLink">
				<dt>{{ t('labels.author') }}:</dt>
				<dd>
					<a
						:href="repoTheme.authorLink"
						target="_blank"
						rel="noopener noreferrer"
						>{{ repoTheme.author }}</a
					>
				</dd>
			</template>

			<template v-if="repoTheme?.repoLink">
				<dt>{{ t('labels.source') }}:</dt>
				<dd>
					<a
						:href="repoTheme.repoLink"
						target="_blank"
						rel="noopener noreferrer"
						>Github</a
					>
				</dd>
			</template>

			<dt>{{ t('labels.version') }}:</dt>
			<dd>{{ versionLabel }}</dd>
		</dl>

		<div class="actions">
			<button @click="edit">
				<Icon name="edit" />{{ t('buttons.edit') }}
			</button>

			<button v-if="updateAvailable" @click="applyUpdate">
				<Icon name="update" />{{ t('buttons.update') }}
			</button>

			<template v-if="isLocal">
				<button @click="exportTheme">
					<Icon name="export" />{{ t('buttons.export') }}
				</button>
				<button @click="suggest('github')">
					<Icon name="openInNew" />{{ t('buttons.suggestGithub') }}
				</button>
				<button @click="suggest('telegram')">
					<Icon name="openInNew" />{{ t('buttons.suggestTelegram') }}
				</button>
				<button class="danger" @click="remove">
					<Icon name="trash" />{{ t('buttons.delete') }}
				</button>
			</template>

			<button
				v-if="!stored?.edited && isAuthorTheme"
				@click="reportBadLayout"
			>
				<Icon name="openInNew" />{{ t('buttons.badLayout') }}
			</button>
		</div>

		<ConfirmDialog ref="confirm" />
	</div>
</template>

<style scoped lang="scss" src="./theme-details-page.scss"></style>
