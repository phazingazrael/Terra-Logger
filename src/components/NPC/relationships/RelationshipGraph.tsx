import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import type { AtlasRenderContext } from "../../../definitions/Atlas";
import type { NPCRelationship, TLNPC } from "../../../definitions/TerraLogger";
import { getNPCRelationshipLabel } from "./registry";

function routeFor(type: string, id: string): string {
	return type === "npc" ? `/view_npc/${id}` : `/view_${type}/${id}`;
}

function entityName(
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

function relationshipDescription(
	npcName: string,
	targetName: string,
	relationship: NPCRelationship,
): string {
	const descriptions: Record<string, string> = {
		parent: `${npcName} is a parent of ${targetName}.`,
		child: `${npcName} is a child of ${targetName}.`,
		spouse: `${npcName} is married to ${targetName}.`,
		sibling: `${npcName} is a sibling of ${targetName}.`,
		mentor: `${npcName} mentors ${targetName}.`,
		student: `${npcName} studies under ${targetName}.`,
		employer: `${npcName} employs ${targetName}.`,
		employee: `${npcName} works for ${targetName}.`,
		friend: `${npcName} is a friend of ${targetName}.`,
		ally: `${npcName} is allied with ${targetName}.`,
		rival: `${npcName} is a rival of ${targetName}.`,
		enemy: `${npcName} is an enemy of ${targetName}.`,
		advisor: `${npcName} advises ${targetName}.`,
		"advised-by": `${npcName} is advised by ${targetName}.`,
		member: `${npcName} is a member of ${targetName}.`,
		leader: `${npcName} leads ${targetName}.`,
		leads: `${npcName} leads ${targetName}.`,
		"led-by": `${npcName} is led by ${targetName}.`,
		ruler: `${npcName} rules ${targetName}.`,
		rules: `${npcName} rules ${targetName}.`,
		subject: `${npcName} is a subject of ${targetName}.`,
		serves: `${npcName} serves ${targetName}.`,
		"served-by": `${npcName} is served by ${targetName}.`,
		resident: `${npcName} resides in ${targetName}.`,
		"resides-in": `${npcName} resides in ${targetName}.`,
		"works-in": `${npcName} works in ${targetName}.`,
		protects: `${npcName} protects ${targetName}.`,
		"stationed-in": `${npcName} is stationed in ${targetName}.`,
		supplies: `${npcName} supplies ${targetName}.`,
		"supplied-by": `${npcName} is supplied by ${targetName}.`,
		owner: `${npcName} owns ${targetName}.`,
		"owned-by": `${npcName} is owned by ${targetName}.`,
	};
	return (
		descriptions[relationship.relationshipType] ??
		`${npcName} has a ${getNPCRelationshipLabel(relationship.relationshipType).toLocaleLowerCase()} relationship with ${targetName}.`
	);
}

export function NPCRelationshipGraph({
	npc,
	context,
	embedded = false,
}: {
	npc: TLNPC;
	context: AtlasRenderContext;
	embedded?: boolean;
}) {
	const relationships = npc.relationships ?? [];
	if (!relationships.length) return null;
	const npcName = npc.fullName || npc.name;

	const content = (
		<Stack spacing={1.25} sx={{ minWidth: 0 }}>
			<Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
				{npcName}
			</Typography>
			{relationships.map((relationship) => {
				const targetName = entityName(
					context,
					relationship.relatedEntityType,
					relationship.relatedEntityId,
				);
				return (
					<Box
						key={relationship.id}
						sx={{
							display: "grid",
							gridTemplateColumns: "minmax(0, 1fr)",
							gap: 0.75,
							p: 1,
							border: 1,
							borderColor: "divider",
							borderRadius: 1,
							minWidth: 0,
						}}
					>
						<Stack
							direction="row"
							spacing={0.75}
							alignItems="center"
							flexWrap="wrap"
							useFlexGap
						>
							{relationship.primary ? (
								<Chip
									size="small"
									color="primary"
									variant="outlined"
									label="Primary"
								/>
							) : null}
							<Chip
								size="small"
								label={getNPCRelationshipLabel(relationship.relationshipType)}
							/>
							<Chip
								component={Link}
								clickable
								to={routeFor(
									relationship.relatedEntityType,
									relationship.relatedEntityId,
								)}
								label={targetName}
								variant={relationship.primary ? "filled" : "outlined"}
								sx={{
									justifySelf: "start",
									maxWidth: "100%",
									height: "auto",
									"& .MuiChip-label": {
										display: "block",
										py: 0.5,
										whiteSpace: "normal",
										overflowWrap: "anywhere",
									},
								}}
							/>
						</Stack>
						{relationship.roleTitle ? (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ overflowWrap: "anywhere" }}
							>
								Role / context: {relationship.roleTitle}
							</Typography>
						) : null}
						<Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
							{relationshipDescription(npcName, targetName, relationship)}
						</Typography>
					</Box>
				);
			})}
		</Stack>
	);

	if (embedded) return content;
	return (
		<Paper variant="outlined" sx={{ mt: 3, p: 2, minWidth: 0 }}>
			<Typography variant="h5" component="h2" gutterBottom>
				Relationship Graph
			</Typography>
			{content}
		</Paper>
	);
}
