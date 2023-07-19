import React, { useState, useEffect } from 'react';


import { MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { createBrowserRouter, Link } from 'react-router-dom';

import { House } from '@phosphor-icons/react';

const SideBar = () => {
    return (
        <MenuList>
            <Link to={"/main_window"}>
                <MenuItem>
                    <ListItemIcon color="text.secondary">
                        <House size={32} />
                    </ListItemIcon>
                    <ListItemText>
                        Home
                    </ListItemText>
                </MenuItem>
            </Link>
            <Link to={"/main_window/country"}>
                <MenuItem>
                    <ListItemIcon>

                    </ListItemIcon>
                    <ListItemText>Country</ListItemText>
                </MenuItem>
            </Link>
            <MenuItem>
                <ListItemIcon>

                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
            </MenuItem>
        </MenuList>
    );
}

export default SideBar;