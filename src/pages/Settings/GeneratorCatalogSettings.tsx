import {
	Alert,
	Box,
	Button,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { type JSX, type SetStateAction, useEffect, useReducer } from "react";
import { exportSectionTemplateJson } from "../../generators/catalogs/exporters";
import { generatorCatalogRegistry } from "../../generators/catalogs/registry";
import {
	createGeneratorCatalogTemplateArchive,
	GENERATOR_CATALOG_TEMPLATE_ARCHIVE_NAME,
} from "../../generators/catalogs/templateArchive";
import type {
	GeneratorCatalogDocument,
	GeneratorCatalogSectionDefinition,
	GeneratorCatalogValidationIssue,
} from "../../generators/catalogs/types";
import {
	deleteSectionUserCatalog,
	exportSectionUserCatalog,
	getSectionUserRecords,
	previewUserCatalogChanges,
	saveUserCatalog,
	type UserCatalogChangePreview,
	type UserCatalogSaveMode,
} from "../../generators/catalogs/userCatalogRepository";
import {
	isGeneratorCatalogDocument,
	parseGeneratorCatalogJson,
} from "../../generators/catalogs/validation";

function downloadJson(filename: string, contents: string): void {
	downloadBlob(filename, new Blob([contents], { type: "application/json" }));
}

function downloadBlob(filename: string, blob: Blob): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

function previewCount(preview: UserCatalogChangePreview): number {
	return (
		preview.inserted.length + preview.updated.length + preview.removed.length
	);
}

function PreviewList({
	label,
	identifiers,
}: {
	label: string;
	identifiers: string[];
}): JSX.Element {
	return (
		<Typography component="div" variant="body2">
			<strong>{label}:</strong> {identifiers.length}
			{identifiers.length ? ` — ${identifiers.join(", ")}` : ""}
		</Typography>
	);
}

async function getSavedRecordCount(
	selectedSection: GeneratorCatalogSectionDefinition,
): Promise<number> {
	const records = await getSectionUserRecords(selectedSection);
	return records.length;
}

type GeneratorCatalogSettingsState = {
	generatorType: string;
	sectionId: string;
	jsonText: string;
	saveMode: UserCatalogSaveMode;
	issues: GeneratorCatalogValidationIssue[];
	preview: UserCatalogChangePreview | null;
	savedCount: number;
	status: string | null;
	error: string | null;
	busy: boolean;
};

type GeneratorCatalogSettingsAction =
	| { type: "patch"; patch: Partial<GeneratorCatalogSettingsState> }
	| { type: "set"; key: keyof GeneratorCatalogSettingsState; value: SetStateAction<GeneratorCatalogSettingsState[keyof GeneratorCatalogSettingsState]> }
	| { type: "reset-editor"; savedCount?: number };

function generatorCatalogSettingsReducer(
	state: GeneratorCatalogSettingsState,
	action: GeneratorCatalogSettingsAction,
): GeneratorCatalogSettingsState {
	switch (action.type) {
		case "patch":
			return { ...state, ...action.patch };
		case "set": {
			const current = state[action.key];
			const value = typeof action.value === "function"
				? (action.value as (value: typeof current) => typeof current)(current)
				: action.value;
			return { ...state, [action.key]: value };
		}
		case "reset-editor":
			return {
				...state,
				jsonText: "",
				issues: [],
				preview: null,
				status: null,
				error: null,
				savedCount: action.savedCount ?? state.savedCount,
			};
	}
}
function useGeneratorCatalogSettingsModel() {
	const generatorTypes = generatorCatalogRegistry.listTypes();

	const initialGeneratorType = generatorTypes[0]?.id ?? "";
	const initialSections = generatorCatalogRegistry.listSections(initialGeneratorType);
	const [state, dispatch] = useReducer(generatorCatalogSettingsReducer, {
		generatorType: initialGeneratorType,
		sectionId: initialSections[0]?.id ?? "",
		jsonText: "",
		saveMode: "merge",
		issues: [],
		preview: null,
		savedCount: 0,
		status: null,
		error: null,
		busy: false,
	});
	const { generatorType, sectionId, jsonText, saveMode, issues, preview, savedCount, status, error, busy } = state;
	const sections = generatorCatalogRegistry.listSections(generatorType);
	const section = generatorCatalogRegistry.getSection(sectionId);
	const setField = <K extends keyof GeneratorCatalogSettingsState>(key: K, value: SetStateAction<GeneratorCatalogSettingsState[K]>) =>
		dispatch({ type: "set", key, value: value as SetStateAction<GeneratorCatalogSettingsState[keyof GeneratorCatalogSettingsState]> });
	const setGeneratorType = (value: SetStateAction<string>) => setField("generatorType", value);
	const setSectionId = (value: SetStateAction<string>) => setField("sectionId", value);
	const setIssues = (value: SetStateAction<GeneratorCatalogValidationIssue[]>) => setField("issues", value);
	const setPreview = (value: SetStateAction<UserCatalogChangePreview | null>) => setField("preview", value);
	const setSavedCount = (value: SetStateAction<number>) => setField("savedCount", value);
	const setStatus = (value: SetStateAction<string | null>) => setField("status", value);
	const setError = (value: SetStateAction<string | null>) => setField("error", value);
	const setBusy = (value: SetStateAction<boolean>) => setField("busy", value);

	useEffect(() => {
		const firstSection = sections[0];
		if (!sections.some((candidate) => candidate.id === sectionId)) {
			setSectionId(firstSection?.id ?? "");
		}
	}, [sectionId, sections]);

	useEffect(() => {
		dispatch({ type: "reset-editor", savedCount: section ? undefined : 0 });
	}, [section]);

	function validateText(): GeneratorCatalogDocument | null {
		if (!section) return null;
		const parsed = parseGeneratorCatalogJson(jsonText);
		if (!parsed.parsed) {
			setIssues(parsed.issues);
			setPreview(null);
			return null;
		}
		const validation = section.validate(parsed.value, "user-input");
		setIssues(validation.issues);
		setPreview(null);
		if (!validation.valid || !isGeneratorCatalogDocument(parsed.value)) {
			return null;
		}
		return section.normalize(parsed.value);
	}

	function handleValidate(): void {
		dispatch({ type: "patch", patch: { status: null, error: null } });
		const document = validateText();
		if (document) setStatus("Validation succeeded.");
	}

	async function handlePreview(): Promise<void> {
		if (!section) return;
		dispatch({ type: "patch", patch: { status: null, error: null } });
		const document = validateText();
		if (!document) return;
		setBusy(true);
		try {
			const nextPreview = await previewUserCatalogChanges(
				section,
				document,
				saveMode,
			);
			setPreview(nextPreview);
			setStatus("Preview ready. Review it before saving.");
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Preview failed.");
		} finally {
			setBusy(false);
		}
	}

	async function handleSave(): Promise<void> {
		if (!section || !preview) return;
		const document = validateText();
		if (!document) return;
		const currentPreview = await previewUserCatalogChanges(
			section,
			document,
			saveMode,
		);
		setPreview(currentPreview);
		const confirmed = window.confirm(
			`Save this user catalog?\n\nInsert: ${currentPreview.inserted.length}\nUpdate: ${currentPreview.updated.length}\nRemove: ${currentPreview.removed.length}\nUnchanged: ${currentPreview.unchanged.length}`,
		);
		if (!confirmed) return;

		setBusy(true);
		setError(null);
		try {
			await saveUserCatalog(section, document, saveMode);
			setSavedCount(await getSavedRecordCount(section));
			setPreview(null);
			setStatus(
				previewCount(currentPreview)
					? "User catalog saved."
					: "No catalog changes were needed.",
			);
		} catch (reason) {
			setError(
				reason instanceof Error ? reason.message : "Catalog save failed.",
			);
		} finally {
			setBusy(false);
		}
	}

	async function handleExport(): Promise<void> {
		if (!section) return;
		setBusy(true);
		setError(null);
		try {
			const json = await exportSectionUserCatalog(section);
			downloadJson(`${section.id}.user.json`, json);
			setStatus("Current user catalog exported.");
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Export failed.");
		} finally {
			setBusy(false);
		}
	}

	async function handleDelete(): Promise<void> {
		if (!section || savedCount === 0) return;
		if (
			!window.confirm(
				`Delete all ${savedCount} saved user records in ${section.label}? Default records will not be affected.`,
			)
		) {
			return;
		}
		setBusy(true);
		setError(null);
		try {
			const deleted = await deleteSectionUserCatalog(section);
			setSavedCount(0);
			setPreview(null);
			setStatus(`Deleted ${deleted} user record${deleted === 1 ? "" : "s"}.`);
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Delete failed.");
		} finally {
			setBusy(false);
		}
	}

	async function handleTemplateArchive(): Promise<void> {
		setBusy(true);
		setError(null);
		try {
			const archive = await createGeneratorCatalogTemplateArchive();
			downloadBlob(GENERATOR_CATALOG_TEMPLATE_ARCHIVE_NAME, archive);
			setStatus("Generator catalog templates downloaded.");
		} catch (reason) {
			setError(
				reason instanceof Error
					? reason.message
					: "Template archive creation failed.",
			);
		} finally {
			setBusy(false);
		}
	}

	function changeJsonText(value: string): void {
		dispatch({
			type: "patch",
			patch: {
				jsonText: value,
				issues: [],
				preview: null,
				status: null,
				error: null,
			},
		});
	}

	function changeSaveMode(value: UserCatalogSaveMode): void {
		dispatch({
			type: "patch",
			patch: { saveMode: value, preview: null, status: null },
		});
	}

	function loadExample(): void {
		if (!section) return;
		dispatch({
			type: "patch",
			patch: {
				jsonText: exportSectionTemplateJson(section),
				issues: [],
				preview: null,
				status: null,
				error: null,
			},
		});
	}

	function resetText(): void {
		dispatch({ type: "reset-editor" });
	}
	return {
		generatorTypes,
		generatorType,
		setGeneratorType,
		sections,
		sectionId,
		setSectionId,
		section,
		jsonText,
		saveMode,
		issues,
		preview,
		savedCount,
		status,
		error,
		busy,
		handleValidate,
		handlePreview,
		handleSave,
		handleExport,
		handleDelete,
		handleTemplateArchive,
		changeJsonText,
		changeSaveMode,
		loadExample,
		resetText,
	};
}

function GeneratorCatalogSettingsView(model: ReturnType<typeof useGeneratorCatalogSettingsModel>) {
	const {
		generatorTypes,
		generatorType,
		setGeneratorType,
		sections,
		sectionId,
		setSectionId,
		section,
		jsonText,
		saveMode,
		issues,
		preview,
		savedCount,
		status,
		error,
		busy,
		handleValidate,
		handlePreview,
		handleSave,
		handleExport,
		handleDelete,
		handleTemplateArchive,
		changeJsonText,
		changeSaveMode,
		loadExample,
		resetText,
	} = model;
	return (
		<Box className="generatorCatalogSettings">
			<Typography variant="h6" component="h4">
				Generator Catalogs
			</Typography>
			<Typography variant="body2" sx={{ mb: 2 }}>
				Add user-owned generator data with the section JSON format. Built-in
				default catalogs cannot be changed here.
			</Typography>
			<Button
				variant="contained"
				disabled={busy}
				onClick={() => void handleTemplateArchive()}
				sx={{ mb: 2 }}
			>
				Download Generator Catalog Templates
			</Button>

			<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
				<FormControl fullWidth>
					<InputLabel id="generator-data-type-label">
						Generator Data Type
					</InputLabel>
					<Select
						labelId="generator-data-type-label"
						value={generatorType}
						label="Generator Data Type"
						onChange={(event) => setGeneratorType(event.target.value)}
					>
						{generatorTypes.map((type) => (
							<MenuItem key={type.id} value={type.id}>
								{type.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<FormControl fullWidth>
					<InputLabel id="catalog-section-label">Catalog Section</InputLabel>
					<Select
						labelId="catalog-section-label"
						value={sectionId}
						label="Catalog Section"
						onChange={(event) => setSectionId(event.target.value)}
					>
						{sections.map((catalogSection) => (
							<MenuItem key={catalogSection.id} value={catalogSection.id}>
								{catalogSection.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Stack>

			<Typography variant="body2" sx={{ mt: 1 }}>
				Saved user records in this section: {savedCount}
			</Typography>

			<TextField
				fullWidth
				multiline
				minRows={16}
				label="Catalog JSON"
				value={jsonText}
				onChange={(event) => changeJsonText(event.target.value)}
				slotProps={{ htmlInput: { spellCheck: false } }}
				sx={{ mt: 2 }}
			/>

			<FormControl sx={{ mt: 1 }}>
				<RadioGroup
					row
					value={saveMode}
					onChange={(event) =>
						changeSaveMode(event.target.value as UserCatalogSaveMode)
					}
				>
					<FormControlLabel value="merge" control={<Radio />} label="Merge" />
					<FormControlLabel
						value="replace"
						control={<Radio />}
						label="Replace User Section"
					/>
				</RadioGroup>
			</FormControl>
			<Typography variant="caption" display="block">
				Merge preserves unlisted user records. Replace removes unlisted user
				records from this section only.
			</Typography>

			<Stack
				direction="row"
				useFlexGap
				flexWrap="wrap"
				spacing={1}
				sx={{ mt: 2 }}
			>
				<Button
					variant="outlined"
					disabled={!section || busy}
					onClick={loadExample}
				>
					Load Example
				</Button>
				<Button
					variant="outlined"
					disabled={!jsonText || busy}
					onClick={handleValidate}
				>
					Validate
				</Button>
				<Button
					variant="outlined"
					disabled={!jsonText || busy}
					onClick={() => void handlePreview()}
				>
					Preview Changes
				</Button>
				<Button
					variant="contained"
					disabled={!preview || busy}
					onClick={() => void handleSave()}
				>
					Save User Catalog
				</Button>
				<Button
					variant="outlined"
					disabled={!jsonText || busy}
					onClick={resetText}
				>
					Reset Text
				</Button>
				<Button
					variant="outlined"
					disabled={!section || busy}
					onClick={() => void handleExport()}
				>
					Export Current User Catalog
				</Button>
				<Button
					color="error"
					variant="outlined"
					disabled={!section || savedCount === 0 || busy}
					onClick={() => void handleDelete()}
				>
					Delete Saved User Catalog
				</Button>
			</Stack>

			{issues.length > 0 && (
				<Alert severity="error" sx={{ mt: 2 }}>
					{issues.map((issue) => (
						<div key={`${issue.path}:${issue.code}`}>
							{issue.path}: {issue.message}
						</div>
					))}
				</Alert>
			)}
			{preview && (
				<Alert
					severity={previewCount(preview) ? "info" : "success"}
					sx={{ mt: 2 }}
				>
					<PreviewList label="Insert" identifiers={preview.inserted} />
					<PreviewList label="Update" identifiers={preview.updated} />
					<PreviewList label="Remove" identifiers={preview.removed} />
					<PreviewList label="Unchanged" identifiers={preview.unchanged} />
				</Alert>
			)}
			{status && (
				<Alert severity="success" sx={{ mt: 2 }}>
					{status}
				</Alert>
			)}
			{error && (
				<Alert severity="error" sx={{ mt: 2 }}>
					{error}
				</Alert>
			)}
		</Box>
	);
}

function GeneratorCatalogSettings(): JSX.Element {
	const model = useGeneratorCatalogSettingsModel();
	return <GeneratorCatalogSettingsView {...model} />;
}

export default GeneratorCatalogSettings;
