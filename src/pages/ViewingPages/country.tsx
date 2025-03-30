/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState, useMemo } from "react";
import { Container, Typography } from "@mui/material";
import { IconContext } from "react-icons";
import { useParams } from "react-router-dom";
import { getDataFromStore, getFullStore } from "../../db/interactions";

import "./viewStyles.css";

function CountryView() {
	const countryId = useParams();
	const [country, setCountry] = useState<TLCountry>();
	const [cities, setCities] = useState<TLCity[]>([]);
	const [activeTab, setActiveTab] = useState<string>("regiments");

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
									<div className="meta">
										<p>
											<Typography color="primary" component="h3">
												{country?.nameFull}
											</Typography>
											<Typography color="primary" component="h3">
												Type: {country?.type}
											</Typography>
											<Typography color="primary" component="h3">
												Population:
												<ul className="population-list">
													<li>Total: {country?.population.total}</li>
													<li>Urban: {country?.population.urban}</li>
													<li>Rural: {country?.population.rural}</li>
												</ul>
											</Typography>
										</p>
									</div>
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
												<span className="detail-value">
													{`${country?.political.form} (${country?.political.formName})`}
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Capital:
												</Typography>
												<span className="detail-value">
													{cities.find((city) => city.capital)?.name}
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Current Ruler(s):
												</Typography>
												<span className="detail-value">
													[King, High Priestess, AI Overlord, Elder Council,
													etc.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Noble Houses & Factions:
												</Typography>
												<span className="detail-value">
													[Major power groups, noble families, rival factions.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Laws & Justice System:
												</Typography>
												<span className="detail-value">
													[Trial by combat? Magic-enforced law? A dystopian
													police state?]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Corruption Level:
												</Typography>
												<span className="detail-value">
													[Low, moderate, high, controlled by crime syndicates.]
												</span>
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
													<table className="military-table">
														<thead>
															<tr>
																<th>Name</th>
																<th>Strength</th>
																<th>Composition</th>
															</tr>
														</thead>
														<tbody>
															{regiments?.slice(0, 10).map((regiment) => (
																<tr key={regiment._id}>
																	<td>
																		<span className="unit-icon">
																			{regiment.icon}
																		</span>
																		{regiment.name}
																	</td>
																	<td>{regiment.a}</td>
																	<td>
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
																	</td>
																</tr>
															))}
														</tbody>
													</table>
													{regiments && regiments.length > 10 && (
														<p className="more-units">
															+ {regiments.length - 10} more regiments
														</p>
													)}
												</div>
											)}

											{activeTab === "fleets" && (
												<div className="military-units">
													<table className="military-table">
														<thead>
															<tr>
																<th>Name</th>
																<th>Strength</th>
															</tr>
														</thead>
														<tbody>
															{fleets?.slice(0, 10).map((fleet) => (
																<tr key={fleet._id}>
																	<td>
																		<span className="unit-icon">
																			{fleet.icon}
																		</span>
																		{fleet.name}
																	</td>
																	<td>{fleet.a}</td>
																</tr>
															))}
														</tbody>
													</table>
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
															<li key={item}>{item}</li>
														))}
													</ul>
												) : (
													<p>No exports listed</p>
												)}
											</div>

											<div className="economy-list">
												<Typography component="span" className="detail-label">
													Imports
												</Typography>
												{country && country.economy.imports.length > 0 ? (
													<ul>
														{country.economy.imports.map((item) => (
															<li key={item}>{item}</li>
														))}
													</ul>
												) : (
													<p>No imports listed</p>
												)}
											</div>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Major Industries:
											</Typography>
											<span className="detail-value">
												[Alchemy, soul-forging, mecha production, space mining,
												etc.]
											</span>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Currency & Trade:
											</Typography>
											<span className="detail-value">
												[Gold coins, credits, mana crystals, barter system,
												etc.]
											</span>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Notable Guilds & Corporations:
											</Typography>
											<span className="detail-value">
												[Merchant houses, cybernetic megacorps, thieves’ guilds,
												etc.]
											</span>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Imports & Exports:
											</Typography>
											<span className="detail-value">
												[What does the city rely on, and what does it supply to
												others?]
											</span>
										</div>
										<div className="detail-container">
											<Typography component="span" className="detail-label">
												Black Market & Illicit Trade:
											</Typography>
											<span className="detail-value">
												[Contraband, smugglers, underground syndicates.]
											</span>
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
																	<li key={relation.id}>{relation.name}</li>
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
												<span className="detail-value">
													[Ancient tales about how the city was formed or its
													divine/magical origins.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Major Wars & Conflicts:
												</Typography>
												<span className="detail-value">
													[Significant wars, galactic conflicts, magical wars,
													or civil uprisings.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Epochs & Eras:
												</Typography>
												<span className="detail-value">
													[Different historical periods, dynasties, or
													interstellar ages.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Notable Leaders & Rulers:
												</Typography>
												<span className="detail-value">
													[Kings, Emperors, Warlords, AI Governors, etc.]
												</span>
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
												<span className="detail-value">
													[Stable, declining, booming, dependent on
													magic/artificial births.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Ethnic & Racial Composition:
												</Typography>
												<span className="detail-value">
													[Humans, Elves, Orcs, Androids, Clones, etc.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Language & Scripts:
												</Typography>
												<span className="detail-value">
													[Common tongue, ancient runes, digital code-based
													speech.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Religion & Deities:
												</Typography>
												<span className="detail-value">
													[Worship of gods, forgotten cosmic entities, AI
													prophets.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Caste/Class System:
												</Typography>
												<span className="detail-value">
													[Strict hierarchy, meritocracy, anarchist communes,
													slave societies.]
												</span>
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
												<span className="detail-value">
													[Magical academies, science research institutes, AI
													learning centers.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Forbidden Knowledge & Secret Societies:
												</Typography>
												<span className="detail-value">
													[Cults, hidden libraries, esoteric scholars.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Notable Thinkers & Researchers:
												</Typography>
												<span className="detail-value">
													[Famous wizards, AI philosophers, other
													intellectuals.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Libraries & Archives:
												</Typography>
												<span className="detail-value">
													[World’s largest collection of spell tomes,
													AI-encrypted data vaults.]
												</span>
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
												<span className="detail-value">
													[Bards, holographic opera, psychic concerts.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Festivals & Holidays:
												</Typography>
												<span className="detail-value">
													[Ritual sacrifice days, AI awakening celebrations,
													etc.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Cuisine & Food Culture:
												</Typography>
												<span className="detail-value">
													[Elven wine, synthetic protein cubes, soul-infused
													delicacies.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Fashion & Dress:
												</Typography>
												<span className="detail-value">
													[Steampunk, cybernetic enhancements, enchanted robes.]
												</span>
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
												<span className="detail-value">
													[Who is worshiped or feared in the country?]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Sacred Sites & Temples:
												</Typography>
												<span className="detail-value">
													[Massive cathedrals, shrines hidden in floating
													cities.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Religious Factions & Cults:
												</Typography>
												<span className="detail-value">
													[What groups enforce (or subvert) faith?]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Miracles & Divine Interventions:
												</Typography>
												<span className="detail-value">
													[Recent divine events or mythological sightings.]
												</span>
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
												<span className="detail-value">
													[List of influential people, such as rulers, warriors,
													philosophers, criminals, and deities.]
												</span>
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
												{/* <span className="detail-value">{country?.mapId}</span> */}
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Map Seed:
												</Typography>
												{/* <span className="detail-value">{country?.mapSeed}</span> */}
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Country Type:
												</Typography>
												<span className="detail-value">{country?.type}</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Culture ID:
												</Typography>
												<span className="detail-value">
													{country?.culture.id}
												</span>
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
