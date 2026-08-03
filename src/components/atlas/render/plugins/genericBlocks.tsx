import type {
	AtlasBlock,
	AtlasBlockPlugin,
	AtlasRenderContext,
} from "../../../../definitions/Atlas";
import { Capital, TagStyles } from "../../../../styles";
import {
	readPlainTextFromRichTextValue,
	richTextJsonToHtml,
} from "../../core/richText";
import { formatValue, getEntityValue } from "../pluginUtils";
import {
	Box,
	Card,
	Chip,
	Grid,
	LinearProgress,
	Paper,
	Typography,
	useTheme,
} from "@mui/material";
import { detailsRowResolvers } from "../detailsRowResolvers";
import { resolveGenericDescription } from "../descriptionResolver";

import GroupsIcon from "@mui/icons-material/Groups";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AgricultureIcon from "@mui/icons-material/Agriculture";

import DOMPurify from "dompurify";
import type { Tag } from "../../../../definitions/Common";
import type {
	TLCity,
	TLCountry,
	TLCulture,
} from "../../../../definitions/TerraLogger";
import { memo, useMemo } from "react";

type RichTextRendererProps = {
	value: unknown;
	emptyText: string;
};

const RichTextRenderer = memo(function RichTextRenderer({
	value,
	emptyText,
}: Readonly<RichTextRendererProps>) {
	const text = useMemo(() => readPlainTextFromRichTextValue(value), [value]);
	const sanitized = useMemo(() => {
		if (!text) return "";
		return DOMPurify.sanitize(richTextJsonToHtml(value), {
			USE_PROFILES: { html: true },
			ADD_ATTR: ["target", "rel"],
		});
	}, [text, value]);

	if (!text) return <p>{emptyText}</p>;
	return (
		<div
			className="atlas-rich-text"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized Atlas rich text HTML
			dangerouslySetInnerHTML={{ __html: sanitized }}
		/>
	);
});

const DescriptionRenderer = memo(function DescriptionRenderer({
	context,
	emptyText,
}: Readonly<{ context: AtlasRenderContext; emptyText: string }>) {
	const description = useMemo(
		() => resolveGenericDescription(context),
		[context],
	);
	const sanitized = useMemo(() => {
		if (!description.value || description.format !== "html") return "";
		return DOMPurify.sanitize(description.value, {
			USE_PROFILES: { html: true },
			ADD_ATTR: ["target", "rel"],
		});
	}, [description]);

	if (!description.value) return <p>{emptyText}</p>;
	if (description.format === "html") {
		return (
			<div
				className="atlas-description atlas-description--html"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized description HTML
				dangerouslySetInnerHTML={{ __html: sanitized }}
			/>
		);
	}
	return (
		<p className="atlas-description atlas-description--text">
			{description.value}
		</p>
	);
});

type SplitListRenderGroup = {
	name: string;
	children: unknown[];
	emptyText: string;
};

type EntitySplitListGroupBinding = {
	label?: unknown;
	name?: unknown;
	entityPath?: unknown;
	path?: unknown;
	childrenPath?: unknown;
	emptyText?: unknown;
};

function resolveSplitListGroups(
	block: AtlasBlock,
	context: AtlasRenderContext,
): SplitListRenderGroup[] {
	if (block.dataMode === "entity") {
		const configuredGroups = block.props.groups;

		if (Array.isArray(configuredGroups)) {
			return configuredGroups.flatMap((group, index) => {
				const resolved = resolveEntitySplitListGroup(group, index, context);
				return resolved ? [resolved] : [];
			});
		}

		const sourceValue = getEntityValue(context, block.binding?.entityPath);

		return normalizeSplitListGroups(sourceValue);
	}

	return normalizeSplitListGroups(block.props.groups);
}

function resolveEntitySplitListGroup(
	value: unknown,
	index: number,
	context: AtlasRenderContext,
): SplitListRenderGroup | null {
	if (!value || typeof value !== "object") {
		return null;
	}

	const group = value as EntitySplitListGroupBinding;

	const path =
		typeof group.entityPath === "string"
			? group.entityPath
			: typeof group.path === "string"
				? group.path
				: typeof group.childrenPath === "string"
					? group.childrenPath
					: undefined;

	if (!path) {
		return null;
	}

	const childrenValue = getEntityValue(context, path);

	const name =
		typeof group.label === "string"
			? group.label
			: typeof group.name === "string"
				? group.name
				: `List ${index + 1}`;

	return {
		name,
		children: Array.isArray(childrenValue) ? childrenValue : [],
		emptyText: typeof group.emptyText === "string" ? group.emptyText : "",
	};
}

function normalizeSplitListGroups(value: unknown): SplitListRenderGroup[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.flatMap((group, index) => {
		if (!group || typeof group !== "object") {
			return [];
		}

		const maybeGroup = group as {
			name?: unknown;
			label?: unknown;
			children?: unknown;
			emptyText?: unknown;
		};

		const name =
			typeof maybeGroup.name === "string"
				? maybeGroup.name
				: typeof maybeGroup.label === "string"
					? maybeGroup.label
					: `List ${index + 1}`;

		const children = Array.isArray(maybeGroup.children)
			? maybeGroup.children
			: [];

		const emptyText =
			typeof maybeGroup.emptyText === "string"
				? maybeGroup.emptyText
				: JSON.stringify(maybeGroup.emptyText);

		return [
			{
				name,
				children,
				emptyText,
			},
		];
	});
}

function resolveDetailsRowValue(
	detail: {
		value?: unknown;
		valueMode?: unknown;
		resolver?: unknown;
		args?: unknown;
	},
	context: AtlasRenderContext,
): unknown {
	if (detail.valueMode === "entity" && typeof detail.value === "string") {
		return getEntityValue(context, detail.value);
	}

	if (detail.valueMode === "computed" && typeof detail.resolver === "string") {
		const resolver = detailsRowResolvers[detail.resolver];

		if (!resolver) {
			return undefined;
		}

		return resolver(context, isRecord(detail.args) ? detail.args : undefined);
	}

	return detail.value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEmptyDetailsValue(value: unknown): boolean {
	if (value === undefined || value === null) return true;
	if (typeof value === "string") return value.trim().length === 0;
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

function normalizeComparableDetailsValue(value: unknown): string {
	return String(formatValue(value)).trim().toLocaleLowerCase();
}

function getStringSet(value: unknown): ReadonlySet<string> {
	if (!Array.isArray(value)) {
		return new Set();
	}

	return new Set(value.map(String));
}

function relationshipMatchesRelatedNPCBlock(
	relationship: {
		relatedEntityType: string;
		relatedEntityId: string;
		roleTitle?: string;
		relationshipType: string;
	},
	sourceType: string,
	entityId: string,
	roleTitles: ReadonlySet<string>,
	relationshipTypes: ReadonlySet<string>,
): boolean {
	return (
		relationship.relatedEntityType === sourceType &&
		relationship.relatedEntityId === entityId &&
		(roleTitles.size === 0 || roleTitles.has(relationship.roleTitle ?? "")) &&
		(relationshipTypes.size === 0 ||
			relationshipTypes.has(relationship.relationshipType))
	);
}

export const genericBlockPlugins: Record<string, AtlasBlockPlugin> = {
	heading: {
		type: "heading",
		label: "Heading",
		shouldRender: ({ block }) =>
			typeof block.props.text === "string" &&
			block.props.text.trim().length > 0,
		Render: ({ block }) => {
			const text = block.props.text ?? "";
			return (
				<Typography component="span" className="detail-label">
					{text as string}
				</Typography>
			);
		},
	},
	richText: {
		type: "richText",
		label: "Rich Text",
		shouldRender: ({ block, context }) => {
			const value =
				block.dataMode === "entity"
					? getEntityValue(context, block.binding?.entityPath)
					: block.props.json;

			return readPlainTextFromRichTextValue(value).trim().length > 0;
		},
		Render: ({ block, context }) => {
			const value =
				block.dataMode === "entity"
					? getEntityValue(context, block.binding?.entityPath)
					: block.props.json;

			return (
				<RichTextRenderer
					value={value}
					emptyText={String(block.props.emptyText ?? "No text listed.")}
				/>
			);
		},
	},
	description: {
		type: "description",
		label: "Description",
		shouldRender: ({ context }) =>
			resolveGenericDescription(context).value.trim().length > 0,
		Render: ({ block, context }) => (
			<DescriptionRenderer
				context={context}
				emptyText={String(block.props.emptyText ?? "No description available.")}
			/>
		),
	},
	detailsList: {
		type: "detailsList",
		label: "Details List",
		shouldRender: ({ block, context }) => {
			const rows = Array.isArray(block.props.rows) ? block.props.rows : [];
			return rows.some((row) => {
				const detail = row as {
					value?: unknown;
					valueMode?: unknown;
					resolver?: unknown;
					args?: unknown;
					hideWhenEmpty?: unknown;
					hideWhenEqualTo?: unknown;
				};
				const rawValue = resolveDetailsRowValue(detail, context);

				if (detail.hideWhenEmpty === true && isEmptyDetailsValue(rawValue)) {
					return false;
				}

				if (
					typeof detail.hideWhenEqualTo === "string" &&
					!isEmptyDetailsValue(rawValue)
				) {
					const comparisonValue = getEntityValue(
						context,
						detail.hideWhenEqualTo,
					);
					if (
						!isEmptyDetailsValue(comparisonValue) &&
						normalizeComparableDetailsValue(rawValue) ===
							normalizeComparableDetailsValue(comparisonValue)
					) {
						return false;
					}
				}

				return true;
			});
		},
		Render: ({ block, context }) => {
			const rows = Array.isArray(block.props.rows) ? block.props.rows : [];
			const visibleRows = rows.flatMap((row, index) => {
				const detail = row as {
					label?: unknown;
					value?: unknown;
					valueMode?: unknown;
					resolver?: unknown;
					args?: unknown;
					emptyText?: unknown;
					hideWhenEmpty?: unknown;
					hideWhenEqualTo?: unknown;
				};
				const rawValue = resolveDetailsRowValue(detail, context);

				if (detail.hideWhenEmpty === true && isEmptyDetailsValue(rawValue)) {
					return [];
				}

				if (
					typeof detail.hideWhenEqualTo === "string" &&
					!isEmptyDetailsValue(rawValue)
				) {
					const comparisonValue = getEntityValue(
						context,
						detail.hideWhenEqualTo,
					);
					if (
						!isEmptyDetailsValue(comparisonValue) &&
						normalizeComparableDetailsValue(rawValue) ===
							normalizeComparableDetailsValue(comparisonValue)
					) {
						return [];
					}
				}

				return [{ detail, index, rawValue }];
			});

			if (visibleRows.length === 0) {
				return typeof block.props.emptyText === "string" ? (
					<p>{block.props.emptyText}</p>
				) : null;
			}

			return (
				<div className="atlas-details-list">
					{visibleRows.map(({ detail, index, rawValue }) => {
						const label = detail.label ?? "";
						const renderedValue = isEmptyDetailsValue(rawValue)
							? typeof detail.emptyText === "string"
								? detail.emptyText
								: ""
							: formatValue(rawValue);

						return (
							<div
								key={`detail-${index}-${stableRenderKey(detail.label, "row")}`}
								className="detail-container"
							>
								<Typography component="span" className="detail-label">
									{label as string}:
								</Typography>
								<span className="detail-value">{renderedValue}</span>
							</div>
						);
					})}
				</div>
			);
		},
	},
	chipList: {
		type: "chipList",
		label: "Chip List",
		shouldRender: ({ block }) =>
			Array.isArray(block.props.chips) && block.props.chips.length > 0,
		Render: ({ block }) => {
			const chips = Array.isArray(block.props.chips) ? block.props.chips : [];
			return (
				<div>
					{chips.map((chip) => (
						<span key={`chip-${stableRenderKey(chip, "chip")}`}>
							{String(chip)}
						</span>
					))}
				</div>
			);
		},
	},
	entityField: {
		type: "entityField",
		label: "Entity Field",
		shouldRender: ({ block, context }) =>
			!isEmptyDetailsValue(getEntityValue(context, block.binding?.entityPath)),
		Render: ({ block, context }) => {
			const value = getEntityValue(context, block.binding?.entityPath);
			return (
				<p>
					<strong>
						{(block.props.label ?? block.label ?? "Field") as string}:
					</strong>{" "}
					{formatValue(value)}
				</p>
			);
		},
	},
	entityChipList: {
		type: "entityChipList",
		label: "Entity Chip List",
		shouldRender: ({ block, context }) => {
			if (block.binding?.entityPath === "cities") {
				const country = context.entity as TLCountry;
				const lookupCities = context.relatedLookups?.citiesByCountryId?.get(
					String(context.entity._id),
				);
				const relatedCities = context.related?.cities?.filter(
					(city) => city.country?._id === context.entity._id,
				);

				return (
					(Array.isArray(country.cities) && country.cities.length > 0) ||
					Boolean(lookupCities?.length) ||
					Boolean(relatedCities?.length)
				);
			}

			const value = getEntityValue(context, block.binding?.entityPath);
			return Array.isArray(value) && value.length > 0;
		},
		Render: ({ block, context }) => {
			const value = getEntityValue(context, block.binding?.entityPath);
			const items = Array.isArray(value) ? value : [];

			if (block.binding?.entityPath === "cities") {
				const Country = context?.entity as TLCountry;
				const Cities = Country.cities;
				const dbCities = context?.related?.cities as TLCity[];
				const lookupCities = context.relatedLookups?.citiesByCountryId?.get(
					String(context.entity._id),
				);
				const cities =
					lookupCities ??
					dbCities?.filter(
						(city) => city.country?._id === context.entity._id,
					) ??
					[];

				const cityItems = sortCountryCitiesForRenderer(
					Array.isArray(Cities) && Cities.length ? Cities : cities,
				);

				return (
					<div className="tag-list">
						{cityItems.map((item) => (
							<span
								key={`entity-chip-${stableRenderKey(item, "item")}`}
								className="tag"
								style={
									item.capital === true
										? { ...TagStyles, ...Capital }
										: TagStyles
								}
							>
								{item.capital ? `🏛️ ` : ""}
								{formatValue(item.name)}
							</span>
						))}
					</div>
				);
			}
			if (items.length === 0)
				return <p>{(block.props.emptyText ?? "No items listed.") as string}</p>;
			return (
				<div className="tag-list">
					{items.map((item) => {
						const record = isRecord(item) ? item : {};
						const isCapital = record.capital === true;

						return (
							<span
								key={`entity-chip${stableRenderKey(item, "item")}`}
								className="tag"
								style={isCapital ? { ...TagStyles, ...Capital } : TagStyles}
							>
								{block.binding?.entityPath === "tags" && `🏷️ `}
								{isCapital ? `🏛️ ` : ""}
								{formatValue(item)}
							</span>
						);
					})}
				</div>
			);
		},
	},
	splitList: {
		type: "splitList",
		label: "Split List",
		shouldRender: ({ block, context }) =>
			resolveSplitListGroups(block, context).some(
				(group) => group.children.length > 0,
			),
		Render: ({ block, context }) => {
			const groups = resolveSplitListGroups(block, context);

			if (groups.length === 0) {
				return (
					<p className="atlas-muted">
						{(block.props.emptyText ?? "No items listed.") as string}
					</p>
				);
			}

			return (
				<div className="atlas-split-list sub-lists">
					{groups.map((group, groupIndex) => (
						<section
							// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
							key={`split-group-${groupIndex}-${stableRenderKey(group.name, "group")}`}
							className="atlas-split-list-group sub-list"
						>
							<Typography component="span" className="detail-label">
								{group.name}
							</Typography>

							{group.children.length > 0 ? (
								<ul className="atlas-split-list-items">
									{group.children.map((child, childIndex) => (
										<li
											// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
											key={`split-child-${groupIndex}-${childIndex}-${stableRenderKey(child, "child")}`}
										>
											{formatValue(child)}
										</li>
									))}
								</ul>
							) : (
								<p className="atlas-muted">
									{group.emptyText ?? "No items listed."}
								</p>
							)}
						</section>
					))}
				</div>
			);
		},
	},
	largeTags: {
		type: "largeTags",
		label: "Large Tags",
		shouldRender: ({ context }) => context.entity.tags.length > 0,
		Render: ({ context }) => {
			const Tags = context.entity.tags;
			const theme = useTheme();
			const gridSize =
				Tags.length > 1 && Tags.length < 3 ? 6 : Tags.length > 2 ? 4 : 12;
			return (
				<section className="tags">
					<Typography
						variant="h5"
						gutterBottom
						sx={{ fontWeight: "bold", mb: 3 }}
					>
						Tags
					</Typography>
					<Grid className="tags-grid" container spacing={2}>
						{Tags?.map((tag: Tag) => (
							<Grid
								className="tags-grid-item"
								size={gridSize}
								key={`tag-${stableRenderKey(tag, "tag")}`}
							>
								<Card
									sx={{
										p: 2,
										transition: "transform 0.2s ease, box-shadow 0.2s ease",
										"&:hover": {
											transform: "translateY(-2px)",
											boxShadow: 4,
										},
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											mb: 1,
										}}
									>
										<Chip
											label={tag.Name}
											size="small"
											sx={{
												bgcolor: theme.palette.primary.main,
												color: "white",
												mr: 1,
												fontWeight: "bold",
											}}
										/>
										<Typography variant="caption" color="text.secondary">
											{tag.Type.replace(/([A-Z])/g, " $1").trim()}
										</Typography>
									</Box>
									<Typography variant="body1">{tag.Description}</Typography>
								</Card>
							</Grid>
						))}
					</Grid>
				</section>
			);
		},
	},
	populationBlock: {
		type: "populationBlock",
		label: "Population Block",
		Render: ({ context }) => {
			const theme = useTheme();
			let UrbanPopulation = "" as string | undefined;
			let RuralPopulation = "" as string | undefined;
			let Title = "" as string | undefined;
			if (context?.sourceType === "culture") {
				const culture = context.entity as TLCulture;
				UrbanPopulation = culture.urbanPop;
				RuralPopulation = culture.ruralPop;
				Title = "Population";
			}
			if (context?.sourceType === "religion") {
				if ("members" in context.entity) {
					const culture = context.entity;
					UrbanPopulation = culture.members.urban.toLocaleString("en-US");
					RuralPopulation = culture.members.rural.toLocaleString("en-US");
					Title = "Membership";
				}
			}

			const urbanPopulation = Number.parseInt(
				UrbanPopulation?.replace(/,/g, "") ?? "0",
				10,
			);
			const ruralPopulation = Number.parseInt(
				RuralPopulation?.replace(/,/g, "") ?? "0",
				10,
			);

			const totalPopulation = urbanPopulation + ruralPopulation;

			const ruralPercentage = useMemo(() => {
				if (!totalPopulation) return 0;
				const rural = Number.parseInt(
					RuralPopulation?.replace(/,/g, "") ?? "0",
					10,
				);
				return (rural / totalPopulation) * 100;
			}, [RuralPopulation, totalPopulation]);
			const urbanPercentage = useMemo(() => {
				if (!totalPopulation) return 0;
				const urban = Number.parseInt(
					UrbanPopulation?.replace(/,/g, "") ?? "0",
					10,
				);
				return (urban / totalPopulation) * 100;
			}, [UrbanPopulation, totalPopulation]);

			return (
				<div className="atlas-details-list">
					<Paper className="culturePopPaper culturePopTotal">
						<Box>
							<Typography
								variant="h5"
								gutterBottom
								sx={{ fontWeight: "bold", mb: 3 }}
							>
								{Title}
							</Typography>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 1,
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<GroupsIcon
										sx={{ mr: 1, color: theme.palette.text.secondary }}
									/>
									<Typography variant="h6">Total Population</Typography>
								</Box>
								<Typography
									variant="h4"
									sx={{
										fontWeight: "bold",
										color: theme.palette.primary.main,
									}}
								>
									{totalPopulation.toLocaleString("en-US")}
								</Typography>
							</Box>
						</Box>
					</Paper>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<Paper className="culturePopPaper">
								<Box>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<AgricultureIcon sx={{ mr: 1, color: "#4caf50" }} />
											<Typography variant="subtitle1">Rural</Typography>
										</Box>
										<Typography variant="h6" sx={{ fontWeight: "bold" }}>
											{RuralPopulation}
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={ruralPercentage}
										sx={{
											height: 8,
											borderRadius: 4,
											bgcolor: theme.palette.grey[200],
											"& .MuiLinearProgress-bar": {
												bgcolor: "#4caf50",
												borderRadius: 4,
											},
										}}
									/>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.5 }}
									>
										{ruralPercentage.toFixed(1)}%
									</Typography>
								</Box>
							</Paper>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<Paper className="culturePopPaper">
								<Box>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<LocationCityIcon sx={{ mr: 1, color: "#2196f3" }} />
											<Typography variant="subtitle1">Urban</Typography>
										</Box>
										<Typography variant="h6" sx={{ fontWeight: "bold" }}>
											{UrbanPopulation}
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={urbanPercentage || 0}
										sx={{
											height: 8,
											borderRadius: 4,
											bgcolor: theme.palette.grey[200],
											"& .MuiLinearProgress-bar": {
												bgcolor: "#2196f3",
												borderRadius: 4,
											},
										}}
									/>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.5 }}
									>
										{urbanPercentage.toFixed(1)}%
									</Typography>
								</Box>
							</Paper>
						</Grid>
					</Grid>
				</div>
			);
		},
	},
	relatedNPCList: {
		type: "relatedNPCList",
		label: "Related NPCs",
		shouldRender: ({ block, context }) => {
			const entityId = String((context.entity as { _id?: unknown })._id ?? "");
			const roleTitles = getStringSet(block.props.roleTitles);
			const relationshipTypes = getStringSet(block.props.relationshipTypes);

			return (context.related?.npcs ?? []).some((npc) =>
				npc.relationships.some((relationship) =>
					relationshipMatchesRelatedNPCBlock(
						relationship,
						context.sourceType,
						entityId,
						roleTitles,
						relationshipTypes,
					),
				),
			);
		},
		Render: ({ block, context }) => {
			const entityId = String((context.entity as { _id?: unknown })._id ?? "");
			const roleTitles = getStringSet(block.props.roleTitles);
			const relationshipTypes = getStringSet(block.props.relationshipTypes);
			const matches = (context.related?.npcs ?? []).filter((npc) =>
				npc.relationships.some((relationship) =>
					relationshipMatchesRelatedNPCBlock(
						relationship,
						context.sourceType,
						entityId,
						roleTitles,
						relationshipTypes,
					),
				),
			);
			if (matches.length === 0)
				return (
					<Typography color="text.secondary">
						{String(block.props.emptyText ?? "No related NPCs.")}
					</Typography>
				);
			return (
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
					{matches.map((npc) => {
						const relationship = npc.relationships.find(
							(item) =>
								item.relatedEntityType === context.sourceType &&
								item.relatedEntityId === entityId,
						);
						return (
							<Chip
								key={npc._id}
								label={`${npc.fullName || npc.name}${relationship?.roleTitle ? ` — ${relationship.roleTitle}` : ""}`}
								component="a"
								clickable
								href={`#/view_npc/${npc._id}`}
							/>
						);
					})}
				</Box>
			);
		},
	},
};

function stableRenderKey(value: unknown, fallback: string): string {
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return String(value);
	}

	if (!value) {
		return fallback;
	}

	if (Array.isArray(value)) {
		return `${fallback}-${value
			.map((item, index) => stableRenderKey(item, String(index)))
			.join("-")}`;
	}

	if (typeof value === "object") {
		const record = value as Record<string, unknown>;

		const candidates = [
			record._id,
			record.id,
			record.uuid,
			record.key,
			record.name,
			record.label,
			record.title,
			record.code,
		];

		for (const candidate of candidates) {
			const key = stableRenderKey(candidate, "");

			if (key && key !== "[object Object]") {
				return key;
			}
		}

		try {
			return `${fallback}-${JSON.stringify(record)}`;
		} catch {
			return fallback;
		}
	}

	return fallback;
}

function sortCountryCitiesForRenderer(cities: TLCity[]): TLCity[] {
	return [...cities].sort((a, b) => {
		const aIsCapital = a.capital === true;
		const bIsCapital = b.capital === true;

		if (aIsCapital !== bIsCapital) {
			return aIsCapital ? -1 : 1;
		}

		return getCitySortName(a).localeCompare(getCitySortName(b), undefined, {
			sensitivity: "base",
			numeric: true,
		});
	});
}

function getCitySortName(city: TLCity): string {
	const record = city as Record<string, unknown>;

	return String(record.name ?? record.nameFull ?? record.fullName ?? "");
}
