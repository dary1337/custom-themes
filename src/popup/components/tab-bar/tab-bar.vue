<script setup lang="ts">
	import Icon from '@/popup/components/icon/icon.vue';
	import { type TabBarProps, useTabBar } from './tab-bar';

	const props = defineProps<TabBarProps>();

	const { t, ui, full, searchOpen, tabs, selectTab, toggleSearch } =
		useTabBar(props);
</script>

<template>
	<div class="tabs no-select">
		<div v-if="searchOpen" class="input-container search">
			<Icon name="search" />
			<input
				:value="ui.search"
				type="text"
				:placeholder="t('labels.search')"
				@input="ui.setSearch(($event.target as HTMLInputElement).value)"
			/>
		</div>

		<div v-show="!searchOpen" class="tab-group" role="tablist">
			<div
				v-for="tab in tabs"
				:key="tab.id"
				class="tab"
				:class="{ selected: tab.id === currentTab }"
				role="tab"
				:tabindex="tab.id === currentTab ? 0 : -1"
				:aria-selected="tab.id === currentTab"
				@click="selectTab(tab.id)"
				@keydown.enter.prevent="selectTab(tab.id)"
				@keydown.space.prevent="selectTab(tab.id)"
			>
				{{ tab.label }}
			</div>
		</div>

		<button v-if="full" class="search-toggle" @click="toggleSearch">
			<Icon :name="searchOpen ? 'close' : 'search'" />
		</button>
	</div>
</template>

<style scoped lang="scss" src="./tab-bar.scss"></style>
