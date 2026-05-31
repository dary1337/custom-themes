<script setup lang="ts">
	import Icon from '@/popup/components/icon/icon.vue';
	import { useAboutPage } from './about-page';

	const { t, router, links, version, changelog, usedLibs } = useAboutPage();
</script>

<template>
	<main class="about">
		<header class="title no-select">
			<button class="icon-btn back" @click="router.back()">
				<Icon name="back" />
			</button>
			<h1>{{ t('titles.about') }}</h1>
		</header>

		<div class="content">
			<p>{{ t('about.intro') }}</p>
			<i18n-t keypath="about.feedback" tag="p">
				<template #github>
					<a
						:href="links.newIssue"
						target="_blank"
						rel="noopener noreferrer"
						>GitHub</a
					>
				</template>
				<template #telegram>
					<a
						:href="links.telegram"
						target="_blank"
						rel="noopener noreferrer"
						>Telegram</a
					>
				</template>
			</i18n-t>
			<p>:3</p>

			<h2>{{ t('strings.usedLibs') }}:</h2>
			<label v-for="lib in usedLibs" :key="lib">- {{ lib }}</label>

			<template v-if="changelog.length">
				<h2>{{ t('strings.updateVer') }} {{ version }}</h2>
				<label v-for="(entry, i) in changelog" :key="i"
					>- {{ entry }}</label
				>
			</template>
		</div>
	</main>
</template>

<style scoped lang="scss" src="./about-page.scss"></style>
