import ace from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import beautify from 'js-beautify';
import { onBeforeUnmount, onMounted, ref, type ModelRef, type Ref } from 'vue';

export type AceSaveEmit = (event: 'save') => void;

export interface AceEditorState {
	host: Ref<HTMLElement | undefined>;
	format: () => void;
}

export function useAceEditor(
	model: ModelRef<string>,
	emit: AceSaveEmit,
): AceEditorState {
	const host = ref<HTMLElement>();
	let editor: ace.Ace.Editor | undefined;

	onMounted(() => {
		if (!host.value) return;
		const instance = ace.edit(host.value, {
			theme: 'ace/theme/tomorrow_night',
			mode: 'ace/mode/css',
			value: model.value,
			tabSize: 4,
			useWorker: false,
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
		});
		instance.session.setUseWrapMode(true);
		instance.session.on('change', () => {
			model.value = instance.getValue();
		});
		instance.commands.addCommand({
			name: 'save',
			bindKey: { win: 'Ctrl-S', mac: 'Cmd-S' },
			exec: () => {
				emit('save');
			},
		});
		editor = instance;
	});

	onBeforeUnmount(() => editor?.destroy());

	function format(): void {
		if (!editor) return;
		const row = editor.selection.getCursor().row;
		editor.setValue(
			beautify.css(editor.getValue(), {
				indent_size: 4,
				preserve_newlines: false,
			}),
		);
		editor.gotoLine(row + 1, 0, true);
	}

	return { host, format };
}
