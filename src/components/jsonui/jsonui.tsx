/** biome-ignore-all lint/correctness/useHookAtTopLevel: ignore */
import { Paper, Typography } from "@mui/material";
import { GiSparkles } from "react-icons/gi";

import { Link, useLocation } from "react-router-dom";
import { useDB } from "../../db/DataContext";
import { useParams } from "react-router-dom";

import JsonView from "@uiw/react-json-view";

import type {
	TLCity,
	// TLCountry
} from "../../definitions/TerraLogger";

// Styles
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

const DynamicSparkleStyle = {
	height: "1.5rem",
	width: "1.5rem",
	marginTop: "-1.5rem",
	color: "#1794a1",
};

const SemiDynamicSparkleStyle = {
	height: "1.5rem",
	width: "1.5rem",
	marginTop: "-1.5rem",
	color: "#17a127",
};

function buildKey(element: any) {
	const type = element?.type ?? "unknown";
	const p = element?.props ?? {};

	const parts = [
		type,
		p.title && `title:${p.title}`,
		p.listName && `list:${p.listName}`,
		p.className && `class:${p.className}`,
	].filter(Boolean);

	return (p.key ?? parts.join("|")) as string;
}

function JsonUI(element: { type: string; props?: any; children?: any }) {
	// type: Defines the component type (View, Text, Button, etc.).
	// ‍props: Contains properties like styles, text values, and event handlers.
	// ‍children: Represents nested elements inside a component.

	const { pathname } = useLocation();
	const segments = pathname.split("/").filter(Boolean);

	const { type, props = {}, children } = element;

	const ID = useParams();
	const { useActive } = useDB();
	const cities = useActive<TLCity>("cities");
	// const countries = useActive<TLCountry>("countries");
	const city = cities.find((c) => c._id === ID?._id);
	// const country = countries.find((c) => c._id === ID?._id);

	if (!element || !element.type) return "Invalid element";

	// "Components"
	const View = (p: any) => <div {...p} />;

	const Section = (p: any) => <Paper {...p} />;

	const Text = ({ text }: { text: string }) => <span>{text}</span>;

	const Script = (p: any) => <Typography {...p} />;

	const Icon = ({ name, style }: { name: string; style?: string }) => {
		if (name === "GiSparkles") {
			if (style === "DynamicSparkleStyle")
				return <GiSparkles style={DynamicSparkleStyle} />;
			if (style === "SemiDynamicSparkleStyle")
				return <GiSparkles style={SemiDynamicSparkleStyle} />;
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
								<span key={feature} className="tag" style={tagStyles}>
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
									style={tagStyles}
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
		} else {
			return <div {...p} />;
		}
	};

	const ListItem = (p: any) => {
		if (!p.label || !p.value) return null;

		if (p.itemtype === "Detail") {
			return (
				<div className="detail-container">
					<Typography component="span" className="detail-label">
						{p.label}
					</Typography>
					<span className="detail-value">{p.value}</span>
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
											: null;

	if (!Component) {
		return (
			<div key={buildKey(element)}>
				Invalid component type: {type}
				<JsonView value={element} />
			</div>
		);
	}

	const key = buildKey(element);

	return (
		<Component key={key} {...props}>
			{Array.isArray(children)
				? children.map((child: any) => JsonUI(child))
				: props.text}
		</Component>
	);
}

export default JsonUI;
