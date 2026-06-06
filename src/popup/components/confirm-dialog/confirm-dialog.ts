import { nextTick, ref, watch, type Ref } from 'vue';

export interface ConfirmDialogState {
	visible: Ref<boolean>;
	message: Ref<string>;
	dialogRef: Ref<HTMLElement | undefined>;
	cancelRef: Ref<HTMLButtonElement | undefined>;
	ask: (text: string) => Promise<boolean>;
	answer: (ok: boolean) => void;
	onKeydown: (event: KeyboardEvent) => void;
}

export function useConfirmDialog(): ConfirmDialogState {
	const visible = ref(false);
	const message = ref('');
	const dialogRef = ref<HTMLElement>();
	const cancelRef = ref<HTMLButtonElement>();
	let resolver: ((ok: boolean) => void) | undefined;
	let lastFocused: HTMLElement | undefined;

	function ask(text: string): Promise<boolean> {
		message.value = text;
		// Narrowed to HTMLElement so we can restore focus via `.focus()` in answer().
		lastFocused =
			(document.activeElement as HTMLElement | null) ?? undefined;
		visible.value = true;
		return new Promise((resolve) => {
			resolver = resolve;
		});
	}

	function answer(ok: boolean): void {
		visible.value = false;
		resolver?.(ok);
		resolver = undefined;
		lastFocused?.focus();
		lastFocused = undefined;
	}

	// Initial focus on the safe (cancel) button; trap Tab between dialog buttons.
	watch(visible, async (open) => {
		if (!open) return;
		await nextTick();
		cancelRef.value?.focus();
	});

	function onKeydown(event: KeyboardEvent): void {
		if (!visible.value) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			answer(false);
			return;
		}
		if (event.key !== 'Tab') return;
		const root = dialogRef.value;
		if (!root) return;
		const focusables = root.querySelectorAll<HTMLElement>(
			'button, [href], [tabindex]:not([tabindex="-1"])',
		);
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (!first || !last) return;
		const active = document.activeElement;
		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	return { visible, message, dialogRef, cancelRef, ask, answer, onKeydown };
}
