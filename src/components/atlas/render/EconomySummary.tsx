import { GoodLabel } from "../../icons/MapIcon";
import { Fragment } from "react";
import {
	Box,
	Chip,
	List,
	ListItem,
	ListItemText,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import type {
	AtlasRenderContext,
	AtlasSection,
} from "../../../definitions/Atlas";
import type {
  TLCity,
  TLCountry,
  TLEconomyParty,
  TLTradeEntry,
} from "../../../definitions/TerraLogger";

import {
	formatDealAttributionIssue,
	formatEconomyNumber,
	formatTradeEntry,
	hasEconomyBinding,
	normalizeTradeEntries,
} from "../../Util/economy";

function keyEconomyRows<T>(items: readonly T[], identity: (item: T) => string) {
	const occurrences = new Map<string, number>();
	return items.map((item) => {
		const id = identity(item);
		const occurrence = occurrences.get(id) ?? 0;
		occurrences.set(id, occurrence + 1);
		return { item, key: JSON.stringify([id, occurrence]) };
	});
}

export function EconomySummary({
	context,
	section,
}: Readonly<{
	context: AtlasRenderContext;
	section: AtlasSection;
}>) {
	if (context.sourceType !== "city" && context.sourceType !== "country")
		return null;
	const city =
		context.sourceType === "city" ? (context.entity as TLCity) : undefined;
	const country =
		context.sourceType === "country"
			? (context.entity as TLCountry)
			: undefined;
	const economy = city?.economy ?? country?.economy;
	if (!economy) return null;
	const shared = context.economy;
	const production = city?.economy?.production;
	const countryProduction = country?.economy.production;
	const hasImported =
		shared !== undefined ||
		economy.treasury !== undefined ||
		production !== undefined ||
		countryProduction !== undefined ||
		city?.economy?.marketId !== undefined ||
		city?.economy?.product !== undefined ||
		country?.economy.salesTax !== undefined ||
		country?.economy.pollTax !== undefined;
	const imports = normalizeTradeEntries(economy.imports);
	const exports = normalizeTradeEntries(economy.exports);
	const showDescription =
		Boolean(economy.description) &&
		!hasEconomyBinding(section, "economy.description");
	const showImports =
		!hasEconomyBinding(section, "economy.imports") &&
		(imports.length > 0 || shared?.deals !== undefined);
	const showExports =
		!hasEconomyBinding(section, "economy.exports") &&
		(exports.length > 0 || shared?.deals !== undefined);
	if (!hasImported && !showDescription && !showImports && !showExports)
		return null;

	const goods = new Map((shared?.goods ?? []).map((good) => [good.id, good]));
	const deals = new Map((shared?.deals ?? []).map((deal) => [deal.id, deal]));
	const cities = new Map(
		(context.related?.cities ?? []).map((city) => [city.id, city]),
	);
	const market = shared?.markets?.find(
		(market) => market.id === city?.economy?.marketId,
	);
	const unresolvedReasons = new Map<number, string[]>();
	for (const issue of shared?.unresolvedDealIssues ?? []) {
		const reasons = unresolvedReasons.get(issue.dealId) ?? [];
		reasons.push(formatDealAttributionIssue(issue));
		unresolvedReasons.set(issue.dealId, reasons);
	}
	const dealIds = new Set(
		[...imports, ...exports].flatMap((entry) =>
			entry.source === "afmg" ? entry.dealIds : [],
		),
	);
	for (const entry of production ?? [])
		if (entry.type === "deal") dealIds.add(entry.dealId);
	const output = production?.filter((entry) => entry.type !== "deal");
	const finances: [string, number | undefined][] = [
		["Treasury", economy.treasury],
		["Product", city?.economy?.product],
		["Sales tax (source value)", country?.economy.salesTax],
		["Poll tax (source value)", country?.economy.pollTax],
	];

	function goodName(id: number) {
		return <GoodLabel good={goods.get(id)}>{goods.get(id)?.name ?? `Unknown good #${id}`}</GoodLabel>;
	}
	function quantity(units: number, goodId: number) {
		const unit = goods.get(goodId)?.unit;
		return formatEconomyNumber(units) + (unit ? ` ${unit}` : "");
	}
	function partyName(party: TLEconomyParty) {
		return party.type === "city"
			? (cities.get(party.id)?.name ?? `City #${party.id}`)
			: `Market #${party.id}`;
	}
	function renderTradeEntries(label: string, entries: TLTradeEntry[]) {
		return (
			<Box component={city ? "details" : "section"}>
				{city ? (
					<summary>{label}</summary>
				) : (
					<Typography component="h3" className="detail-label">
						{label}
					</Typography>
				)}
				{entries.length === 0 ? (
					<Typography color="text.secondary">No recorded entries.</Typography>
				) : (
					<List dense disablePadding>
						{keyEconomyRows(entries, (entry) => JSON.stringify([entry.source, entry.good])).map(({ item: entry, key }) => (
							<ListItem key={key} disableGutters>
								<ListItemText
									primary={<GoodLabel good={"goodId" in entry.good ? goods.get(entry.good.goodId) : undefined}>{formatTradeEntry(
										entry,
										"goodId" in entry.good
											? goods.get(entry.good.goodId)
											: undefined,
									)}</GoodLabel>}
									secondary={
										entry.source === "afmg"
											? "Imported from AFMG"
											: entry.source === "legacy"
												? "Legacy entry"
												: "Manual entry"
									}
								/>
							</ListItem>
						))}
					</List>
				)}
			</Box>
		);
	}
	function renderLedger(ids: readonly number[], label: string) {
		return (
			<Box component="details">
				<summary>
					{label} ({ids.length})
				</summary>
				<TableContainer>
					<Table size="small" aria-label={label}>
						<TableHead>
							<TableRow>
								<TableCell>Deal</TableCell>
								<TableCell>Seller</TableCell>
								<TableCell>Buyer</TableCell>
								<TableCell>Good</TableCell>
								<TableCell align="right">Quantity</TableCell>
								<TableCell align="right">Price</TableCell>
								<TableCell align="right">Tax</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{ids.map((id) => {
								const deal = deals.get(id);
								if (!deal)
									return (
										<TableRow key={id}>
											<TableCell colSpan={7}>Unavailable deal #{id}</TableCell>
										</TableRow>
									);
								return (
									<Fragment key={id}>
										<TableRow>
											<TableCell>#{id}</TableCell>
											<TableCell>{partyName(deal.seller)}</TableCell>
											<TableCell>{partyName(deal.buyer)}</TableCell>
											<TableCell>{goodName(deal.goodId)}</TableCell>
											<TableCell align="right" title={String(deal.units)}>
												{quantity(deal.units, deal.goodId)}
											</TableCell>
											<TableCell align="right" title={String(deal.price)}>
												{formatEconomyNumber(deal.price)}
											</TableCell>
											<TableCell
												align="right"
												title={
													deal.tax === undefined ? undefined : String(deal.tax)
												}
											>
												{deal.tax === undefined
													? "—"
													: formatEconomyNumber(deal.tax)}
											</TableCell>
										</TableRow>
										{(unresolvedReasons.get(id) ?? []).map((reason) => (
											<TableRow key={reason}>
												<TableCell colSpan={7}>{reason}</TableCell>
											</TableRow>
										))}
									</Fragment>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		);
	}

	return (
		<Box
			className="atlas-economy"
			sx={{
				display: "grid",
				gap: 2,
				minWidth: 0,
				"& .MuiTableCell-root": { verticalAlign: "top" },
				"& .MuiTableCell-alignRight": {
					fontVariantNumeric: "tabular-nums",
					whiteSpace: "nowrap",
				},
				"& details": {
					border: 1,
					borderColor: "divider",
					borderRadius: 1,
					p: 1.5,
					minWidth: 0,
				},
				"& summary": { cursor: "pointer", fontWeight: 600 },
				"& .MuiTableContainer-root": { maxWidth: "100%", overflowX: "auto" },
			}}
		>
			{showDescription ? <Typography>{economy.description}</Typography> : null}
			{finances.some(([, value]) => value !== undefined) ? (
				<Box
					className="atlas-details-list"
					sx={{
						display: "grid",
						gap: 2,
						gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
					}}
				>
					{finances.map(([label, value]) =>
						value === undefined ? null : (
							<Box key={label} className="detail-container">
								<Typography component="span" className="detail-label">
									{label}
								</Typography>
								<Typography
									component="span"
									className="detail-value"
									title={String(value)}
								>
									{formatEconomyNumber(value)}
								</Typography>
							</Box>
						),
					)}
				</Box>
			) : null}
			{showImports || showExports ? (
				<Box
					className="sub-lists"
					sx={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
				>
					{showImports ? renderTradeEntries("Imports", imports) : null}
					{showExports ? renderTradeEntries("Exports", exports) : null}
				</Box>
			) : null}
			{city && hasImported ? (
				<Box component="details">
					<summary>Production</summary>
					{output === undefined ? (
						<Typography color="text.secondary">
							Production data unavailable.
						</Typography>
					) : output.length === 0 ? (
						<Typography color="text.secondary">
							No local or manufactured output recorded.
						</Typography>
					) : (
						<TableContainer>
							<Table size="small" aria-label="City production">
								<TableHead>
									<TableRow>
										<TableCell>Good</TableCell>
										<TableCell align="right">Output</TableCell>
										<TableCell>Activity</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{keyEconomyRows(output, (entry) => `${entry.type}:${entry.goodId}`).map(({ item: entry, key }) => (
										<TableRow key={key}>
											<TableCell>{goodName(entry.goodId)}</TableCell>
											<TableCell align="right" title={String(entry.units)}>
												{quantity(entry.units, entry.goodId)}
											</TableCell>
											<TableCell>
												<Chip
													size="small"
													variant="outlined"
													label={
														entry.type === "local" ? "Local" : "Manufactured"
													}
												/>
												{entry.type === "manufacturing" ? (
													<Box component="details" sx={{ mt: 1 }}>
														<summary>Recipe and modifier</summary>
														{entry.recipe.length === 0 ? (
															<Typography>
																No recipe inputs recorded.
															</Typography>
														) : (
															<ul>
																{keyEconomyRows(entry.recipe, (input) => String(input.goodId)).map(({ item: input, key }) => (
																	<li key={key} title={String(input.units)}>
																		{goodName(input.goodId)}:{" "}
																		{quantity(input.units, input.goodId)}
																	</li>
																))}
															</ul>
														)}
														{entry.productionModifier !== undefined ? (
															<Typography
																title={String(entry.productionModifier)}
															>
																Production modifier:{" "}
																{formatEconomyNumber(entry.productionModifier)}
															</Typography>
														) : null}
													</Box>
												) : null}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</Box>
			) : null}
			{country && hasImported ? (
				<Box component="details">
					<summary>City production totals</summary>
					{!countryProduction ? (
						<Typography color="text.secondary">
							Production data unavailable.
						</Typography>
					) : (
						<>
							<Typography variant="body2" color="text.secondary">
								{countryProduction.reportedCityCount} of{" "}
								{countryProduction.cityCount} cities supplied records. Rural
								production is not included.
							</Typography>
							<TableContainer>
								<Table size="small" aria-label="Country production">
									<TableHead>
										<TableRow>
											<TableCell>Good</TableCell>
											<TableCell align="right">Local</TableCell>
											<TableCell align="right">Manufactured</TableCell>
											<TableCell>Unit</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{countryProduction.goods.map((good) => (
											<TableRow key={good.goodId}>
												<TableCell>{goodName(good.goodId)}</TableCell>
												<TableCell
													align="right"
													title={String(good.localUnits)}
												>
													{formatEconomyNumber(good.localUnits)}
												</TableCell>
												<TableCell
													align="right"
													title={String(good.manufacturedUnits)}
												>
													{formatEconomyNumber(good.manufacturedUnits)}
												</TableCell>
												<TableCell>
													{goods.get(good.goodId)?.unit ?? ""}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}
				</Box>
			) : null}
			{city?.economy?.marketId !== undefined ? (
				<Box component="details">
					<summary>
						Market #{city.economy.marketId} — inventory and prices
					</summary>
					{!market ? (
						<Typography color="text.secondary">
							Market data unavailable.
						</Typography>
					) : (
						<>
							<Typography variant="body2" color="text.secondary">
								Center:{" "}
								{cities.get(market.centerCityId)?.name ??
									`City #${market.centerCityId}`}
								. Inventory belongs to the shared market.
							</Typography>
							<TableContainer>
								<Table size="small" aria-label="Market inventory">
									<TableHead>
										<TableRow>
											<TableCell>Good</TableCell>
											<TableCell align="right">Stock</TableCell>
											<TableCell align="right">Price</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{market.goods.map((stock) => (
											<TableRow key={stock.goodId}>
												<TableCell>{goodName(stock.goodId)}</TableCell>
												<TableCell align="right" title={String(stock.stock)}>
													{quantity(stock.stock, stock.goodId)}
												</TableCell>
												<TableCell align="right" title={String(stock.price)}>
													{formatEconomyNumber(stock.price)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}
				</Box>
			) : null}
			{hasImported ? (
				<Typography variant="body2" color="text.secondary">
					{shared?.deals === undefined
						? "Imported trade data unavailable."
						: city
							? "City imports are recorded purchases; exports are recorded sales."
							: "Country totals use current party ownership: City countries and AFMG market owners. Goods origin and historical ownership are not recorded."}
				</Typography>
			) : null}
			{dealIds.size > 0
				? renderLedger(
						[...dealIds].sort((a, b) => a - b),
						"Trade ledger",
					)
				: null}
			{country && (shared?.unresolvedDealIds?.length ?? 0) > 0 ? (
				<>
					<Typography variant="body2" color="text.secondary">
						These map-wide deals have unresolved party countries and are not
						assigned to this country.
					</Typography>
					{renderLedger(
						shared?.unresolvedDealIds ?? [],
						"Map-wide unresolved trade",
					)}
				</>
			) : null}
		</Box>
	);
}
