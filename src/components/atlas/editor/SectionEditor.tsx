import { useEffect, useState } from "react";
import type {
	AtlasBlockPreset,
	AtlasEditorContext,
	AtlasSection,
} from "../../../definitions/Atlas";
import {
	addBlock,
	moveBlock,
	removeBlock,
	replaceBlock,
} from "../core/documentTree";
import { BlockList } from "./BlockList";
import { Alert } from "@mui/material";

export function SectionEditor({
	section,
	blockPresets,
	context,
	onChange,
}: {
	section: AtlasSection;
	blockPresets: AtlasBlockPreset[];
	context: AtlasEditorContext;
	onChange: (section: AtlasSection) => void;
}) {
	const [titleDraft, setTitleDraft] = useState(section.title);

	useEffect(() => {
		setTitleDraft(section.title);
	}, [section]);

	function commitTitle() {
		const nextTitle = titleDraft.trim();

		if (!nextTitle || nextTitle === section.title) return;

		onChange({
			...section,
			title: nextTitle,
		});
	}

	return (
		<div className="atlas-section-editor">
			<div>
				<label className="sectionTitle">
					Section Title &nbsp;
					<input
						value={titleDraft}
						onChange={(event) => setTitleDraft(event.target.value)}
						onBlur={commitTitle}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								commitTitle();
								event.currentTarget.blur();
							}
						}}
						disabled={!section.editor.editable}
					/>
				</label>
				{section.editor.editable ? null : (
					<Alert
						severity="info"
						variant="outlined"
						className="sectionTitleAlert"
					>
						Section Title is disabled as this is a core section.
					</Alert>
				)}
			</div>
			<BlockList
				blocks={section.blocks}
				blockPresets={blockPresets}
				context={context}
				onAdd={(preset) =>
					onChange(addBlock(section, preset.create(context.entity as never)))
				}
				onChange={(block) => onChange(replaceBlock(section, block))}
				onRemove={(id) => onChange(removeBlock(section, id))}
				onMove={(from, to) => onChange(moveBlock(section, from, to))}
			/>
		</div>
	);
}
