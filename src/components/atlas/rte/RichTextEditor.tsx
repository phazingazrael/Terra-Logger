import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import DOMPurify from "dompurify";
import { htmlToRichTextJson, richTextJsonToHtml } from "../core/richText";

type RichTextEditorProps = {
	value: string;
	onChange: (json: string) => void;
};

const SANITIZE_CONFIG = {
	USE_PROFILES: {
		html: true,
	},
	ADD_ATTR: ["target", "rel"],
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const isFocusedRef = useRef(false);
	const lastExternalValueRef = useRef(value);
	const lastCommittedValueRef = useRef(value);

	const initialHtml = useMemo(() => {
		return sanitizeHtml(richTextJsonToHtml(value));
		// Intentionally initial-only.
		// React should not control the contentEditable body while typing.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	useLayoutEffect(() => {
		const editor = editorRef.current;
		if (!editor) return;

		editor.innerHTML = initialHtml;
	}, [initialHtml]);

	useEffect(() => {
		const editor = editorRef.current;
		if (!editor) return;

		const externalValueChanged = value !== lastExternalValueRef.current;
		const cameFromThisEditor = value === lastCommittedValueRef.current;

		lastExternalValueRef.current = value;

		if (!externalValueChanged) return;
		if (cameFromThisEditor) return;
		if (isFocusedRef.current) return;

		editor.innerHTML = sanitizeHtml(richTextJsonToHtml(value));
		lastCommittedValueRef.current = value;
	}, [value]);

	function commitChange() {
		const editor = editorRef.current;
		if (!editor) return;

		const nextJson = htmlToRichTextJson(editor.innerHTML);

		if (nextJson === lastCommittedValueRef.current) return;

		lastCommittedValueRef.current = nextJson;
		onChange(nextJson);
	}

	function runCommand(command: string, commandValue?: string) {
		const editor = editorRef.current;
		if (!editor) return;

		editor.focus();
		document.execCommand(command, false, commandValue);
		commitChange();
	}

	function handleCreateLink() {
		const href = window.prompt("Enter link URL");
		if (!href) return;

		runCommand("createLink", href);
	}

	return (
		<div className="atlas-rte-shell">
			<div className="atlas-rte-toolbar">
				<ToolbarButton label="Bold" onClick={() => runCommand("bold")}>
					<strong>B</strong>
				</ToolbarButton>

				<ToolbarButton label="Italic" onClick={() => runCommand("italic")}>
					<em>I</em>
				</ToolbarButton>

				<ToolbarButton
					label="Underline"
					onClick={() => runCommand("underline")}
				>
					<u>U</u>
				</ToolbarButton>

				<ToolbarSeparator />

				<ToolbarButton
					label="Paragraph"
					onClick={() => runCommand("formatBlock", "p")}
				>
					P
				</ToolbarButton>

				<ToolbarButton
					label="Heading 2"
					onClick={() => runCommand("formatBlock", "h2")}
				>
					H2
				</ToolbarButton>

				<ToolbarButton
					label="Heading 3"
					onClick={() => runCommand("formatBlock", "h3")}
				>
					H3
				</ToolbarButton>

				<ToolbarSeparator />

				<ToolbarButton
					label="Bullet list"
					onClick={() => runCommand("insertUnorderedList")}
				>
					•
				</ToolbarButton>

				<ToolbarButton
					label="Numbered list"
					onClick={() => runCommand("insertOrderedList")}
				>
					1.
				</ToolbarButton>

				<ToolbarSeparator />

				<ToolbarButton label="Add link" onClick={handleCreateLink}>
					Link
				</ToolbarButton>

				<ToolbarButton label="Remove link" onClick={() => runCommand("unlink")}>
					Unlink
				</ToolbarButton>
			</div>

			{/** biome-ignore lint/a11y/useSemanticElements: it's fine */}
			<div
				ref={editorRef}
				className="atlas-rte"
				contentEditable
				suppressContentEditableWarning
				role="textbox"
				aria-multiline="true"
				tabIndex={0}
				onFocus={() => {
					isFocusedRef.current = true;
				}}
				onBlur={() => {
					isFocusedRef.current = false;
					commitChange();
				}}
			/>
		</div>
	);
}

function ToolbarButton({
	label,
	onClick,
	children,
}: {
	label: string;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			className="atlas-rte-toolbar__button"
			title={label}
			aria-label={label}
			onMouseDown={(event) => {
				event.preventDefault();
				onClick();
			}}
		>
			{children}
		</button>
	);
}

function ToolbarSeparator() {
	return <span className="atlas-rte-toolbar__separator" aria-hidden="true" />;
}

function sanitizeHtml(html: string): string {
	return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
