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
						console.log(fullCities);
					}
					setCities(fullCities);
				}
			});
		}
	}, [countryId]);
	const IconStyles = useMemo(() => ({ size: "1.5rem" }), []);
	console.log(JSON.stringify(country));
	console.log(JSON.stringify(cities));

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

	return (
		<Container className="Settings">
			<IconContext.Provider value={IconStyles}>
				<div className="contentSubBody">
					<div className="flex-container">
						<div className="city-wiki">
							<div className="city-header">
								<div
									className="city-image"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
									dangerouslySetInnerHTML={{ __html: country?.coaSVG ?? "" }}
								/>
								<div className="city-info">
									<Typography variant="h1">{country?.name}</Typography>
									<div className="city-meta">
										<p>
											<Typography color="primary" component="h3">
												Country: {country?.nameFull}
											</Typography>
											<Typography color="primary" component="h3">
												Population: {country?.population.total}
											</Typography>
											{/* <Typography color="primary" component="h3">
												Size: {country?.size}
											</Typography>
											{country?.capital && (
												<Typography
													color="primary"
													component="h3"
													className="capital-badge"
												>
													Capital
												</Typography>
											)} */}
										</p>
									</div>
								</div>
							</div>

							<main className="city-content">
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
									<section className="features">
										<Typography color="primary" component="h2">
											Cities
										</Typography>
										<Typography color="primary" component="p">
											<div className="tag-list">
												{cities?.map((city) => (
													<span
														key={city._id}
														title={city.description}
														className="tag"
														style={tagStyle}
													>
														{city.name}
													</span>
												))}
											</div>
										</Typography>
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

									<section className="geography-environment">
										<Typography color="primary" component="h2">
											Geography & Environment
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Location:
												</Typography>
												<span className="detail-value">
													[Describe location within the world, dimension, or
													space sector.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Climate & Atmosphere:
												</Typography>
												<span className="detail-value">
													[Earth-like, toxic, magical storms, artificial
													climate, etc.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Topography & Terrain:
												</Typography>
												<span className="detail-value">
													[Floating islands, underground caverns, space
													stations, etc.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Planar/Dimensional Traits:
												</Typography>
												<span className="detail-value">
													[Is it tied to another plane? Does time move
													differently here?]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Unique Natural Features:
												</Typography>
												<span className="detail-value">
													[Magical ley lines, sentient forests, shifting
													deserts, etc.]
												</span>
											</div>
										</div>
									</section>

									<section className="economy-trade">
										<Typography color="primary" component="h2">
											Economy & Trade
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Major Industries:
												</Typography>
												<span className="detail-value">
													[Alchemy, soul-forging, mecha production, space
													mining, etc.]
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
													[Merchant houses, cybernetic megacorps, thieves’
													guilds, etc.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Imports & Exports:
												</Typography>
												<span className="detail-value">
													[What does the city rely on, and what does it supply
													to others?]
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
										</div>
									</section>

									<section className="government-power">
										<Typography color="primary" component="h2">
											Government & Power Structure
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Government Type:
												</Typography>
												<span className="detail-value">
													[Monarchy, Theocracy, AI-Controlled, Mage Council,
													etc.]
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

									<section className="military-defense">
										<Typography color="primary" component="h2">
											Military & Defense
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													City Guard & Enforcers:
												</Typography>
												<span className="detail-value">
													[Knights, robotic enforcers, spectral guardians, etc.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Standing Army/Navy:
												</Typography>
												<span className="detail-value">
													[Size and structure of land, sea, air, or space
													forces.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Walls & Defenses:
												</Typography>
												<span className="detail-value">
													[Titanium barriers, magical shields, psychic wards.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Notable Weapons & Technology:
												</Typography>
												<span className="detail-value">
													[Arcane cannons, plasma rifles, necromantic
													constructs.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Mercenaries & Private Forces:
												</Typography>
												<span className="detail-value">
													[Who offers protection outside of government control?]
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

									<section className="crime-underworld">
										<Typography color="primary" component="h2">
											Crime & Underworld
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Thieves' Guilds & Crime Syndicates:
												</Typography>
												<span className="detail-value">
													[Who controls the underground economy?]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Black Markets & Smuggling Rings:
												</Typography>
												<span className="detail-value">
													[Illegal tech, cursed artifacts, ancient relics.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Assassins & Mercenaries:
												</Typography>
												<span className="detail-value">
													[Infamous killers, rogue mages, bounty hunters.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Notable Criminals & Outlaws:
												</Typography>
												<span className="detail-value">
													[Legendary thieves, escaped war criminals, anarchist
													hackers.]
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

									<section className="notable-locations">
										<Typography color="primary" component="h2">
											Notable Locations & Landmarks
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													The Great Palace/Throne Room:
												</Typography>
												<span className="detail-value">
													[Seat of power, filled with ancient relics.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													The Arcane University/Tech Lab:
												</Typography>
												<span className="detail-value">
													[Center of magical/scientific advancement.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													The Underbelly/Sewers/Shadow City:
												</Typography>
												<span className="detail-value">
													[Underground city full of secrets.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													The Astral Tower/Observatory:
												</Typography>
												<span className="detail-value">
													[Study of other planes, stars, and cosmic entities.]
												</span>
											</div>
										</div>
									</section>

									<section className="sister-cities">
										<Typography color="primary" component="h2">
											Sister Cities & Interstellar Relations
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Sister Cities & Diplomatic Ties:
												</Typography>
												<span className="detail-value">
													[List of allied cities, rival cities, or otherworldly
													diplomatic ties.]
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

									<section className="adventurers-mercenaries">
										<Typography color="primary" component="h2">
											Adventurers & Mercenary Work
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Common Quests & Jobs:
												</Typography>
												<span className="detail-value">
													[Hunting monsters, retrieving artifacts, political
													assassinations.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Bounty Board:
												</Typography>
												<span className="detail-value">
													[List of wanted criminals, beasts, or other bounties.]
												</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Guilds & Organizations for Adventurers:
												</Typography>
												<span className="detail-value">
													[Who offers work and resources?]
												</span>
											</div>
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
													City Type:
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
