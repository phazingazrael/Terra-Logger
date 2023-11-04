import * as React from 'react';
import Package from "../package.json";
import './App.css';
import { useState, useEffect, useLayoutEffect } from 'react';

import {
    createBrowserRouter,
    RouterProvider,
    Link,
    Outlet,
    useLoaderData,
    useLocation
} from "react-router-dom";

import { Paper, Grid, AppBar, Container, Chip, Popover, MenuList, MenuItem, ListItemText, ListItemIcon, Typography, Divider } from "@mui/material/";
import { House } from "@phosphor-icons/react";

import { styled } from '@mui/material/styles';

import Root, { loader as rootLoader } from './routes/root.jsx';
import ErrorPage from './routes/error.jsx';
import CountryView, { loader as countryLoader } from './routes/countryView.jsx';
import CountryEdit, { loader as countryEditLoader } from './routes/countryEdit.jsx';


import SideBar from './component/sideBar/index.jsx';
import UploadForm from './component/uploadForm/index.jsx';
import CountryCard from "./component/infocard/countryInfoCard.jsx";

let mapParsed = JSON.parse(localStorage.getItem("mapParsed"));
let Countries = JSON.parse(localStorage.getItem("countries"));
let Cities = JSON.parse(localStorage.getItem("cities"));

const router = createBrowserRouter([
    { basename: "/main_window" },
    {
        path: "/main_window",
        element: <App />,
        loader: rootLoader,
        children: [
            {
                path: "",
                element: <Root mapData={mapParsed} />,
                errorElement: <ErrorPage />,
            },
            {
                path: "country",
                element: <Country />,
                errorElement: <ErrorPage />,
            },
            {
                loader: countryLoader,
                path: "countries/:_id/view",
                element: <CountryView />,
                errorElement: <ErrorPage />,
            },
            {
                loader: countryEditLoader,
                path: "countries/:_id/edit",
                element: <CountryEdit />,
                errorElement: <ErrorPage />,
            }
        ]
    }
]);



const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'rgba(193, 197, 195, 0.6)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    overflow: "auto"
}));

function Country() {
    return (
        mapParsed ? (<CountryCard Countries={Countries} />) : ""
    );
}

const Wrapper = ({ children }) => {
    const location = useLocation();
    useLayoutEffect(() => {
        document.getElementById("Content").scrollTo(0, 0);
    }, [location.pathname]);
    return children
}


function App({ Countries }) {
    const [isLoading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);

    Countries = useLoaderData();

    const openMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    const [mapData, setMap] = useState(
        mapParsed
    )


    //console.log(mapData);

    useEffect(() => {
        setLoading(false);
    }, [mapData, isLoading, setLoading, setMap]);



    return (
        <div className="App">
            <AppBar position="static" className="Header">
                <div className="HeaderText">
                    <h1>
                        Terra-Logger. Azgaar's Fantasy Map Generator to structured Markdown.
                    </h1>

                    {mapData ?
                        (
                            <Chip variant="outlined" onClick={openMenu} label={"Current Map Loaded: " + mapData.mapInfo.info.mapName} className="MapName" size="lg" />
                        ) : ""}
                </div>
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
                        <Link to={"/main_window"} onClick={() => {
                            console.log("Clearing Storage");
                            localStorage.removeItem("mapParsed");
                            localStorage.removeItem("cities");
                            localStorage.removeItem("countries");
                            localStorage.removeItem("rawMap");
                            setMap();
                            handleClose();
                        }} color="warning.main">
                            <MenuItem >
                                <ListItemIcon>

                                </ListItemIcon>
                                <ListItemText>Delete Map Data</ListItemText>
                            </MenuItem>
                        </Link>
                    </MenuList>
                </Popover>
            </AppBar>
            <Container maxWidth="xl">
                <Grid container spacing={2}>
                    <Grid item lg={3} md={2} xs={2}>
                        <Item className="Navigation">
                            {
                                mapData
                                    ? (
                                        <div>
                                            <div>
                                                <SideBar router={router} />
                                            </div>
                                            <ul>
                                                {Object.entries(mapData.mapInfo.info).map(([key, value]) => <li key={key}>{key.replace(/([A-Z])/g, ' $1')
                                                    // uppercase the first character
                                                    .replace(/^./, (str) => str.toUpperCase())}: {value}</li>)}
                                            </ul>
                                        </div>
                                    )
                                    : <UploadForm mapData={mapData} setMap={setMap} isLoading={isLoading} setLoading={setLoading} Package={Package} />
                            }
                            {/*
                            mapData
                                ? <SiteNav mapData={mapData} setMap={setMap} />
                                : <UploadForm />
                            */}
                        </Item>
                    </Grid>
                    <Grid item lg={9} md={10} xs={10}>
                        <Item className='Content' id="Content">
                            <Wrapper>
                                <Outlet />
                            </Wrapper>
                        </Item>
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
}

function RouteOut() {
    return (
        <RouterProvider router={router} />
    )
}



export default RouteOut;
