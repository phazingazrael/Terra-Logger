import { useMemo, useState, type JSX } from "react";
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

const MainNav = (mapsList: { mapsList: MapInf[] }): JSX.Element => {
	const { activeMapId, setActive } = useDB();
	const [expanded, setExpanded] = useState(false); // State to manage accordion expansion

	const theme = useTheme();

	const mapList = mapsList.mapsList;

	const activeMap = useMemo(
		() => mapList.find((m) => m.mapId === activeMapId),
		[mapList, activeMapId],
	);
	const mapName = activeMap?.info.name ?? "";
	const mapLoaded = !!activeMap;

	const handleNavClick = () => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	};

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
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<ListItemIcon>
								<GlobeStandIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
							<ListItemText>{mapLoaded ? mapName : "Select Map"}</ListItemText>
						</AccordionSummary>
						<AccordionDetails>
							<MenuList>
								{mapList.map((m: MapInf) => (
									<MenuItem
										key={m.info.ID}
										onClick={() => handleMenuItemClick(m)}
									>
										<ListItemIcon>
											<GlobeHemisphereWestIcon
												size={24}
												color={theme.palette.primary.main}
												weight="duotone"
											/>
										</ListItemIcon>
										<ListItemText>{m.info.name}</ListItemText>
									</MenuItem>
								))}
							</MenuList>
						</AccordionDetails>
					</Accordion>
				) : (
					<>
						<ListItemIcon>
							<GlobeStandIcon
								size={28}
								color={theme.palette.primary.main}
								weight="duotone"
							/>
						</ListItemIcon>
						<ListItemText>{mapLoaded ? mapName : "No Map Loaded"}</ListItemText>
					</>
				)}
			</MenuItem>
			<Divider />
			<NavLink
				onClick={handleNavClick}
				to="/"
				className={({ isActive }) => (isActive ? "active" : "")}
			>
				<MenuItem>
					<ListItemIcon>
						<HouseLineIcon
							color={theme.palette.primary.main}
							size={28}
							weight="duotone"
						/>
					</ListItemIcon>
					<ListItemText>Home</ListItemText>
					<ListItemIcon className="inactive">
						<DiamondsFourIcon
							size={28}
							color={theme.palette.primary.main}
							weight="duotone"
						/>
					</ListItemIcon>
				</MenuItem>
			</NavLink>
			{mapLoaded ? (
				<div className="subMenu">
					<NavLink
						onClick={handleNavClick}
						to="/countries"
						className={({ isActive }) => {
							const path = location.pathname;
							return isActive || path.startsWith("/view_country")
								? "active"
								: "";
						}}
					>
						<MenuItem>
							<ListItemIcon>
								<NotebookIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
							<ListItemText>Countries</ListItemText>
							<ListItemIcon className="inactive">
								<DiamondsFourIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
						</MenuItem>
					</NavLink>
					<NavLink
						onClick={handleNavClick}
						to="/cities"
						className={({ isActive }) => {
							const path = location.pathname;
							return isActive || path.startsWith("/view_city") ? "active" : "";
						}}
					>
						<MenuItem>
							<ListItemIcon>
								<NotebookIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
							<ListItemText>Cities</ListItemText>
							<ListItemIcon className="inactive">
								<DiamondsFourIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
						</MenuItem>
					</NavLink>
					<NavLink
						onClick={handleNavClick}
						to="/religions"
						className={({ isActive }) => {
							const path = location.pathname;
							return isActive || path.startsWith("/view_religion")
								? "active"
								: "";
						}}
					>
						<MenuItem>
							<ListItemIcon>
								<NotebookIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
							<ListItemText>Religions</ListItemText>
							<ListItemIcon className="inactive">
								<DiamondsFourIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
						</MenuItem>
					</NavLink>
					<NavLink
						onClick={handleNavClick}
						to="/cultures"
						className={({ isActive }) => {
							const path = location.pathname;
							return isActive || path.startsWith("/view_culture")
								? "active"
								: "";
						}}
					>
						<MenuItem>
							<ListItemIcon>
								<NotebookIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
							<ListItemText>Cultures</ListItemText>
							<ListItemIcon className="inactive">
								<DiamondsFourIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
						</MenuItem>
					</NavLink>
					<NavLink
						onClick={handleNavClick}
						to="/notes"
						className={({ isActive }) => {
							const path = location.pathname;
							return isActive || path.startsWith("/view_note") ? "active" : "";
						}}
					>
						<MenuItem>
							<ListItemIcon>
								<NotebookIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
							<ListItemText>Notes</ListItemText>
							<ListItemIcon className="inactive">
								<DiamondsFourIcon
									size={28}
									color={theme.palette.primary.main}
									weight="duotone"
								/>
							</ListItemIcon>
						</MenuItem>
					</NavLink>
					{/* <NavLink onClick={handleNavClick}
							to="/tags"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiTags />
								</ListItemIcon>
								<ListItemText>Tags</ListItemText>
								<ListItemIcon className="inactive">
									<DiamondsFourIcon size={28} color={theme.palette.primary.main} weight="duotone" />
								</ListItemIcon>
							</MenuItem>
						</NavLink> */}
				</div>
			) : (
				""
			)}

			<NavLink
				onClick={handleNavClick}
				to="/settings"
				className={({ isActive }) => (isActive ? "active" : "")}
			>
				<MenuItem>
					<ListItemIcon>
						<FadersIcon
							size={28}
							color={theme.palette.primary.main}
							weight="duotone"
						/>
					</ListItemIcon>
					<ListItemText>Settings</ListItemText>
					<ListItemIcon className="inactive">
						<DiamondsFourIcon
							size={28}
							color={theme.palette.primary.main}
							weight="duotone"
						/>
					</ListItemIcon>
				</MenuItem>
			</NavLink>
			{mapLoaded ? (
				<NavLink
					onClick={handleNavClick}
					to="/export"
					className={({ isActive }) => (isActive ? "active" : "")}
				>
					<MenuItem>
						<ListItemIcon>
							<ExportIcon
								size={28}
								color={theme.palette.primary.main}
								weight="duotone"
							/>
						</ListItemIcon>
						<ListItemText>Export Map</ListItemText>
						<ListItemIcon className="inactive">
							<DiamondsFourIcon
								size={28}
								color={theme.palette.primary.main}
								weight="duotone"
							/>
						</ListItemIcon>
					</MenuItem>
				</NavLink>
			) : (
				""
			)}
			<NavLink
				onClick={handleNavClick}
				to="/about"
				className={({ isActive }) => (isActive ? "active" : "")}
			>
				<MenuItem>
					<ListItemIcon>
						<SealQuestionIcon
							size={28}
							color={theme.palette.primary.main}
							weight="duotone"
						/>
					</ListItemIcon>
					<ListItemText>About</ListItemText>
					<ListItemIcon className="inactive">
						<DiamondsFourIcon
							size={28}
							color={theme.palette.primary.main}
							weight="duotone"
						/>
					</ListItemIcon>
				</MenuItem>
			</NavLink>
		</MenuList>
	);
};
export default MainNav;
