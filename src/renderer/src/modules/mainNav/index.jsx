import * as React from 'react';
import { useEffect, useState } from 'react';
import { MenuList, MenuItem, ListItemText, ListItemIcon, Divider, Popover, Typography } from "@mui/material/";
import { NavLink } from 'react-router-dom';
import { IconContext } from "react-icons";
import { TiBook, TiClipboard, TiCog, TiDocumentText, TiGlobe, TiHome, TiTags } from "react-icons/ti";
import { ImDiamonds } from "react-icons/im"


import {
    AutoStoriesOutlined,
    HomeOutlined,
    LanguageOutlined,
    DescriptionOutlined,
    SellOutlined,
    TuneOutlined
} from '@mui/icons-material';

import './style.css';




const MainNav = ({ data, setMap }) => {
    const [anchorEl, setAnchorEl] = useState(null);


    const openMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClear = () => {
        console.log("Clearing Storage");
        localStorage.removeItem("SVG");
        localStorage.removeItem("cities");
        localStorage.removeItem("countries");
        localStorage.removeItem("cultures");
        localStorage.removeItem("info");
        localStorage.removeItem("nameBases");
        localStorage.removeItem("notes");
        localStorage.removeItem("religions");
        localStorage.removeItem("settings");
        localStorage.removeItem("svgMod");
        setMap();
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {

    }, []);

    return (
        <MenuList>
            <IconContext.Provider value={{ size: "1.75rem" }}>
                <MenuItem onClick={openMenu}>
                    <ListItemIcon>
                        <TiGlobe />
                    </ListItemIcon>
                    <ListItemText>
                        {data ?
                            (
                                <span className="mapName">
                                    {data.info.mapName}
                                </span>
                            ) : "No Map Loaded"}
                    </ListItemText>
                </MenuItem>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <div className="mapDetails"></div>
                    <MenuList>
                        <MenuItem>
                            <ListItemIcon>

                            </ListItemIcon>
                            <ListItemText>Cut</ListItemText>
                            <Typography variant="body2" color="text.secondary">
                                ⌘X
                            </Typography>
                        </MenuItem>
                        <MenuItem>
                            <ListItemIcon>

                            </ListItemIcon>
                            <ListItemText>Copy</ListItemText>
                            <Typography variant="body2" color="text.secondary">
                                ⌘C
                            </Typography>
                        </MenuItem>
                        <MenuItem>
                            <ListItemIcon>

                            </ListItemIcon>
                            <ListItemText>Paste</ListItemText>
                            <Typography variant="body2" color="text.secondary">
                                ⌘V
                            </Typography>
                        </MenuItem>
                        <Divider />

                        <a href="/" onClick={() => {
                            handleClose();
                            handleClear();
                        }} color="warning.main">

                            <MenuItem >
                                <ListItemIcon>

                                </ListItemIcon>
                                <ListItemText>Delete Map Data</ListItemText>
                            </MenuItem>
                        </a>

                    </MenuList>
                </Popover>
                <Divider />
                <NavLink to={"/"} className={({ isActive }) =>
                    isActive ? "active" : ""
                }>
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
                <NavLink to={"/overview"} className={({ isActive }) =>
                    isActive ? "active" : ""
                }>
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
                <MenuItem>
                    <ListItemIcon>
                        <TiClipboard />
                    </ListItemIcon>
                    <ListItemText>Entries</ListItemText>
                    <ListItemIcon className="inactive">
                        <ImDiamonds />
                    </ListItemIcon>
                </MenuItem>
                <div className="subMenu">
                    <NavLink to={"/countries"} className={({ isActive }) =>
                        isActive ? "active" : ""
                    }>
                        <MenuItem >
                            <ListItemIcon>
                                <TiDocumentText />
                            </ListItemIcon>
                            <ListItemText>Countries</ListItemText>
                            <ListItemIcon className="inactive">
                                <ImDiamonds />
                            </ListItemIcon>
                        </MenuItem>
                    </NavLink>
                    <NavLink to={"/cities"} className={({ isActive }) =>
                        isActive ? "active" : ""
                    }>
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
                    <NavLink to={"/religions"} className={({ isActive }) =>
                        isActive ? "active" : ""
                    }>
                        <MenuItem >
                            <ListItemIcon>
                                <TiDocumentText />
                            </ListItemIcon>
                            <ListItemText>Religions</ListItemText>
                            <ListItemIcon className="inactive">
                                <ImDiamonds />
                            </ListItemIcon>
                        </MenuItem>
                    </NavLink>
                    <NavLink to={"/tags"} className={({ isActive }) =>
                        isActive ? "active" : ""
                    }>
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
                <NavLink to={"/settings"} className={({ isActive }) =>
                    isActive ? "active" : ""
                }>
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
}

export default MainNav;
