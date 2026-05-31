import { nextTick, ref, type Ref } from 'vue';

export interface ScreenshotsProps {
	screenshots: string[];
}

export interface ScreenshotsState {
	lightbox: Ref<string | undefined>;
	lightboxRef: Ref<HTMLElement | undefined>;
	open: (src: string) => void;
	close: () => void;
}

export function useScreenshots(): ScreenshotsState {
	const lightbox = ref<string>();
	const lightboxRef = ref<HTMLElement>();

	function open(src: string): void {
		lightbox.value = src;
		// Move focus to the overlay so it can receive the Escape keydown.
		void nextTick(() => lightboxRef.value?.focus());
	}

	function close(): void {
		lightbox.value = undefined;
	}

	return { lightbox, lightboxRef, open, close };
}
