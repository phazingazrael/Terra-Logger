import { Chip, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import type {
	AtlasBlockPlugin,
	AtlasRenderContext,
} from "../../../../definitions/Atlas";
import type { TLNPC } from "../../../../definitions/TerraLogger";
import { NPCHistoryTimeline } from "../../../NPC/history/NPCHistoryTimeline";
import { getNPCRelationshipLabel } from "../../../NPC/relationships/registry";
import { NPCRelationshipGraph } from "../../../NPC/relationships/RelationshipGraph";

function relationshipRoute(type: string, id: string): string {
	return type === "npc" ? `/view_npc/${id}` : `/view_${type}/${id}`;
}

function relationshipName(
	context: AtlasRenderContext,
	type: string,
	id: string,
): string {
	const related = context.related;
	const collections: Record<
		string,
		Array<{ _id: string; name?: string; fullName?: string; nameFull?: string }>
	> = {
		country: related?.countries ?? [],
		city: related?.cities ?? [],
		culture: related?.cultures ?? [],
		religion: related?.religions ?? [],
		npc: related?.npcs ?? [],
	};
	const entity = collections[type]?.find((item) => item._id === id);
	return (
		entity?.fullName ||
		entity?.nameFull ||
		entity?.name ||
		id ||
		"Unknown entity"
	);
}

export const npcBlockPlugins: Record<string, AtlasBlockPlugin> = {
	"relationship-list": {
		type: "relationship-list",
		label: "Relationship List",
		shouldRender: ({ context }) =>
			context.sourceType === "npc" &&
			Boolean((context.entity as TLNPC).relationships?.length),
		Render: ({ block, context }) => {
			if (context.sourceType !== "npc") return null;
			const npc = context.entity as TLNPC;
			const relationships = npc.relationships ?? [];
			if (!relationships.length) {
				return (
					<Typography color="text.secondary">
						{String(block.props.emptyText ?? "No relationships recorded.")}
					</Typography>
				);
			}
			return (
				<Stack spacing={1}>
					{relationships.map((relationship) => (
						<Stack
							key={relationship.id}
							direction={{ xs: "column", sm: "row" }}
							spacing={1}
							alignItems={{ xs: "flex-start", sm: "center" }}
						>
							<Typography
								sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}
							>
								<strong>
									{getNPCRelationshipLabel(relationship.relationshipType)}
								</strong>{" "}
								—{" "}
								<Chip
									component={Link}
									clickable
									size="small"
									to={relationshipRoute(
										relationship.relatedEntityType,
										relationship.relatedEntityId,
									)}
									label={relationshipName(
										context,
										relationship.relatedEntityType,
										relationship.relatedEntityId,
									)}
									sx={{
										maxWidth: "100%",
										"& .MuiChip-label": {
											overflow: "hidden",
											textOverflow: "ellipsis",
										},
									}}
								/>
								{relationship.roleTitle ? ` (${relationship.roleTitle})` : ""}
							</Typography>
							{relationship.primary ? (
								<Chip size="small" label="Primary" />
							) : null}
						</Stack>
					))}
				</Stack>
			);
		},
	},
	"npc-current-location": {
		type: "npc-current-location",
		label: "Current Location",
		shouldRender: ({ context }) =>
			context.sourceType === "npc" &&
			Boolean((context.entity as TLNPC).currentLocation?.id),
		Render: ({ block, context }) => {
			if (context.sourceType !== "npc") return null;
			const npc = context.entity as TLNPC;
			const location = npc.currentLocation;
			if (!location?.id) {
				return (
					<Typography color="text.secondary">
						{String(block.props.emptyText ?? "No current location recorded.")}
					</Typography>
				);
			}
			return (
				<Chip
					component={Link}
					clickable
					to={`/view_city/${location.id}`}
					label={location.name || location.id}
					sx={{
						maxWidth: "100%",
						"& .MuiChip-label": {
							overflow: "hidden",
							textOverflow: "ellipsis",
						},
					}}
				/>
			);
		},
	},
	"npc-relationship-graph": {
		type: "npc-relationship-graph",
		label: "Relationship Graph",
		shouldRender: ({ context }) =>
			context.sourceType === "npc" &&
			Boolean((context.entity as TLNPC).relationships?.length),
		Render: ({ block, context }) => {
			if (context.sourceType !== "npc") return null;
			const npc = context.entity as TLNPC;
			if (!(npc.relationships ?? []).length) {
				return (
					<Typography color="text.secondary">
						{String(block.props.emptyText ?? "No relationships recorded.")}
					</Typography>
				);
			}
			return <NPCRelationshipGraph npc={npc} context={context} embedded />;
		},
	},
	"npc-history-timeline": {
		type: "npc-history-timeline",
		label: "History Timeline",
		shouldRender: ({ context }) =>
			context.sourceType === "npc" &&
			Boolean((context.entity as TLNPC).history?.length),
		Render: ({ block, context }) => {
			if (context.sourceType !== "npc") return null;
			const npc = context.entity as TLNPC;
			if (!(npc.history ?? []).length) {
				return (
					<Typography color="text.secondary">
						{String(block.props.emptyText ?? "No history recorded.")}
					</Typography>
				);
			}
			return <NPCHistoryTimeline entries={npc.history ?? []} embedded />;
		},
	},
};
