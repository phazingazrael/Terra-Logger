import { Avatar, Box, Card, Typography } from "@mui/material";
import { memo } from "react";
import { Link } from "react-router-dom";
import type { TLNPC } from "../../definitions/TerraLogger";
import { resolveNPCPortraitSource } from "../NPC/portraits/placeholders";

function initials(name: string) {
	return (
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join("") || "NPC"
	);
}

function NPCCard({
	npc,
	genderDescription,
}: Readonly<{ npc: TLNPC; genderDescription?: string }>) {
	const displayName = npc.fullName || npc.name || "Unnamed NPC";
	const relationshipCount = npc.relationships.length;

	return (
		<Card variant="outlined" className="npc-list-card">
			<Box className="npc-list-card__header">
				<Avatar
					src={resolveNPCPortraitSource(npc)}
					alt={`${displayName} portrait`}
					className="npc-list-card__avatar"
				>
					{initials(displayName)}
				</Avatar>
				<Box className="npc-list-card__identity">
					<Typography
						variant="h6"
						component="h2"
						noWrap
						title={displayName}
					>
						{displayName}
					</Typography>
					{npc.nickName ? (
						<Typography variant="body2" color="text.secondary" noWrap>
							“{npc.nickName}”
						</Typography>
					) : null}
					<Typography variant="caption" color="text.secondary">
						{npc.generation ? "Generated NPC" : "Manual NPC"}
					</Typography>
				</Box>
			</Box>

			<div className="npc-list-card__body">
				<div className="npc-list-card__tags">
					{npc.ancestry?.name ? (
						<span className="npc-list-card__tag" title={npc.ancestry.name}>
							{npc.ancestry.name}
						</span>
					) : null}
					{npc.gender?.name ? (
						<span
							className="npc-list-card__tag"
							title={genderDescription || npc.gender.name}
						>
							{npc.gender.name}
						</span>
					) : null}
					{npc.profession?.name ? (
						<span
							className="npc-list-card__tag"
							title={npc.profession.description || npc.profession.name}
						>
							{npc.profession.name}
						</span>
					) : null}
				</div>

				{npc.currentLocation?.name ? (
					<p className="npc-list-card__line" title={npc.currentLocation.name}>
						<strong>Location:</strong> {npc.currentLocation.name}
					</p>
				) : null}
				{relationshipCount ? (
					<p className="npc-list-card__relationships">
						{relationshipCount} relationship{relationshipCount === 1 ? "" : "s"}
					</p>
				) : null}
			</div>

			<div className="npc-list-card__actions">
				<Link className="npc-list-card__view-link" to={`/view_npc/${npc._id}`}>
					View NPC
				</Link>
			</div>
		</Card>
	);
}

export default memo(NPCCard);
