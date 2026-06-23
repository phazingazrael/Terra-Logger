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
import { useMemo } from "react";

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
			return configuredGroups
				.map((group, index) =>
					resolveEntitySplitListGroup(group, index, context),
				)
				.filter((group): group is SplitListRenderGroup => Boolean(group));
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

	return value
		.map((group, index) => {
			if (!group || typeof group !== "object") {
				return null;
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

			return {
				name,
				children,
				emptyText,
			};
		})
		.filter((group): group is SplitListRenderGroup => {
			if (group === null) return false;
			const { emptyText, ...rest } = group;
			return Boolean(rest);
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

export const genericBlockPlugins: Record<string, AtlasBlockPlugin> = {
	heading: {
		type: "heading",
		label: "Heading",
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
		Render: ({ block, context }) => {
			const value =
				block.dataMode === "entity"
					? getEntityValue(context, block.binding?.entityPath)
					: block.props.json;

			const text = readPlainTextFromRichTextValue(value);

			if (!text) {
				return <p>{(block.props.emptyText ?? "No text listed.") as string}</p>;
			}

			const sanitized = DOMPurify.sanitize(richTextJsonToHtml(value), {
				USE_PROFILES: {
					html: true,
				},
				ADD_ATTR: ["target", "rel"],
			});

			return (
				<div
					className="atlas-rich-text"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized Atlas rich text HTML
					dangerouslySetInnerHTML={{ __html: sanitized }}
				/>
			);
		},
	},
	description: {
		type: "description",
		label: "Description",
		Render: ({ block, context }) => {
			const description = resolveGenericDescription(context);

			if (!description.value) {
				return (
					<p>
						{(block.props.emptyText ?? "No description available.") as string}
					</p>
				);
			}

			if (description.format === "html") {
				const sanitized = DOMPurify.sanitize(description.value, {
					USE_PROFILES: {
						html: true,
					},
					ADD_ATTR: ["target", "rel"],
				});

				return (
					<div
						className="atlas-description atlas-description--html"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: domPUrify in effect
						dangerouslySetInnerHTML={{
							__html: sanitized,
						}}
					/>
				);
			}

			return (
				<p className="atlas-description atlas-description--text">
					{description.value}
				</p>
			);
		},
	},
	detailsList: {
		type: "detailsList",
		label: "Details List",
		Render: ({ block, context }) => {
			const rows = Array.isArray(block.props.rows) ? block.props.rows : [];

			if (rows.length === 0) {
				return (
					<p>{(block.props.emptyText ?? "No details listed.") as string}</p>
				);
			}
			return (
				<div className="atlas-details-list">
					{rows.map((row, index) => {
						const detail = row as {
							label?: unknown;
							value?: unknown;
							valueMode?: unknown;
							emptyText?: unknown;
						};

						const label = detail.label ?? "";

						const rawValue = resolveDetailsRowValue(detail, context);

						const renderedValue =
							rawValue === undefined || rawValue === null || rawValue === ""
								? String(detail.emptyText)
								: formatValue(rawValue);

						return (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
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
		Render: ({ block }) => {
			const chips = Array.isArray(block.props.chips) ? block.props.chips : [];
			return (
				<div>
					{chips.map((chip, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
						<span key={`chip-${index}-${stableRenderKey(chip, "chip")}`}>
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
		Render: ({ block, context }) => {
			const value = getEntityValue(context, block.binding?.entityPath);
			const items = Array.isArray(value) ? value : [];

			if (block.binding?.entityPath === "cities") {
				const Country = context?.entity as TLCountry;
				const Cities = Country.cities;
				const dbCities = context?.related?.cities as TLCity[];
				let cities: TLCity[] = [];
				if (dbCities) {
					cities = dbCities.filter(
						(city) => city.country?._id === context?.entity?._id,
					);
				}

				const cityItems = sortCountryCitiesForRenderer(
					Array.isArray(Cities) && Cities.length ? Cities : cities,
				);

				return (
					<div className="tag-list">
						{cityItems.map((item, index) => (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
								key={`entity-chip-${index}-${stableRenderKey(item, "item")}`}
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
					{items.map((item, index) => {
						const record = isRecord(item) ? item : {};
						const isCapital = record.capital === true;

						return (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
								key={`entity-chip-${index}-${stableRenderKey(item, "item")}`}
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
						{Tags?.map((tag: Tag, index) => (
							<Grid
								className="tags-grid-item"
								size={gridSize}
								// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
								key={`tag-${index}-${stableRenderKey(tag, "tag")}`}
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
			console.log(context);
			if (context?.sourceType === "culture") {
				const culture = context.entity as TLCulture;
				console.log("urban", culture.urbanPop);
				console.log("rural", culture.ruralPop);
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

			const totalPopulation = useMemo(() => {
				const urbNum = Number.parseInt(
					UrbanPopulation?.replace(/,/g, "") ?? "0",
					10,
				);
				const ruralNum = Number.parseInt(
					RuralPopulation?.replace(/,/g, "") ?? "0",
					10,
				);
				return ruralNum + urbNum;
			}, [RuralPopulation, UrbanPopulation]);
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
