/** biome-ignore-all lint/correctness/useHookAtTopLevel: ignore */
/** biome-ignore-all lint/suspicious/noExplicitAny: ignore */
import {
	Paper,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
} from "@mui/material";
import { GiSparkles } from "react-icons/gi";

import { Link, useLocation, useParams } from "react-router-dom";
import { useDB } from "../../db/DataContext";
import { useState } from "react";

import JsonView from "@uiw/react-json-view";

import type {
	TLCity,
	TLCountry,
	TLDiplomacy,
} from "../../definitions/TerraLogger";

import {
	Capital,
	TagStyles,
	DynamicSparkle,
	SemiDynamicSparkle,
	DynamicSparkleSmall,
} from "../../styles";

function buildKey(element: any, fallback?: string) {
	const type = element?.type ?? "unknown";
	const p = element?.props ?? {};

	const title = p.title;
	const listName = p.listName ?? p.listname;
	const className = p.className ?? p.classname;
	const label = p.label;
	const text = p.text;
	const name = p.name;
	const itemType = p.itemtype ?? p.itemType;

	const parts = [
		type,
		title && `title:${title}`,
		listName && `list:${listName}`,
		className && `class:${className}`,
		itemType && `item:${itemType}`,
		label && `label:${label}`,
		text && `text:${String(text).slice(0, 32)}`,
		name && `name:${name}`,
	].filter(Boolean);

	const candidate = (p.key ?? parts.join("|")) as string;
	return candidate === type && fallback ? `${type}|${fallback}` : candidate;
}

function JsonUI(
	element: { type: string; props?: any; children?: any },
	path = "root",
) {
	// type: Defines the component type (View, Text, Button, etc.).
	// ‍props: Contains properties like styles, text values, and event handlers.
	// ‍children: Represents nested elements inside a component.

	const { pathname } = useLocation();
	const segments = pathname.split("/").filter(Boolean);

	const { type, props = {}, children } = element;

	const ID = useParams();
	const { useActive } = useDB();
	const cities = useActive<TLCity>("cities");
	const countries = useActive<TLCountry>("countries");
	const city = cities.find((c) => c._id === ID?._id);
	const country = countries.find((c) => c._id === ID?._id);

	const citiesList = cities.filter((city) => city.country._id === ID?._id);

	const regiments = country?.political.military.filter((unit) => unit.n === 0);
	const fleets = country?.political.military.filter((unit) => unit.n === 1);

	const [activeTab, setActiveTab] = useState<string>("regiments");

	if (!element || !element.type) return "Invalid element";

	// "Components"
	const View = (p: any) => <div {...p} />;

	const Section = (p: any) => <Paper {...p} />;

	const Text = ({ text }: { text: string }) => <span>{text}</span>;

	const Script = (p: any) => <Typography {...p} />;

	const Icon = ({ name, style }: { name: string; style?: string }) => {
		if (name === "GiSparkles") {
			if (style === "DynamicSparkle")
				return <GiSparkles style={DynamicSparkle} />;
			if (style === "SemiDynamicSparkle")
				return <GiSparkles style={SemiDynamicSparkle} />;
			if (style === "DynamicSparkleSmall")
				return <GiSparkles style={DynamicSparkleSmall} />;
			return <GiSparkles />;
		}
		return null;
	};

	const DataList = (p: any) => {
		if (segments[0] === "view_city") {
			if (p.listtype === "Chips") {
				if (p.listname === "features") {
					return (
						<div {...p}>
							{city?.features?.map((feature) => (
								<span key={feature} className="tag" style={TagStyles}>
									{feature}
								</span>
							))}
						</div>
					);
				}
				if (p.listname === "tags") {
					return (
						<div {...p}>
							{city?.tags.map((tag) => (
								<span
									key={tag._id}
									className="tag"
									title={tag.Description}
									style={TagStyles}
								>
									🏷️ {tag.Name}
								</span>
							))}
						</div>
					);
				}
			}
		}
		if (segments[0] === "view_country") {
			if (p.listtype === "Chips") {
				if (p.listname === "cities") {
					return (
						<div {...p}>
							{citiesList?.map((city) => (
								<span
									key={city._id}
									title={
										city.capital
											? `Capital city of ${country?.name}. ${city.description}`
											: `${city.name} | ${city.size}`
									}
									className="tag"
									style={city.capital ? Capital : TagStyles}
								>
									{city.capital ? `🏛️ ${city.name}` : city.name}
								</span>
							))}
						</div>
					);
				}
				if (p.listname === "tags") {
					return (
						<div {...p}>
							{country?.tags.map((tag) => (
								<span
									key={tag._id}
									className="tag"
									title={tag.Description}
									style={TagStyles}
								>
									🏷️ {tag.Name}
								</span>
							))}
						</div>
					);
				}
			}
		}
	};

	const Linkage = (p: any) => {
		if (p.linkname === "cityMap") {
			if (!city) return null;
			return (
				<Link to={city?.mapLink} target={p.target} rel={p.rel}>
					{p.text || "View City Map"}
				</Link>
			);
		}
	};

	const List = (p: any) => {
		if (segments[0] === "view_city") {
			if (p.listname === "AdditionalInfo") {
				if (city) {
					return (
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
					);
				}
			}
		}
		if (segments[0] === "view_country") {
			if (p.listtype === "Military") {
				return (
					<div key={`military-${ID}`}>
						<div className="tabs">
							<button
								key={`military-regiments-btn-${ID}`}
								type="button"
								className={activeTab === "regiments" ? "active" : ""}
								onClick={() => setActiveTab("regiments")}
							>
								Regiments ({regiments?.length})
							</button>
							<button
								key={`military-fleets-btn-${ID}`}
								type="button"
								className={activeTab === "fleets" ? "active" : ""}
								onClick={() => setActiveTab("fleets")}
							>
								Fleets ({fleets?.length})
							</button>
						</div>

						<div key={`military-content-${ID}`} className="military-content">
							{activeTab === "regiments" && (
								<div
									key={`military-regiments-${ID}`}
									className="military-units"
								>
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
															<span className="unit-icon">{regiment.icon}</span>
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
								<div key={`military-fleets-${ID}`} className="military-units">
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
														<span className="unit-icon">{fleet.icon}</span>
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
					</div>
				);
			}
			if (p.listtype === "Unordered" && p.listname === "DiplomacyList") {
				const diplomacyGroups: Record<string, TLDiplomacy[]> = {};

				for (const relation of country?.political.diplomacy ?? []) {
					if (relation.status !== "-" && relation.status !== "x") {
						if (!diplomacyGroups[relation.status]) {
							diplomacyGroups[relation.status] = [];
						}
						diplomacyGroups[relation.status].push(relation);
					}
				}
				return Object.keys(diplomacyGroups).length > 0 ? (
					<div className="diplomacy-relations">
						{Object.entries(diplomacyGroups).map(([status, relations]) => (
							<div key={status} className="diplomacy-group">
								<Typography
									component="span"
									className="detail-label"
									style={{ fontWeight: "bold", width: "100%" }}
								>
									{status}
								</Typography>
								<ul className="relation-list" style={{ marginTop: "unset" }}>
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
						))}
					</div>
				) : (
					<p>No diplomatic relations listed</p>
				);
			}
			if (p.listtype === "Unordered") {
				const items = children;
				console.log(items);
				return (
					<>
						{!!p.listheading && (
							<Typography
								component="span"
								className="detail-label"
								style={{ fontWeight: "bold", width: "100%" }}
							>
								{p.listheading}
							</Typography>
						)}

						<ul className="relation-list" style={{ marginTop: "unset" }}>
							{items.map(
								(item: {
									type: string;
									props: { text: string; itemtype: string };
								}) => (
									<li key={item.props.text + item.props.itemtype}>
										{item.props.text}
									</li>
								),
							)}
						</ul>
					</>
				);
			}
			if (p.listname === "AdditionalInfo") {
				return (
					<div className="info">
						<div className="detail-container">
							<Typography component="span" className="detail-label">
								Map ID:
							</Typography>
							<Typography
								component="span"
								color="black"
								className="detail-value"
							>
								{country?.mapId}
							</Typography>
						</div>
						<div className="detail-container">
							<Typography component="span" className="detail-label">
								Map Seed:
							</Typography>
							<Typography
								component="span"
								color="black"
								className="detail-value"
							>
								{/* {country?.mapSeed} */}
							</Typography>
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
				);
			}
		}

		return <div {...p} />;
	};

	const ListItem = (p: any) => {
		const label = typeof p.label === "string" ? p.label.trim() : "";
		const itemType = p.itemtype ?? p.itemType; // support either casing
		if (!label) return null;

		if (itemType === "Detail") {
			if (label === "Government Type:" || label === "Government Type") {
				return (
					<div className="detail-container">
						<Typography component="span" className="detail-label">
							{label} <GiSparkles style={DynamicSparkleSmall} />
						</Typography>
						<span className="detail-value">
							{`${country?.political.form} (${country?.political.formName})`}
						</span>
					</div>
				);
			}
			if (label === "Capital:" || label === "Capital") {
				return (
					<div className="detail-container">
						<Typography component="span" className="detail-label">
							{label} <GiSparkles style={DynamicSparkleSmall} />
						</Typography>
						<span className="detail-value">
							{citiesList.find((city) => city.capital)?.name}
						</span>
					</div>
				);
			}
			return (
				<div className="detail-container">
					<Typography component="span" className="detail-label">
						{label}
					</Typography>
					<span className="detail-value">{p.value}</span>
				</div>
			);
		}
		// Non-Detail list items: require a value
		if (p.value == null || p.value === "") return null;
		return (
			<div className="detail-container">
				<Typography component="span" className="detail-label">
					{label}
				</Typography>
				<span className="detail-value">{p.value}</span>
			</div>
		);
	};

	const SubList = (p: any) => {
		if (p.listname === "economy-ex-imports") {
			return (
				<div {...p}>
					<div className="sub-list">
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
							<Typography component="p" className="detail-value" color="black">
								No exports listed
							</Typography>
						)}
					</div>

					<div className="sub-list">
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
							<Typography component="p" className="detail-value" color="black">
								No imports listed
							</Typography>
						)}
					</div>
				</div>
			);
		}
	};

	const Component =
		type === "View"
			? View
			: type === "Section"
				? Section
				: type === "Typography"
					? Script
					: type === "Text"
						? Text
						: type === "Icon"
							? Icon
							: type === "DataList"
								? DataList
								: type === "Linkage"
									? Linkage
									: type === "List"
										? List
										: type === "ListItem"
											? ListItem
											: type === "SubList"
												? SubList
												: null;

	if (!Component) {
		return (
			<div key={buildKey(element)}>
				Invalid component type: {type}
				<JsonView value={element} />
			</div>
		);
	}

	const key = buildKey(element, path);

	return (
		<Component key={key} {...props}>
			{Array.isArray(children)
				? children.map((child: any, idx: number) =>
						JsonUI(child, `${path}.${type}[${idx}]`),
					)
				: props.text}
		</Component>
	);
}

export default JsonUI;
