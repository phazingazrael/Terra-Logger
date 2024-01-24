import * as React from 'react';
import { useEffect } from 'react';
import { MenuList, MenuItem, ListItemText, ListItemIcon, Divider, Popover, Typography } from "@mui/material/";
import { Link } from 'react-router-dom';

import {
    AutoStoriesOutlined,
    HomeOutlined,
    LanguageOutlined,
    DescriptionOutlined,
    ClassOutlined,
    SellOutlined,
    TuneOutlined
} from '@mui/icons-material';

import './style.css';




const MainNav = ({ data, setMap }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

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
            <MenuItem onClick={openMenu}>
                <ListItemIcon>
                    <LanguageOutlined />
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
            <Link to={"/"}>
                <MenuItem>
                    <ListItemIcon>
                        <HomeOutlined />
                    </ListItemIcon>
                    <ListItemText>Home</ListItemText>
                </MenuItem>
            </Link>
            <Link to={"/overview"}>
                <MenuItem>
                    <ListItemIcon>
                        <AutoStoriesOutlined />
                    </ListItemIcon>
                    <ListItemText>Overview</ListItemText>
                </MenuItem>
            </Link>
            <MenuItem>
                <ListItemIcon>
                    <DescriptionOutlined />
                </ListItemIcon>
                <ListItemText>Entries</ListItemText>
            </MenuItem>
            <div className="subMenu">
                <Link to={"/countries"}>
                    <MenuItem >
                        <ListItemIcon>
                            <ClassOutlined />
                        </ListItemIcon>
                        <ListItemText>Countries</ListItemText>
                    </MenuItem>
                </Link>
                <Link to={"/cities"}>
                    <MenuItem >
                        <ListItemIcon>
                            <ClassOutlined />
                        </ListItemIcon>
                        <ListItemText>Cities</ListItemText>
                    </MenuItem>
                </Link>
                <Link to={"/religions"}>
                    <MenuItem >
                        <ListItemIcon>
                            <ClassOutlined />
                        </ListItemIcon>
                        <ListItemText>Religions</ListItemText>
                    </MenuItem>
                </Link>
                <Link to={"/tags"}>
                    <MenuItem>
                        <ListItemIcon>
                            <SellOutlined />
                        </ListItemIcon>
                        <ListItemText>Tags</ListItemText>
                    </MenuItem>
                </Link>
            </div>
            <Link to={"/settings"}>
                <MenuItem>
                    <ListItemIcon>
                        <TuneOutlined />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>
            </Link>
        </MenuList>
    );
}

export default MainNav;
