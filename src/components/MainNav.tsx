import { useMemo, useState } from "react";
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
} from "@mui/material/";
import { IconContext } from "react-icons";
import { ImDiamonds } from "react-icons/im";
import {
	TiCog,
	TiDocumentText,
	TiGlobe,
	TiHome,
	TiExportOutline,
} from "react-icons/ti";

import { handleSvgReplace } from "./Util/handleSvgReplace";

import type { MapInf } from "../definitions/TerraLogger";

const MainNav = (mapsList: { mapsList: MapInf[] }): JSX.Element => {
	const { activeMapId, setActive } = useDB();
	const iconStyles = useMemo(() => ({ size: "1.75rem" }), []);
	const [expanded, setExpanded] = useState(false); // State to manage accordion expansion

	const mapList = mapsList.mapsList;

	const activeMap = useMemo(
		() => mapList.find((m) => m.mapId === activeMapId),
		[mapList, activeMapId],
	);
	const mapName = activeMap?.info.name ?? "";
	const mapLoaded = !!activeMap;

	const handleAccordionChange = (isExpanded: boolean) => {
		setExpanded(isExpanded);
	};

	const handleMenuItemClick = (m: MapInf) => {
		// canonical: store-wide mapId
		if (!m.mapId) {
			console.warn("Selected map has no mapId; cannot set active.", m);
			return;
		}
		setActive(m.mapId);
		handleSvgReplace({
			svg: m.SVG,
			height: m.info.height,
			width: m.info.width,
		});
		setExpanded(false);
	};

	return (
		<MenuList>
			<IconContext.Provider value={iconStyles}>
				<MenuItem className="mapSelect">
					{mapList.length > 0 ? (
						<Accordion
							disableGutters
							expanded={expanded}
							onChange={(event, isExpanded) => {
								handleAccordionChange(isExpanded);
								console.info(event);
							}}
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="mapSelect-content"
								id="mapSelect-header"
							>
								<ListItemIcon>
									<TiGlobe />
								</ListItemIcon>
								<ListItemText>
									{mapLoaded ? mapName : "Select Map"}
								</ListItemText>
							</AccordionSummary>
							<AccordionDetails>
								<MenuList>
									{mapList.map((m: MapInf) => (
										<MenuItem
											key={m.info.ID}
											onClick={() => handleMenuItemClick(m)}
										>
											{m.info.name}
										</MenuItem>
									))}
								</MenuList>
							</AccordionDetails>
						</Accordion>
					) : (
						<>
							<ListItemIcon>
								<TiGlobe />
							</ListItemIcon>
							<ListItemText>
								{mapLoaded ? mapName : "No Map Loaded"}
							</ListItemText>
						</>
					)}
				</MenuItem>
				<Divider />
				<NavLink
					to="/"
					className={({ isActive }) => (isActive ? "active" : "")}
				>
					<MenuItem>
						<ListItemIcon>
							<TiHome />
						</ListItemIcon>
						<ListItemText>Home</ListItemText>
						<ListItemIcon className="inactive">
							<ImDiamonds />
						</ListItemIcon>
					</MenuItem>
				</NavLink>
				{mapLoaded ? (
					<div className="subMenu">
						<NavLink
							to="/countries"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiDocumentText />
								</ListItemIcon>
								<ListItemText>Countries</ListItemText>
								<ListItemIcon className="inactive">
									<ImDiamonds />
								</ListItemIcon>
							</MenuItem>
						</NavLink>
						<NavLink
							to="/cities"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiDocumentText />
								</ListItemIcon>
								<ListItemText>Cities</ListItemText>
								<ListItemIcon className="inactive">
									<ImDiamonds />
								</ListItemIcon>
							</MenuItem>
						</NavLink>
						<NavLink
							to="/religions"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiDocumentText />
								</ListItemIcon>
								<ListItemText>Religions</ListItemText>
								<ListItemIcon className="inactive">
									<ImDiamonds />
								</ListItemIcon>
							</MenuItem>
						</NavLink>
						<NavLink
							to="/cultures"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiDocumentText />
								</ListItemIcon>
								<ListItemText>Cultures</ListItemText>
								<ListItemIcon className="inactive">
									<ImDiamonds />
								</ListItemIcon>
							</MenuItem>
						</NavLink>
						<NavLink
							to="/notes"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiDocumentText />
								</ListItemIcon>
								<ListItemText>Notes</ListItemText>
								<ListItemIcon className="inactive">
									<ImDiamonds />
								</ListItemIcon>
							</MenuItem>
						</NavLink>
						{/* <NavLink
							to="/tags"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiTags />
								</ListItemIcon>
								<ListItemText>Tags</ListItemText>
								<ListItemIcon className="inactive">
									<ImDiamonds />
								</ListItemIcon>
							</MenuItem>
						</NavLink> */}
					</div>
				) : (
					""
				)}

				<NavLink
					to="/settings"
					className={({ isActive }) => (isActive ? "active" : "")}
				>
					<MenuItem>
						<ListItemIcon>
							<TiCog />
						</ListItemIcon>
						<ListItemText>Settings</ListItemText>
						<ListItemIcon className="inactive">
							<ImDiamonds />
						</ListItemIcon>
					</MenuItem>
				</NavLink>
				{mapLoaded ? (
					<NavLink
						to="/export"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						<MenuItem>
							<ListItemIcon>
								<TiExportOutline />
							</ListItemIcon>
							<ListItemText>Export Map</ListItemText>
							<ListItemIcon className="inactive">
								<ImDiamonds />
							</ListItemIcon>
						</MenuItem>
					</NavLink>
				) : (
					""
				)}
			</IconContext.Provider>
		</MenuList>
	);
};
export default MainNav;
