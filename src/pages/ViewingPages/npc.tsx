import {
	Alert,
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	AtlasRenderer,
	PageEditor,
	ensureNPCAtlasSystemSections,
	getAtlasAdapter,
	isAtlasContent,
} from "../../components/atlas";
import type {
	AtlasContent,
	AtlasPageEditorSavePayload,
} from "../../definitions/Atlas";
import { NPCPortraitEditor } from "../../components/NPC/editing";
import { generateNPCHistoryForRecords } from "../../components/NPC/history";
import {
	generateNPCDraft,
	type NPCGenerationConstraints,
} from "../../components/NPC/generator/engine";
import { createPersistentNPCFromDraft } from "../../components/NPC/persistence";
import { createInverseNPCRelationship } from "../../components/NPC/relationships";
import { getGenderDefinition } from "../../components/NPC/generator/genders";
import { resolveNPCPortraitSource } from "../../components/NPC/portraits";
import { useActive, useDB } from "../../db/DataContext";
import type { Tag } from "../../definitions/Common";
import type { NPCRelationship, TLNPC } from "../../definitions/TerraLogger";
import type {
	TLCity,
	TLCountry,
	TLCulture,
	TLNote,
	TLReligion,
} from "../../definitions/TerraLogger";
import "./viewStyles.css";

function useNPCViewModel() {
	const { _id } = useParams();
	const navigate = useNavigate();
	const { activeMapId, add, update, remove, preload, isActiveLoaded } = useDB();
	const npcs = useActive<TLNPC>("npcs");
	const npcsLoaded = isActiveLoaded("npcs");
	const cities = useActive<TLCity>("cities");
	const countries = useActive<TLCountry>("countries");
	const cultures = useActive<TLCulture>("cultures");
	const religions = useActive<TLReligion>("religions");
	const notes = useActive<TLNote>("notes");
	const tags = useActive<Tag>("tags");
	const [npc, setNPC] = useState<TLNPC | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [genderDescription, setGenderDescription] = useState("");
	const [editing, setEditing] = useState(false);
	const [historyBusy, setHistoryBusy] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteBusy, setDeleteBusy] = useState(false);
	const adapter = getAtlasAdapter("npc");

	useEffect(() => {
		let cancelled = false;
		setError(null);
		if (!npcsLoaded) {
			setLoading(true);
			return () => {
				cancelled = true;
			};
		}
		const record = npcs.find((item) => item._id === _id);
		if (!record || (activeMapId && record.mapId !== activeMapId)) {
			setNPC(null);
			setLoading(false);
			return () => {
				cancelled = true;
			};
		}
		setNPC(record);
		setLoading(true);
		(async () => {
			try {
				if (record.gender?.id) {
					const gender = await getGenderDefinition(record.gender.id);
					if (!cancelled) setGenderDescription(gender?.description || "");
				} else if (!cancelled) {
					setGenderDescription("");
				}
			} catch (cause) {
				if (!cancelled)
					setError(
						cause instanceof Error ? cause.message : "NPC could not be loaded.",
					);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [_id, activeMapId, npcs, npcsLoaded]);

	const content = useMemo<AtlasContent | null>(
		() =>
			npc
				? ensureNPCAtlasSystemSections(
						isAtlasContent(npc.content)
							? npc.content
							: adapter.createDefaultContent(npc),
						npc,
					)
				: null,
		[adapter, npc],
	);
	const context = useMemo(
		() =>
			npc
				? {
						sourceType: "npc" as const,
						entity: npc,
						related: {
							cities,
							countries,
							cultures,
							religions,
							notes,
							npcs,
							tags,
						},
					}
				: null,
		[npc, cities, countries, cultures, religions, notes, npcs, tags],
	);
	async function generateHistory(
		draftNPC: TLNPC,
		replaceDraft: (next: { entity?: TLNPC }) => void,
	) {
		if (!activeMapId) return;
		setHistoryBusy(true);
		setError(null);
		try {
			const working = structuredClone(draftNPC);
			await generateNPCHistoryForRecords([working], activeMapId, {
				replaceGenerated: true,
			});
			const stamped = { ...working, updatedAt: new Date().toISOString() };
			await update("npcs", stamped._id, stamped);
			setNPC(stamped);
			replaceDraft({ entity: stamped });
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "NPC history could not be generated.",
			);
		} finally {
			setHistoryBusy(false);
		}
	}

	async function saveNPC(next: TLNPC) {
		const stamped = { ...next, updatedAt: new Date().toISOString() };
		await update("npcs", stamped._id, stamped);
		setNPC(stamped);
	}

	async function syncInverseRelationships(
		previous: NPCRelationship[],
		relationships: NPCRelationship[],
	) {
		if (!npc) return;
		const changedNPCIds = new Set<string>();
		for (const item of [...previous, ...relationships]) {
			if (item.relatedEntityType === "npc") {
				changedNPCIds.add(item.relatedEntityId);
			}
		}

		const npcById = new Map(npcs.map((item) => [item._id, item]));
		await Promise.all(
			Array.from(changedNPCIds, (relatedId) => {
				const related = npcById.get(relatedId);
				if (!related || related._id === npc._id) return Promise.resolve();

				const desired = relationships.filter(
					(item) =>
						item.relatedEntityType === "npc" &&
						item.relatedEntityId === relatedId,
				);
				const unrelated = (related.relationships ?? []).filter(
					(item) =>
						!(
							item.relatedEntityType === "npc" &&
							item.relatedEntityId === npc._id &&
							item.source === "manual"
						),
				);
				const inverse = desired.map((item) =>
					createInverseNPCRelationship(item, npc._id),
				);

				return update("npcs", related._id, {
					...related,
					relationships: [...unrelated, ...inverse],
					updatedAt: new Date().toISOString(),
				});
			}),
		);
	}

	const leadershipRelationships = useMemo(
		() =>
			(npc?.relationships ?? []).filter(
				(relationship) =>
					relationship.primary === true ||
					["rules", "leads"].includes(
						relationship.relationshipType.toLocaleLowerCase(),
					),
			),
		[npc],
	);

	async function removeDeletedNPCRelationships(deletedNPCId: string) {
		const updates = npcs.flatMap((relatedNPC) => {
			if (relatedNPC._id === deletedNPCId) return [];

			const relationships = (relatedNPC.relationships ?? []).filter(
				(relationship) =>
					!(
						relationship.relatedEntityType === "npc" &&
						relationship.relatedEntityId === deletedNPCId
					),
			);
			if (relationships.length === (relatedNPC.relationships ?? []).length) {
				return [];
			}

			return [
				update("npcs", relatedNPC._id, {
					...relatedNPC,
					relationships,
					updatedAt: new Date().toISOString(),
				}),
			];
		});

		await Promise.all(updates);
	}

	async function deleteCurrentNPC(replaceLeadership: boolean) {
		if (!npc || !activeMapId) return;
		setDeleteBusy(true);
		setError(null);
		try {
			if (replaceLeadership && leadershipRelationships.length > 0) {
				const constraints = (npc.generation?.constraints ??
					{}) as NPCGenerationConstraints;
				const draft = await generateNPCDraft({ constraints });
				const replacement = createPersistentNPCFromDraft(draft, {
					mapId: activeMapId,
					mode: "contextual",
					constraints,
				});
				replacement.currentLocation = npc.currentLocation
					? { ...npc.currentLocation }
					: undefined;
				replacement.relationships = leadershipRelationships.map(
					(relationship) => ({
						...relationship,
						id: `relationship:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`,
						createdAt: replacement.createdAt,
						updatedAt: replacement.updatedAt,
					}),
				);
				await add("npcs", replacement);
				await remove("npcs", npc._id);
				await removeDeletedNPCRelationships(npc._id);
				await preload(["npcs"]);
				navigate(`/view_npc/${replacement._id}`, { replace: true });
			} else {
				await remove("npcs", npc._id);
				await removeDeletedNPCRelationships(npc._id);
				await preload(["npcs"]);
				navigate("/npcs", { replace: true });
			}
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "NPC could not be deleted.",
			);
		} finally {
			setDeleteBusy(false);
			setDeleteOpen(false);
		}
	}

	async function saveAtlas(payload: AtlasPageEditorSavePayload<"npc">) {
		const updatedAt = new Date().toISOString();
		const updated = {
			...payload.entity,
			content: {
				...payload.content,
				source: {
					...payload.content.source,
					type: "npc" as const,
					entityId: payload.entity._id,
					mapId: payload.entity.mapId,
				},
				meta: {
					...payload.content.meta,
					title: payload.entity.fullName || payload.entity.name,
					updatedAt,
				},
			},
			updatedAt,
		};
		await saveNPC(updated);
		await syncInverseRelationships(
			npc?.relationships ?? [],
			updated.relationships ?? [],
		);
		setEditing(false);
	}

	return {
		adapter,
		content,
		context,
		deleteBusy,
		deleteCurrentNPC,
		deleteOpen,
		error,
		generateHistory,
		genderDescription,
		historyBusy,
		leadershipRelationships,
		loading,
		name: npc?.fullName || npc?.name || "Unnamed NPC",
		npc,
		saveAtlas,
		saveNPC,
		setDeleteOpen,
		setEditing,
		editing,
	};
}

function NPCViewView(model: ReturnType<typeof useNPCViewModel>) {
	const {
		adapter,
		content,
		context,
		deleteBusy,
		deleteCurrentNPC,
		deleteOpen,
		error,
		generateHistory,
		genderDescription,
		historyBusy,
		leadershipRelationships,
		loading,
		name,
		npc,
		saveAtlas,
		saveNPC,
		setDeleteOpen,
		setEditing,
		editing,
	} = model;

	if (loading) {
		return (
			<Container>
				<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
					<CircularProgress />
				</Box>
			</Container>
		);
	}

	if (error) {
		return (
			<Container>
				<Alert severity="error">{error}</Alert>
			</Container>
		);
	}

	if (!npc || !content || !context) {
		return (
			<Container>
				<Alert severity="warning">
					The requested NPC does not exist in the active map.
				</Alert>
			</Container>
		);
	}

	if (editing) {
		return (
			<Container className="ViewPage NPC">
				<Paper variant="outlined" sx={{ mb: 2, overflow: "hidden" }}>
					<PageEditor
						key={npc._id}
						content={content}
						adapter={adapter}
						context={context}
						onSave={saveAtlas}
						onClose={() => setEditing(false)}
						renderToolbarActions={({ entity, replaceDraft }) => (
							<>
								<Button
									type="button"
									variant="outlined"
									color="secondary"
									disabled={historyBusy || deleteBusy}
									onClick={() => generateHistory(entity, replaceDraft)}
								>
									{historyBusy ? "Generating History…" : "Generate History"}
								</Button>
								<Button
									type="button"
									variant="outlined"
									color="error"
									disabled={historyBusy || deleteBusy}
									onClick={() => setDeleteOpen(true)}
								>
									Delete NPC
								</Button>
							</>
						)}
						inlineSections={[
							{
								id: "npc-portrait-editor",
								title: "Portrait",
								render: (
									<NPCPortraitEditor
										key={`${npc._id}:${npc.updatedAt}`}
										portrait={npc.portrait}
										onSave={async (portrait) => {
											await saveNPC({ ...npc, portrait });
										}}
									/>
								),
							},
						]}
					/>
				</Paper>
				<Dialog
					open={deleteOpen}
					onClose={() => !deleteBusy && setDeleteOpen(false)}
					fullWidth
					maxWidth="sm"
				>
					<DialogTitle>Delete {name}?</DialogTitle>
					<DialogContent dividers>
						{leadershipRelationships.length > 0 ? (
							<Stack spacing={2}>
								<Alert severity="warning">
									This NPC holds{" "}
									{leadershipRelationships.length === 1
										? "a leadership position"
										: "leadership positions"}
									. You may delete them and leave the position vacant, or
									generate a replacement first.
								</Alert>
								{leadershipRelationships.map((relationship) => (
									<Typography key={relationship.id} variant="body2">
										<strong>{relationship.roleTitle || "Leader"}</strong> —{" "}
										{relationship.relatedEntityType}{" "}
										{relationship.relatedEntityId}
									</Typography>
								))}
							</Stack>
						) : (
							<Typography>
								This action permanently deletes the NPC and cannot be undone.
							</Typography>
						)}
					</DialogContent>
					<DialogActions>
						<Button disabled={deleteBusy} onClick={() => setDeleteOpen(false)}>
							Cancel
						</Button>
						<Button
							color="error"
							disabled={deleteBusy}
							onClick={() => deleteCurrentNPC(false)}
						>
							{deleteBusy ? "Deleting…" : "Delete Only"}
						</Button>
						{leadershipRelationships.length > 0 ? (
							<Button
								variant="contained"
								color="warning"
								disabled={deleteBusy}
								onClick={() => deleteCurrentNPC(true)}
							>
								Generate Replacement & Delete
							</Button>
						) : null}
					</DialogActions>
				</Dialog>
			</Container>
		);
	}

	return (
		<Container className="ViewPage NPC">
			<Box className="contentSubBody">
				<Box className="wiki">
					<Stack
						direction="row"
						spacing={1}
						justifyContent="flex-end"
						flexWrap="wrap"
					>
						<Button
							variant="contained"
							onClick={() => setEditing(true)}
							disabled={historyBusy}
						>
							Edit NPC
						</Button>
					</Stack>
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={3}
						alignItems={{ xs: "flex-start", md: "center" }}
					>
						<Avatar
							src={resolveNPCPortraitSource(npc)}
							alt={`${name} portrait`}
							sx={{ width: 160, height: 160, fontSize: 40 }}
						>
							{name.slice(0, 2).toUpperCase()}
						</Avatar>
						<Box>
							<Typography variant="h3" component="h1">
								{name}
							</Typography>
							{npc.nickName ? (
								<Typography variant="h6">{npc.nickName}</Typography>
							) : null}
							<Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
								{npc.ancestry?.name ? <Chip label={npc.ancestry.name} /> : null}
								{npc.gender?.name ? (
									<Tooltip
										title={
											genderDescription || "No gender description is available."
										}
										arrow
									>
										<Chip label={npc.gender.name} />
									</Tooltip>
								) : null}
								{npc.profession?.name ? (
									<Tooltip title={npc.profession.description || ""}>
										<Chip label={npc.profession.name} />
									</Tooltip>
								) : null}
							</Stack>
						</Box>
					</Stack>
					<Divider sx={{ my: 3 }} />
					<AtlasRenderer content={content} context={context} />
				</Box>
			</Box>
		</Container>
	);
}

export default function NPCView() {
	const model = useNPCViewModel();
	return <NPCViewView {...model} />;
}
