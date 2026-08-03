import type {
	AtlasBlock,
	AtlasEditorContext,
} from "../../../../definitions/Atlas";
import type {
	NPCRelationship,
	TLNPC,
} from "../../../../definitions/TerraLogger";
import {
	NPCRelationshipEditor,
	type NPCRelationshipOptions,
} from "../../../NPC/editing/NPCRelationshipEditor";

function buildRelationshipOptions(
	related: AtlasEditorContext["related"],
): NPCRelationshipOptions {
	return {
		country: (related?.countries ?? []).map((item) => ({
			id: item._id,
			name: item.nameFull || item.name,
		})),
		city: (related?.cities ?? []).map((item) => ({
			id: item._id,
			name: item.name,
		})),
		culture: (related?.cultures ?? []).map((item) => ({
			id: item._id,
			name: item.name,
		})),
		religion: (related?.religions ?? []).map((item) => ({
			id: item._id,
			name: item.name,
		})),
		npc: (related?.npcs ?? []).map((item) => ({
			id: item._id,
			name: item.fullName || item.name,
		})),
	};
}

export function RelationshipListBlockEditor({
	block: _block,
	context,
}: {
	block: AtlasBlock;
	context: AtlasEditorContext;
}) {
	if (context.sourceType !== "npc") {
		return <p>The Relationship List block is only available for NPC pages.</p>;
	}

	const npc = context.entity as TLNPC;
	const options = buildRelationshipOptions(context.related);

	return (
		<NPCRelationshipEditor
			npc={npc}
			options={options}
			onSave={(relationships: NPCRelationship[]) => {
				context.onEntityFieldChange({
					path: "relationships",
					value: relationships,
				});
			}}
		/>
	);
}
