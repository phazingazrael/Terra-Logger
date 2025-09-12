/* eslint-disable jsx-a11y/label-has-associated-control */
import { useMemo } from "react";
import { Container, Typography, Paper } from "@mui/material";
import { IconContext } from "react-icons";
import { useParams, Link } from "react-router-dom";
import { useDB } from "../../db/DataContext";

import { GiSparkles } from "react-icons/gi";

import type { TLCity } from "../../definitions/TerraLogger";

import "./viewStyles.css";

function CityView() {
	const cityId = useParams();
	const { useActive } = useDB();
	const cities = useActive<TLCity>("cities");
	const city = useMemo(
		() => cities.find((c) => c._id === cityId?._id),
		[cities, cityId?._id],
	);

	const tagStyles = {
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

	const capitalBadge = {
		display: "inline-flex",
		alignItems: "center",
		backgroundColor: "#ffd700",
		border: "1px solid #ddd",
		borderRadius: "10px",
		padding: "2px 8px",
		margin: "3px",
		fontSize: "1em",
		boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
		fontWeight: "bold",
	};

	const DynamicSparkleStyle = {
		height: "1.5rem",
		width: "1.5rem",
		marginTop: "-1.5rem",
		color: "#1794a1",
	};

	const IconStyles = useMemo(() => ({}), []);

	return (
		<Container className="Settings" color="text.secondary">
			<IconContext.Provider value={IconStyles}>
				<div className="contentSubBody">
					<div className="flex-container">
						<div className="wiki">
							<div className="legend">
								<details>
									<summary>Info</summary>
									<p>
										<GiSparkles style={DynamicSparkleStyle} /> = Dynamically
										Loaded Information from Azgaar's Fantasy Map Generator
									</p>
								</details>
							</div>
							<div className="header">
								<div
									className="image"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
									dangerouslySetInnerHTML={{ __html: city?.coaSVG ?? "" }}
								/>
								<div className="info">
									<Typography color="text.secondary" variant="h1">
										{city?.name}
										<GiSparkles style={DynamicSparkleStyle} />
									</Typography>
									<div className="meta">
										<p>
											<Typography color="text.secondary" component="h3">
												Country: {city?.country.name}
												<GiSparkles style={DynamicSparkleStyle} />
											</Typography>
											<Typography color="text.secondary" component="h3">
												Population: {city?.population}
												<GiSparkles style={DynamicSparkleStyle} />
											</Typography>
											<Typography color="text.secondary" component="h3">
												Size: {city?.size}
												<GiSparkles style={DynamicSparkleStyle} />
											</Typography>
											{city?.capital && (
												<Typography
													color="text.secondary"
													component="h3"
													// className="capital-badge"
													style={capitalBadge}
												>
													🏛️ Capital <GiSparkles style={DynamicSparkleStyle} />
												</Typography>
											)}
										</p>
									</div>
								</div>
							</div>

							<main className="content">
								<Paper className="section description">
									<Typography color="text.secondary" component="h2">
										Description
									</Typography>
									<Typography color="text.secondary" component="p">
										{city?.description && city?.description.length > 0
											? city?.description
											: `${city?.name} is a country.`}
									</Typography>
								</Paper>

								<div className="content-grid">
									<Paper className="section features">
										<Typography color="text.secondary" component="h2">
											Features <GiSparkles style={DynamicSparkleStyle} />
										</Typography>
										<Typography color="text.secondary" component="p">
											<div className="tag-list">
												{city?.features.map((feature) => (
													<span key={feature} className="tag" style={tagStyles}>
														{feature}
													</span>
												))}
											</div>
										</Typography>
									</Paper>

									<Paper className="section tags">
										<Typography color="text.secondary" component="h2">
											Tags <GiSparkles style={DynamicSparkleStyle} />
										</Typography>
										<div className="tag-list">
											{city?.tags.map((tag) => (
												<span
													key={tag._id}
													className="tag"
													title={tag.Description}
													style={tagStyles}
												>
													🏷️ {tag.Name}
												</span>
											))}
										</div>
									</Paper>

									<Paper className="section map-link">
										<Typography color="text.secondary" component="h2">
											Map <GiSparkles style={DynamicSparkleStyle} />
										</Typography>
										{city?.mapLink && (
											<Link
												to={city?.mapLink}
												target="_blank"
												rel="noopener noreferrer"
											>
												🗺️ View City Map
											</Link>
										)}
									</Paper>

									<Paper className="section history">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section geography-environment">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section economy-trade">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section government-power">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section demographics-society">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section military-defense">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section education-knowledge">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section culture-arts">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section crime-underworld">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section religion-mythology">
										<Typography color="text.secondary" component="h2">
											Religion & Mythology
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Gods, Demons & Cosmic Entities:
												</Typography>
												<span className="detail-value">
													[Who is worshiped or feared in the city?]
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
									</Paper>

									<Paper className="section notable-locations">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section sister-cities">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section notable-figures">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section adventurers-mercenaries">
										<Typography color="text.secondary" component="h2">
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
									</Paper>

									<Paper className="section additional-info">
										<Typography color="text.secondary" component="h2">
											Additional Information
											<GiSparkles style={DynamicSparkleStyle} />
										</Typography>
										<div className="info">
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Map ID:
												</Typography>
												<span className="detail-value">{city?.mapId}</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Map Seed:
												</Typography>
												<span className="detail-value">{city?.mapSeed}</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													City Type:
												</Typography>
												<span className="detail-value">{city?.type}</span>
											</div>
											<div className="detail-container">
												<Typography component="span" className="detail-label">
													Culture ID:
												</Typography>
												<span className="detail-value">{city?.culture.id}</span>
											</div>
										</div>
									</Paper>
								</div>
							</main>
						</div>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CityView;
