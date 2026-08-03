import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, useReducer } from "react";
import { listAncestryDefinitions } from "../generator/ancestries/repository";
import { generateNPCDraft } from "../generator/engine/generate";
import { listGenderDefinitions } from "../generator/genders/repository";
import { listNPCProfessions } from "../generator/professions/repository";
import { createPersistentNPCFromDraft } from "../persistence/fromDraft";
import { addNPC } from "../persistence/repository";
import type {
	AncestryDefinition,
	GeneratedNPCDraft,
	GenderDefinition,
	NPCGenerationConstraints,
	NPCProfessionDefinition,
} from "../types";
import type { TLNPC } from "../../../definitions/TerraLogger";
import BookLoader from "../../Util/bookLoader";

const RANDOM_VALUE = "__random__";
const UNSPECIFIED_VALUE = "__unspecified__";

export type GuidedNPCCreationContext = {
	mode?: "manual" | "contextual";
	title?: string;
	initialConstraints?: NPCGenerationConstraints;
};

export type GuidedNPCCreationDialogProps = {
	open: boolean;
	mapId: string;
	context?: GuidedNPCCreationContext;
	onClose: () => void;
	onSaved?: (npc: TLNPC) => void;
};

function namingGuidance(ancestryName: string): string | null {
	switch (ancestryName.trim().toLocaleLowerCase()) {
		case "dragonkin":
			return "Dragonkin display their clan name first. Their child name is used as a nickname earned during childhood.";
		case "giant":
			return "Giants commonly use a personal name together with a family, clan, or tribal name.";
		case "halfling":
			return "Halfling nicknames are commonly formed from two descriptive name parts and may be used alongside the character's given name.";
		case "demonkin":
			return "Demonkin may use a virtue name as a nickname in addition to their personal and family names.";
		default:
			return null;
	}
}

function allowedGenders(
	ancestryId: string | undefined,
	ancestries: readonly AncestryDefinition[],
	genders: readonly GenderDefinition[],
): readonly GenderDefinition[] {
	if (!ancestryId) return genders;
	const ancestry = ancestries.find((entry) => entry.id === ancestryId);
	if (!ancestry) return genders;

	const fantasyGenderIds = new Set(ancestry.fantasyGenderIds ?? []);
	const allowedGenderIds = new Set(ancestry.allowedGenderIds ?? []);

	return genders.filter((gender) => {
		if (
			gender.applicableAncestryIds?.length &&
			!gender.applicableAncestryIds.includes(ancestry.id)
		) {
			return false;
		}

		if (gender.catalog === "fantasy") {
			return fantasyGenderIds.has(gender.id);
		}

		if (allowedGenderIds.size) {
			return allowedGenderIds.has(gender.id);
		}

		return true;
	});
}


type GuidedCreationState = {
	ancestries: AncestryDefinition[];
	genders: GenderDefinition[];
	professions: NPCProfessionDefinition[];
	ancestryId: string;
	genderId: string;
	professionId: string;
	draft: GeneratedNPCDraft | null;
	loadingCatalogs: boolean;
	generating: boolean;
	saving: boolean;
	error: string | null;
};

type GuidedCreationAction =
	| { type: "open"; constraints?: NPCGenerationConstraints }
	| { type: "catalogs-loaded"; ancestries: AncestryDefinition[]; genders: GenderDefinition[]; professions: NPCProfessionDefinition[] }
	| { type: "catalogs-failed"; error: string }
	| { type: "set-ancestry"; value: string }
	| { type: "set-gender"; value: string }
	| { type: "set-profession"; value: string }
	| { type: "generation-started" }
	| { type: "generation-succeeded"; draft: GeneratedNPCDraft }
	| { type: "generation-failed"; error: string }
	| { type: "save-started" }
	| { type: "save-finished" }
	| { type: "save-failed"; error: string }
	| { type: "closed" };

const INITIAL_GUIDED_STATE: GuidedCreationState = {
	ancestries: [],
	genders: [],
	professions: [],
	ancestryId: RANDOM_VALUE,
	genderId: RANDOM_VALUE,
	professionId: RANDOM_VALUE,
	draft: null,
	loadingCatalogs: false,
	generating: false,
	saving: false,
	error: null,
};

function guidedCreationReducer(
	state: GuidedCreationState,
	action: GuidedCreationAction,
): GuidedCreationState {
	switch (action.type) {
		case "open":
			return {
				...state,
				ancestryId: action.constraints?.ancestryId ?? RANDOM_VALUE,
				genderId: action.constraints?.genderId ?? RANDOM_VALUE,
				professionId: action.constraints?.professionId ?? RANDOM_VALUE,
				draft: null,
				loadingCatalogs: true,
				generating: false,
				saving: false,
				error: null,
			};
		case "catalogs-loaded":
			return { ...state, ancestries: action.ancestries, genders: action.genders, professions: action.professions, loadingCatalogs: false };
		case "catalogs-failed":
			return { ...state, loadingCatalogs: false, error: action.error };
		case "set-ancestry": return { ...state, ancestryId: action.value };
		case "set-gender": return { ...state, genderId: action.value };
		case "set-profession": return { ...state, professionId: action.value };
		case "generation-started": return { ...state, generating: true, error: null };
		case "generation-succeeded": return { ...state, generating: false, draft: action.draft };
		case "generation-failed": return { ...state, generating: false, draft: null, error: action.error };
		case "save-started": return { ...state, saving: true, error: null };
		case "save-finished": return { ...state, saving: false };
		case "save-failed": return { ...state, saving: false, error: action.error };
		case "closed": return { ...state, draft: null, error: null };
	}
}

export default function GuidedNPCCreationDialog({
	open,
	mapId,
	context,
	onClose,
	onSaved,
}: GuidedNPCCreationDialogProps) {
	const [state, dispatch] = useReducer(guidedCreationReducer, INITIAL_GUIDED_STATE);
	const { ancestries, genders, professions, ancestryId, genderId, professionId, draft, loadingCatalogs, generating, saving, error } = state;

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		dispatch({ type: "open", constraints: context?.initialConstraints });
		Promise.all([
			listAncestryDefinitions(),
			listGenderDefinitions(),
			listNPCProfessions(),
		])
			.then(([nextAncestries, nextGenders, nextProfessions]) => {
				if (cancelled) return;
				dispatch({ type: "catalogs-loaded", ancestries: nextAncestries, genders: nextGenders, professions: nextProfessions });
			})
			.catch((cause: unknown) => {
				if (!cancelled)
					dispatch({ type: "catalogs-failed", error: cause instanceof Error ? cause.message : "Generator catalogs could not be loaded." });
			})
;
		return () => {
			cancelled = true;
		};
	}, [open, context?.initialConstraints]);

	const visibleGenders = useMemo(
		() =>
			allowedGenders(
				ancestryId === RANDOM_VALUE ? undefined : ancestryId,
				ancestries,
				genders,
			),
		[ancestryId, ancestries, genders],
	);

	useEffect(() => {
		if (
			genderId !== RANDOM_VALUE &&
			!visibleGenders.some((gender) => gender.id === genderId)
		)
			dispatch({ type: "set-gender", value: RANDOM_VALUE });
	}, [genderId, visibleGenders]);

	function buildConstraints(): NPCGenerationConstraints {
		return {
			...context?.initialConstraints,
			ancestryId: ancestryId === RANDOM_VALUE ? undefined : ancestryId,
			genderId: genderId === RANDOM_VALUE ? undefined : genderId,
			professionId:
				professionId === RANDOM_VALUE || professionId === UNSPECIFIED_VALUE
					? undefined
					: professionId,
		};
	}

	async function generate(): Promise<void> {
		dispatch({ type: "generation-started" });
		try {
			dispatch({ type: "generation-succeeded", draft: await generateNPCDraft({ constraints: buildConstraints() }) });
		} catch (cause) {
			dispatch({ type: "generation-failed", error: cause instanceof Error ? cause.message : "The NPC could not be generated." });
		}
	}

	async function save(): Promise<void> {
		if (!draft) return;
		dispatch({ type: "save-started" });
		try {
			const npc = createPersistentNPCFromDraft(draft, {
				mapId,
				mode: context?.mode ?? "manual",
				constraints: buildConstraints(),
			});
			await addNPC(npc);
			dispatch({ type: "save-finished" });
			onSaved?.(npc);
			onClose();
		} catch (cause) {
			dispatch({ type: "save-failed", error: cause instanceof Error ? cause.message : "The NPC could not be saved." });
		}
	}

	function close(): void {
		if (saving) return;
		dispatch({ type: "closed" });
		onClose();
	}

	return (
		<Dialog open={open} onClose={close} fullWidth maxWidth="md">
			<DialogTitle>{context?.title ?? "Create NPC"}</DialogTitle>
			<DialogContent dividers>
				{loadingCatalogs ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
						<BookLoader />
					</Box>
				) : null}
				{error ? (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				) : null}
				{!loadingCatalogs ? (
					<Stack spacing={2}>
						<Typography variant="body2">
							Choose constraints or leave a field random. Generation remains
							temporary until Save is selected.
						</Typography>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
								gap: 2,
							}}
						>
							<FormControl fullWidth>
								<InputLabel id="npc-create-ancestry">Race</InputLabel>
								<Select
									labelId="npc-create-ancestry"
									label="Race"
									value={ancestryId}
									onChange={(event) => dispatch({ type: "set-ancestry", value: event.target.value })}
								>
									<MenuItem value={RANDOM_VALUE}>Random</MenuItem>
									{ancestries.map((ancestry) => (
										<MenuItem key={ancestry.id} value={ancestry.id}>
											{ancestry.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl fullWidth>
								<InputLabel id="npc-create-gender">Gender</InputLabel>
								<Select
									labelId="npc-create-gender"
									label="Gender"
									value={genderId}
									onChange={(event) => dispatch({ type: "set-gender", value: event.target.value })}
								>
									<MenuItem value={RANDOM_VALUE}>Random</MenuItem>
									{visibleGenders.map((gender) => (
										<MenuItem key={gender.id} value={gender.id}>
											<Tooltip title={gender.description} placement="right">
												<span>{gender.name}</span>
											</Tooltip>
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl fullWidth>
								<InputLabel id="npc-create-profession">Profession</InputLabel>
								<Select
									labelId="npc-create-profession"
									label="Profession"
									value={professionId}
									onChange={(event) => dispatch({ type: "set-profession", value: event.target.value })}
								>
									<MenuItem value={RANDOM_VALUE}>Random</MenuItem>
									<MenuItem value={UNSPECIFIED_VALUE}>Unspecified</MenuItem>
									{professions.map((profession) => (
										<MenuItem key={profession.id} value={profession.id}>
											{profession.category === "government"
												? `Government — ${profession.name}`
												: profession.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>
						<Box>
							<Button
								variant="contained"
								onClick={generate}
								disabled={generating || saving}
							>
								{generating ? "Generating…" : draft ? "Regenerate" : "Generate"}
							</Button>
						</Box>
						{draft ? (
							<Box
								sx={{
									border: 1,
									borderColor: "divider",
									borderRadius: 1,
									p: 2,
								}}
							>
								<Typography variant="h5" component="h2">
									{draft.fullName}
								</Typography>
								{draft.nickName ? (
									<Typography variant="subtitle1" sx={{ fontStyle: "italic" }}>
										Nickname: {draft.nickName}
									</Typography>
								) : null}
								<Typography>
									{draft.catalog.ancestry.name} · {draft.catalog.gender.name} ·{" "}
									{draft.profession.title}
								</Typography>
								{namingGuidance(draft.catalog.ancestry.name) ? (
									<Alert severity="info" sx={{ mt: 1, mb: 1 }}>
										{namingGuidance(draft.catalog.ancestry.name)}
									</Alert>
								) : null}
								{draft.pronouns.length ? (
									<Typography variant="body2">
										Pronouns: {draft.pronouns.join(" / ")}
									</Typography>
								) : null}
								<Typography variant="body2" sx={{ mt: 1 }}>
									{draft.profession.description}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									Appearance:{" "}
									{[
										draft.build,
										draft.skin.tone,
										draft.eye.color && `${draft.eye.color} eyes`,
										draft.hair.color && `${draft.hair.color} hair`,
									]
										.filter(Boolean)
										.join(", ") || "Not specified"}
								</Typography>
								<Typography variant="body2">
									Demeanor: {draft.demeanor || "Not specified"}
								</Typography>
							</Box>
						) : null}
					</Stack>
				) : null}
			</DialogContent>
			<DialogActions>
				<Button onClick={close} disabled={saving}>
					Cancel
				</Button>
				<Button variant="contained" onClick={save} disabled={!draft || saving}>
					{saving ? "Saving…" : "Save NPC"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
