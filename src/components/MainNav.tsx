import { useState, type JSX } from "react";
import { useDB } from "../db/DataContext";
import { NavLink } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Divider,
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuList,
	useTheme,
} from "@mui/material";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import { GlobeStandIcon } from "@phosphor-icons/react/dist/ssr/GlobeStand";
import { FadersIcon } from "@phosphor-icons/react/dist/ssr/Faders";
import { ExportIcon } from "@phosphor-icons/react/dist/ssr/Export";
import { SealQuestionIcon } from "@phosphor-icons/react/dist/ssr/SealQuestion";
import { NotebookIcon } from "@phosphor-icons/react/dist/ssr/Notebook";
import { DiamondsFourIcon } from "@phosphor-icons/react/dist/ssr/DiamondsFour";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/ssr/GlobeHemisphereWest";
import { handleSvgReplace } from "./Util/handleSvgReplace";
import type { MapInf } from "../definitions/TerraLogger";

function handleNavClick() {
	const content = document.querySelector(".Content");
	if (content instanceof HTMLElement) {
		content.scrollTo({ top: 0, behavior: "auto" });
	}
}

type NavIcon = typeof HouseLineIcon;

type NavigationItem = {
	label: string;
	to: string;
	icon: NavIcon;
	activePrefixes?: string[];
};

const ENTITY_ITEMS: NavigationItem[] = [
	{ label: "Countries", to: "/countries", icon: NotebookIcon, activePrefixes: ["/view_country"] },
	{ label: "Cities", to: "/cities", icon: NotebookIcon, activePrefixes: ["/view_city"] },
	{ label: "Religions", to: "/religions", icon: NotebookIcon, activePrefixes: ["/view_religion"] },
	{ label: "Cultures", to: "/cultures", icon: NotebookIcon, activePrefixes: ["/view_culture"] },
	{ label: "NPCs", to: "/npcs", icon: NotebookIcon, activePrefixes: ["/view_npc"] },
	{ label: "Notes", to: "/notes", icon: NotebookIcon, activePrefixes: ["/view_note"] },
];

function NavigationLink({ item }: { item: NavigationItem }) {
	const theme = useTheme();
	const Icon = item.icon;

	return (
		<NavLink
			onClick={handleNavClick}
			to={item.to}
			className={({ isActive }) => {
				const prefixMatch = item.activePrefixes?.some((prefix) =>
					location.pathname.startsWith(prefix),
				);
				return isActive || prefixMatch ? "active" : "";
			}}
		>
			<MenuItem>
				<ListItemIcon>
					<Icon color={theme.palette.primary.main} size={28} weight="duotone" />
				</ListItemIcon>
				<ListItemText>{item.label}</ListItemText>
				<ListItemIcon className="inactive">
					<DiamondsFourIcon
						size={28}
						color={theme.palette.primary.main}
						weight="duotone"
					/>
				</ListItemIcon>
			</MenuItem>
		</NavLink>
	);
}

function MapSelector({
	maps,
	activeMapId,
	onSelect,
}: {
	maps: MapInf[];
	activeMapId: string | null;
	onSelect: (map: MapInf) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const theme = useTheme();
	const activeMap = maps.find((map) => map.mapId === activeMapId);
	const mapLabel = activeMap?.info.name ?? (maps.length ? "Select Map" : "No Map Loaded");

	function selectMap(map: MapInf) {
		onSelect(map);
		setExpanded(false);
	}

	return (
		<MenuItem className="mapSelect">
			{maps.length ? (
				<Accordion
					disableGutters
					expanded={expanded}
					onChange={(_event, isExpanded) => setExpanded(isExpanded)}
				>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<ListItemIcon>
							<GlobeStandIcon size={28} color={theme.palette.primary.main} weight="duotone" />
						</ListItemIcon>
						<ListItemText>{mapLabel}</ListItemText>
					</AccordionSummary>
					<AccordionDetails>
						<MenuList>
							{maps.map((map) => (
								<MenuItem key={map.info.ID} onClick={() => selectMap(map)}>
									<ListItemIcon>
										<GlobeHemisphereWestIcon
											size={24}
											color={theme.palette.primary.main}
											weight="duotone"
										/>
									</ListItemIcon>
									<ListItemText>{map.info.name}</ListItemText>
								</MenuItem>
							))}
						</MenuList>
					</AccordionDetails>
				</Accordion>
			) : (
				<>
					<ListItemIcon>
						<GlobeStandIcon size={28} color={theme.palette.primary.main} weight="duotone" />
					</ListItemIcon>
					<ListItemText>{mapLabel}</ListItemText>
				</>
			)}
		</MenuItem>
	);
}

function MainNav({ mapsList }: { mapsList: MapInf[] }): JSX.Element {
	const { activeMapId, setActive } = useDB();
	const mapLoaded = mapsList.some((map) => map.mapId === activeMapId);

	function selectMap(map: MapInf) {
		if (!map.mapId) {
			console.warn("Selected map has no mapId; cannot set active.", map);
			return;
		}
		void setActive(map.mapId);
		handleSvgReplace({ svg: map.SVG, height: map.info.height, width: map.info.width });
	}

	return (
		<MenuList>
			<MapSelector maps={mapsList} activeMapId={activeMapId} onSelect={selectMap} />
			<Divider />
			<NavigationLink item={{ label: "Home", to: "/", icon: HouseLineIcon }} />
			{mapLoaded ? (
				<div className="subMenu">
					{ENTITY_ITEMS.map((item) => <NavigationLink key={item.to} item={item} />)}
				</div>
			) : null}
			<NavigationLink item={{ label: "Settings", to: "/settings", icon: FadersIcon }} />
			{mapLoaded ? (
				<NavigationLink item={{ label: "Export Map", to: "/export", icon: ExportIcon }} />
			) : null}
			<NavigationLink item={{ label: "About", to: "/about", icon: SealQuestionIcon }} />
		</MenuList>
	);
}

export default MainNav;
