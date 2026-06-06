import { icons, type IconName } from '@/shared/icons';
import { computed, type ComputedRef } from 'vue';

export interface IconProps {
	name: IconName;
}

export function useIcon(props: IconProps): { markup: ComputedRef<string> } {
	// Icons are trusted compile-time constants, safe to render as markup.
	const markup = computed(() => icons[props.name]);
	return { markup };
}
