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
import { useEffect, useMemo, useState } from "react";
import { IconContext } from "react-icons";
import { ImDiamonds } from "react-icons/im";
import {
	TiBook,
	TiCog,
	TiDocumentText,
	TiGlobe,
	TiHome,
	TiTags,
} from "react-icons/ti";
import { NavLink } from "react-router-dom";
import { useRecoilState } from "recoil";
import mapAtom from "../atoms/map";
import mapLoadedAtom from "../atoms/mapLoaded";
import mapNameAtom from "../atoms/mapName";
import { handleSvgReplace } from "./Util/handleSvgReplace";

const MainNav = (mapsList: { mapsList: MapInf[] }): JSX.Element => {
	const iconStyles = useMemo(() => ({ size: "1.75rem" }), []);
	const [map, setMap] = useRecoilState(mapAtom);
	const [mapLoaded, setMapLoaded] = useRecoilState(mapLoadedAtom);
	const [mapName, setMapName] = useRecoilState(mapNameAtom);
	const [expanded, setExpanded] = useState(false); // State to manage accordion expansion

	const mapList = mapsList.mapsList;
	useEffect(() => {
		if (map.info.name !== "") {
			setMapName(map.info.name);
			setMapLoaded(true);
		}
	}, [map, setMapName, setMapLoaded]);

	const handleAccordionChange = (isExpanded: boolean) => {
		setExpanded(isExpanded);
	};

	const handleMenuItemClick = (map: MapInf) => {
		setMapName(map.info.name);
		setMap(map);
		handleSvgReplace({
			svg: map.SVG,
			height: map.info.height,
			width: map.info.width,
		});
		setMapLoaded(true);
		setExpanded(false); // Close the accordion
	};

	return (
		<MenuList>
			<IconContext.Provider value={iconStyles}>
				<MenuItem>
					{mapList.length > 0 ? (
						<Accordion
							disableGutters
							expanded={expanded}
							onChange={(event, isExpanded) => {
								handleAccordionChange(isExpanded);
								console.log(event);
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
									{mapLoaded ? mapName : "No Map Loaded"}
								</ListItemText>
							</AccordionSummary>
							<AccordionDetails>
								<MenuList>
									{mapList.map((map: MapInf) => {
										return (
											<MenuItem
												key={map.info.ID}
												onClick={() => handleMenuItemClick(map)}
											>
												{map.info.name}
											</MenuItem>
										);
									})}
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
					<>
						<NavLink
							to="/overview"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							<MenuItem>
								<ListItemIcon>
									<TiBook />
								</ListItemIcon>
								<ListItemText>Overview</ListItemText>
								<ListItemIcon className="inactive">
									<ImDiamonds />
								</ListItemIcon>
							</MenuItem>
						</NavLink>
						{/* <NavLink to="/entries" className={({ isActive }) => (isActive ? 'active' : '')}>
              <MenuItem>
                <ListItemIcon>
                  <TiClipboard />
                </ListItemIcon>
                <ListItemText>Entries</ListItemText>
                <ListItemIcon className="inactive">
                  <ImDiamonds />
                </ListItemIcon>
              </MenuItem>
            </NavLink> */}
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
							</NavLink>
						</div>
					</>
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
			</IconContext.Provider>
		</MenuList>
	);
};
export default MainNav;
