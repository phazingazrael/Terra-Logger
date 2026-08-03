import {
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Divider,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
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

export default function NPCCard({
	npc,
	genderDescription,
}: Readonly<{ npc: TLNPC; genderDescription?: string }>) {
	const displayName = npc.fullName || npc.name || "Unnamed NPC";
	return (
		<Card
			variant="outlined"
			sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
		>
			<Box
				sx={{ display: "flex", gap: 2, alignItems: "center", p: 2, pb: 1.5 }}
			>
				<Avatar
					src={resolveNPCPortraitSource(npc)}
					alt={`${displayName} portrait`}
					sx={{ width: 72, height: 72, flexShrink: 0 }}
				>
					{initials(displayName)}
				</Avatar>
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="h6" component="h2" noWrap title={displayName}>
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
			<Divider />
			<CardContent sx={{ flexGrow: 1, pt: 2 }}>
				<Stack direction="row" gap={1} flexWrap="wrap">
					{npc.ancestry?.name ? (
						<Chip size="small" label={npc.ancestry.name} />
					) : null}
					{npc.gender?.name ? (
						<Tooltip
							title={genderDescription || "No gender description is available."}
							arrow
						>
							<Chip size="small" label={npc.gender.name} />
						</Tooltip>
					) : null}
					{npc.profession?.name ? (
						<Tooltip title={npc.profession.description || ""}>
							<Chip size="small" label={npc.profession.name} />
						</Tooltip>
					) : null}
				</Stack>
				{npc.currentLocation?.name ? (
					<Typography variant="body2" sx={{ mt: 2 }}>
						<strong>Location:</strong> {npc.currentLocation.name}
					</Typography>
				) : null}
				{npc.relationships.length ? (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						{npc.relationships.length} relationship
						{npc.relationships.length === 1 ? "" : "s"}
					</Typography>
				) : null}
			</CardContent>
			<CardActions sx={{ px: 2, pb: 2 }}>
				<Button
					fullWidth
					component={Link}
					to={`/view_npc/${npc._id}`}
					color="secondary"
					variant="contained"
				>
					View NPC
				</Button>
			</CardActions>
		</Card>
	);
}
