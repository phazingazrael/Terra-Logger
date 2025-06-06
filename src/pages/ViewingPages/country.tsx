import { useEffect, useState, useMemo } from "react";
import {
	Container,
	Typography,
	LinearProgress,
	Box,
	useTheme,
	Grid2 as Grid,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableBody,
	TableCell,
} from "@mui/material";

import { IconContext } from "react-icons";
import { useParams } from "react-router-dom";
import { getDataFromStore, getFullStore } from "../../db/interactions";

import {
	Agriculture as AgricultureIcon,
	LocationCity as LocationCityIcon,
} from "@mui/icons-material";

import type {
	TLCountry,
	TLDiplomacy,
	TLCity,
} from "../../definitions/TerraLogger";

import "./viewStyles.css";

function CountryView() {
	const countryId = useParams();
	const [country, setCountry] = useState<TLCountry>();
	const [cities, setCities] = useState<TLCity[]>([]);
	const [activeTab, setActiveTab] = useState<string>("regiments");
	const [totalPopulation, setTotalPopulation] = useState(0);
	const [ruralPercentage, setRuralPercentage] = useState(0);
	const [urbanPercentage, setUrbanPercentage] = useState(0);

	// Group military units by type
	const regiments = country?.political.military.filter((unit) => unit.n === 0);
	const fleets = country?.political.military.filter((unit) => unit.n === 1);

	// Group diplomatic relations by status
	const diplomacyGroups: Record<string, TLDiplomacy[]> = {};

	for (const relation of country?.political.diplomacy ?? []) {
		if (relation.status !== "-" && relation.status !== "x") {
			if (!diplomacyGroups[relation.status]) {
				diplomacyGroups[relation.status] = [];
			}
			diplomacyGroups[relation.status].push(relation);
		}
	}

	useEffect(() => {
		if (countryId !== undefined) {
			getDataFromStore("countries", countryId._id).then((data) => {
				setCountry(data as TLCountry);
			});
		}
	}, [countryId]);

	useEffect(() => {
		if (countryId !== undefined) {
			const fullCities = [] as TLCity[];

			getFullStore("cities").then((data) => {
				if (data) {
					for (const city of data) {
						if (city.country._id === countryId._id) {
							fullCities.push(city);
						}
					}
					setCities(fullCities);
				}
			});
		}
	}, [countryId]);

	useEffect(() => {
		if (country) {
			setTotalPopulation(
				Number(country.population.rural.replace(",", "")) +
					Number(country.population.urban.replace(",", "")),
			);
			setRuralPercentage(
				totalPopulation === 0
					? 0
					: (Number(country.population.rural.replace(",", "")) /
							totalPopulation) *
							100,
			);
			setUrbanPercentage(
				totalPopulation === 0
					? 0
					: (Number(country.population.urban.replace(",", "")) /
							totalPopulation) *
							100,
			);
		}
	});

	const theme = useTheme();

	const IconStyles = useMemo(() => ({ size: "1.5rem" }), []);

	const tagStyle = {
		display: "inline-flex",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
		border: "1px solid #ddd",
		borderRadius: "20px",
		padding: "4px 12px",
		margin: "3px",
		fontSize: "0.85em",
		color: "#444",
		boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
		transition: "all 0.2s ease",
	};

	const capitalStyle = {
		display: "inline-flex",
		alignItems: "center",
		backgroundColor: "#ffd700",
		border: "1px solid #ddd",
		borderRadius: "20px",
		padding: "4px 12px",
		margin: "3px",
		fontSize: "0.85em",
		color: "#444",
		boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
		transition: "all 0.2s ease",
	};

	return (
		<Container className="Settings">
			<IconContext.Provider value={IconStyles}>
				<div className="contentSubBody">
					<div className="flex-container">
						<div className="wiki">
							<div className="header">
								<div
									className="image"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
									dangerouslySetInnerHTML={{ __html: country?.coaSVG ?? "" }}
								/>
								<div className="info">
									<Typography variant="h1">{country?.name}</Typography>
									<Grid container className="meta">
										<Grid size={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
											<Typography color="primary" component="h3">
												{country?.nameFull}
											</Typography>
											<Typography color="primary" component="h3">
												Type: {country?.type}
											</Typography>
										</Grid>
										<Grid size={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
											<Grid container className="popGrid">
												<Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
													<section>
														<Box>
															<Box
																sx={{
																	display: "flex",
																	justifyContent: "space-between",
																	alignItems: "center",
																	mb: 1,
																}}
															>
																<Box
																	sx={{ display: "flex", alignItems: "center" }}
																>
																	<Typography
																		color="primary"
																		variant="subtitle1"
																	>
																		Population:
																	</Typography>
																</Box>
																<Typography
																	variant="h6"
																	color="primary"
																	sx={{ fontWeight: "bold" }}
																>
																	{country?.population.total}
																</Typography>
															</Box>
														</Box>
													</section>
													<Grid container spacing={4} sx={{ mt: 2 }}>
														<Grid size={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
															<section>
																<Box>
																	<Box
																		sx={{
																			display: "flex",
																			justifyContent: "space-between",
																			alignItems: "center",
																			mb: 1,
																		}}
																	>
																		<Box
																			sx={{
																				display: "flex",
																				alignItems: "center",
																			}}
																		>
																			<AgricultureIcon
																				sx={{ mr: 1, color: "#4caf50" }}
																			/>
																			<Typography
																				color="primary"
																				variant="subtitle1"
																			>
																				Rural Population:
																			</Typography>
																		</Box>
																	</Box>

																	<Typography
																		variant="h6"
																		color="primary"
																		sx={{ fontWeight: "bold" }}
																	>
																		{country?.population.rural}
																	</Typography>

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
																		color="primary"
																		sx={{ mt: 0.5 }}
																	>
																		{ruralPercentage !== 0
																			? ruralPercentage.toFixed(1)
																			: 0}
																		% of total
																	</Typography>
																</Box>
															</section>
														</Grid>
														<Grid size={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
															<section>
																<Box>
																	<Box
																		sx={{
																			display: "flex",
																			justifyContent: "space-between",
																			alignItems: "center",
																			mb: 1,
																		}}
																	>
																		<Box
																			sx={{
																				display: "flex",
																				alignItems: "center",
																			}}
																		>
																			<LocationCityIcon
																				sx={{ mr: 1, color: "#2196f3" }}
																			/>
																			<Typography
																				variant="subtitle1"
																				color="primary"
																				style={{ width: "100%" }}
																			>
																				Urban Population:
																			</Typography>
																		</Box>
																	</Box>
																	<Typography
																		variant="h6"
																		color="primary"
																		sx={{ fontWeight: "bold" }}
																	>
																		{country?.population.urban}
																	</Typography>
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
																		color="primary"
																		sx={{ mt: 0.5 }}
																	>
																		{urbanPercentage.toFixed(1)}% of total
																	</Typography>
																</Box>
															</section>
														</Grid>
													</Grid>
												</Grid>
											</Grid>
										</Grid>
									</Grid>
								</div>
							</div>

							<main className="content">
								<section className="description">
									<Typography color="primary" component="h2">
										Description
									</Typography>
									<Typography color="primary" component="p">
										{country?.description && country?.description.length > 0
											? country?.description
											: `${country?.name} is a country.`}
									</Typography>
								</section>

								<div className="content-grid">
									<section className="citiesList">
										<Typography color="primary" component="h2">
											Cities
										</Typography>
										<Typography color="primary" component="p">
											<div className="tag-list">
												{cities?.map((city) => (
													<span
														key={city._id}
														title={
															city.capital
																? `Capital city of ${country?.name}. ${city.description}`
																: `${city.name} | ${city.size}`
														}
														className="tag"
														style={city.capital ? capitalStyle : tagStyle}
													>
														{city.capital ? `🏛️ ${city.name}` : city.name}
													</span>
												))}
											</div>
										</Typography>
									</section>

									<section className="political-info">
										<Typography color="primary" component="h2">
											Political Information
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Government Type:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													{`${country?.political.form} (${country?.political.formName})`}
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Capital:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													{cities.find((city) => city.capital)?.name}
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Current Ruler(s):
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[King, High Priestess, AI Overlord, Elder Council,
													etc.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Noble Houses & Factions:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Major power groups, noble families, rival factions.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Laws & Justice System:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Trial by combat? Magic-enforced law? A dystopian
													police state?]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Corruption Level:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Low, moderate, high, controlled by crime syndicates.]
												</Typography>
											</div>
										</div>
									</section>

									<section className="military">
										<Typography color="primary" component="h2">
											Military
										</Typography>
										<div className="military-tabs">
											<button
												type="button"
												className={activeTab === "regiments" ? "active" : ""}
												onClick={() => setActiveTab("regiments")}
											>
												Regiments ({regiments?.length})
											</button>
											<button
												type="button"
												className={activeTab === "fleets" ? "active" : ""}
												onClick={() => setActiveTab("fleets")}
											>
												Fleets ({fleets?.length})
											</button>
										</div>

										<div className="military-content">
											{activeTab === "regiments" && (
												<div className="military-units">
													<TableContainer>
														<Table className="military-table">
															<TableHead>
																<TableRow>
																	<TableCell>Name</TableCell>
																	<TableCell>Strength</TableCell>
																	<TableCell>Composition</TableCell>
																</TableRow>
															</TableHead>
															<TableBody>
																{regiments?.slice(0, 10).map((regiment) => (
																	<TableRow key={regiment._id}>
																		<TableCell>
																			<span className="unit-icon">
																				{regiment.icon}
																			</span>
																			{regiment.name}
																		</TableCell>
																		<TableCell>{regiment.a}</TableCell>
																		<TableCell>
																			{!!regiment.u.cavalry && (
																				<span className="unit-comp">
																					🐴 {regiment.u.cavalry}
																				</span>
																			)}
																			{!!regiment.u.infantry && (
																				<span className="unit-comp">
																					👣 {regiment.u.infantry}
																				</span>
																			)}
																			{!!regiment.u.archers && (
																				<span className="unit-comp">
																					🏹 {regiment.u.archers}
																				</span>
																			)}
																			{!!regiment.u.artillery && (
																				<span className="unit-comp">
																					💣 {regiment.u.artillery}
																				</span>
																			)}
																		</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</TableContainer>
													{regiments && regiments.length > 10 && (
														<p className="more-units">
															+ {regiments.length - 10} more regiments
														</p>
													)}
												</div>
											)}

											{activeTab === "fleets" && (
												<div className="military-units">
													<Table className="military-table">
														<TableHead>
															<TableRow>
																<TableCell>Name</TableCell>
																<TableCell>Strength</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{fleets?.slice(0, 10).map((fleet) => (
																<TableRow key={fleet._id}>
																	<TableCell>
																		<span className="unit-icon">
																			{fleet.icon}
																		</span>
																		{fleet.name}
																	</TableCell>
																	<TableCell>{fleet.a}</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
													{fleets && fleets.length > 10 && (
														<p className="more-units">
															+ {fleets.length - 10} more fleets
														</p>
													)}
												</div>
											)}
										</div>
									</section>

									<section className="economy">
										<Typography component="h2" color="primary">
											Economy
										</Typography>
										<p>
											{country?.economy.description ??
												"No economic information available."}
										</p>

										<div className="economy-lists">
											<div className="economy-list">
												<Typography component="span" className="detail-label">
													Exports
												</Typography>
												{country && country.economy.exports.length > 0 ? (
													<ul>
														{country.economy.exports.map((item) => (
															<li key={item}>
																<Typography
																	component="p"
																	className="detail-value"
																	color="black"
																>
																	{item}
																</Typography>
															</li>
														))}
													</ul>
												) : (
													<Typography
														component="p"
														className="detail-value"
														color="black"
													>
														No exports listed
													</Typography>
												)}
											</div>

											<div className="economy-list">
												<Typography component="span" className="detail-label">
													Imports
												</Typography>
												{country && country.economy.imports.length > 0 ? (
													<ul>
														{country.economy.imports.map((item) => (
															<li key={item}>
																<Typography
																	component="p"
																	className="detail-value"
																	color="black"
																>
																	{item}
																</Typography>
															</li>
														))}
													</ul>
												) : (
													<Typography
														component="p"
														className="detail-value"
														color="black"
													>
														No imports listed
													</Typography>
												)}
											</div>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Major Industries:
											</Typography>
											<Typography
												component="span"
												color="black"
												className="detail-value"
											>
												[Alchemy, soul-forging, mecha production, space mining,
												etc.]
											</Typography>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Currency & Trade:
											</Typography>
											<Typography
												component="span"
												color="black"
												className="detail-value"
											>
												[Gold coins, credits, mana crystals, barter system,
												etc.]
											</Typography>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Notable Guilds & Corporations:
											</Typography>
											<Typography
												component="span"
												color="black"
												className="detail-value"
											>
												[Merchant houses, cybernetic megacorps, thieves’ guilds,
												etc.]
											</Typography>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Imports & Exports:
											</Typography>
											<Typography
												component="span"
												color="black"
												className="detail-value"
											>
												[What does the city rely on, and what does it supply to
												others?]
											</Typography>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Black Market & Illicit Trade:
											</Typography>
											<Typography
												component="span"
												color="black"
												className="detail-value"
											>
												[Contraband, smugglers, underground syndicates.]
											</Typography>
										</div>
									</section>

									<section className="diplomacy">
										<Typography color="primary" component="h2">
											Diplomacy
										</Typography>
										{Object.keys(diplomacyGroups).length > 0 ? (
											<div className="diplomacy-relations">
												{Object.entries(diplomacyGroups).map(
													([status, relations]) => (
														<div key={status} className="diplomacy-group">
															<Typography
																component="span"
																className="detail-label"
																style={{ fontWeight: "bold", width: "100%" }}
															>
																{status}
															</Typography>
															<ul
																className="relation-list"
																style={{ marginTop: "unset" }}
															>
																{relations.map((relation) => (
																	<li key={relation.id}>
																		<Typography
																			component="span"
																			color="black"
																			className="detail-value"
																		>
																			{relation.name}
																		</Typography>
																	</li>
																))}
															</ul>
														</div>
													),
												)}
											</div>
										) : (
											<p>No diplomatic relations listed</p>
										)}
									</section>

									<section className="history">
										<Typography color="primary" component="h2">
											History
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Notable Founding Myths/Legends:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Ancient tales about how the city was formed or its
													divine/magical origins.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Major Wars & Conflicts:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Significant wars, galactic conflicts, magical wars,
													or civil uprisings.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Epochs & Eras:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Different historical periods, dynasties, or
													interstellar ages.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Notable Leaders & Rulers:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Kings, Emperors, Warlords, AI Governors, etc.]
												</Typography>
											</div>
										</div>
									</section>

									<section className="demographics-society">
										<Typography color="primary" component="h2">
											Demographics & Society
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Population Growth & Migration:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Stable, declining, booming, dependent on
													magic/artificial births.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Ethnic & Racial Composition:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Humans, Elves, Orcs, Androids, Clones, etc.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Language & Scripts:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Common tongue, ancient runes, digital code-based
													speech.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Religion & Deities:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Worship of gods, forgotten cosmic entities, AI
													prophets.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Caste/Class System:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Strict hierarchy, meritocracy, anarchist communes,
													slave societies.]
												</Typography>
											</div>
										</div>
									</section>

									<section className="education-knowledge">
										<Typography color="primary" component="h2">
											Education & Knowledge
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Academies & Universities:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Magical academies, science research institutes, AI
													learning centers.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Forbidden Knowledge & Secret Societies:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Cults, hidden libraries, esoteric scholars.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Notable Thinkers & Researchers:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Famous wizards, AI philosophers, other
													intellectuals.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Libraries & Archives:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[World’s largest collection of spell tomes,
													AI-encrypted data vaults.]
												</Typography>
											</div>
										</div>
									</section>

									<section className="culture-arts">
										<Typography color="primary" component="h2">
											Culture, Arts & Entertainment
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Music & Performing Arts:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Bards, holographic opera, psychic concerts.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Festivals & Holidays:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Ritual sacrifice days, AI awakening celebrations,
													etc.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Cuisine & Food Culture:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Elven wine, synthetic protein cubes, soul-infused
													delicacies.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Fashion & Dress:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Steampunk, cybernetic enhancements, enchanted robes.]
												</Typography>
											</div>
										</div>
									</section>

									<section className="religion-mythology">
										<Typography color="primary" component="h2">
											Religion & Mythology
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Gods, Demons & Cosmic Entities:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Who is worshiped or feared in the country?]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Sacred Sites & Temples:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Massive cathedrals, shrines hidden in floating
													cities.]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Religious Factions & Cults:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[What groups enforce (or subvert) faith?]
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Miracles & Divine Interventions:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[Recent divine events or mythological sightings.]
												</Typography>
											</div>
										</div>
									</section>

									<section className="notable-figures">
										<Typography color="primary" component="h2">
											Notable Figures & Legends
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Influential Figures:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													[List of influential people, such as rulers, warriors,
													philosophers, criminals, and deities.]
												</Typography>
											</div>
										</div>
									</section>

									<section className="tags">
										<Typography color="primary" component="h2">
											Tags
										</Typography>
										<div className="tag-list">
											{country?.tags.map((tag) => (
												<span
													key={tag._id}
													className="tag"
													title={tag.Description}
													style={tagStyle}
												>
													🏷️ {tag.Name}
												</span>
											))}
										</div>
									</section>

									<section className="additional-info">
										<Typography color="primary" component="h2">
											Additional Information
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Map ID:
												</Typography>
												{/* <Typography
													component="span"
													color="black"
													className="detail-value"
												>{country?.mapId}</Typography> */}
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Map Seed:
												</Typography>
												{/* <Typography
													component="span"
													color="black"
													className="detail-value"
												>{country?.mapSeed}</Typography> */}
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Country Type:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													{country?.type}
												</Typography>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Culture ID:
												</Typography>
												<Typography
													component="span"
													color="black"
													className="detail-value"
												>
													{country?.culture.id}
												</Typography>
											</div>
										</div>
									</section>
								</div>
							</main>
						</div>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CountryView;
