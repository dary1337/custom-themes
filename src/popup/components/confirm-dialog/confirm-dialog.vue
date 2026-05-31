<script setup lang="ts">
	import { useId } from 'vue';
	import { useConfirmDialog } from './confirm-dialog';

	const { visible, message, dialogRef, cancelRef, ask, answer, onKeydown } =
		useConfirmDialog();
	const messageId = useId();

	defineExpose({ ask });
</script>

<template>
	<Teleport to="body">
		<Transition name="fade">
			<div
				v-if="visible"
				class="overlay"
				@click.self="answer(false)"
				@keydown="onKeydown"
			>
				<div
					ref="dialogRef"
					class="dialog"
					role="dialog"
					aria-modal="true"
					:aria-labelledby="messageId"
				>
					<p :id="messageId">{{ message }}</p>
					<div class="actions">
						<button ref="cancelRef" @click="answer(false)">
							{{ $t('strings.none') }}
						</button>
						<button class="danger" @click="answer(true)">
							{{ $t('buttons.delete') }}
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped lang="scss" src="./confirm-dialog.scss"></style>
