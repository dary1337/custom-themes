import { ref, type Ref } from 'vue';

export interface ScreenshotsProps {
	screenshots: string[];
}

export interface ScreenshotsState {
	lightbox: Ref<string | undefined>;
	open: (src: string) => void;
	close: () => void;
}

export function useScreenshots(): ScreenshotsState {
	const lightbox = ref<string>();

	function open(src: string): void {
		lightbox.value = src;
	}

	function close(): void {
		lightbox.value = undefined;
	}

	return { lightbox, open, close };
}
