import * as React from 'react';
import Package from "../package.json";
import './App.css';
import { useState, useEffect } from 'react';

import { Paper, Grid, fr, Button, GridProps, Chip } from "@prismane/core";

import { Planet } from "@phosphor-icons/react";

import { styled } from '@mui/material/styles';

import InfoCard from "./component/infocard/countryInfoCard.jsx";
import UploadForm from './component/uploadForm/index.jsx';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'rgba(193, 197, 195, 0.6)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    //textAlign: 'center',
    color: theme.palette.text.secondary,
}));


function App() {
    const [isLoading, setLoading] = useState(false);

    let mapParsed = JSON.parse(localStorage.getItem("mapParsed"));

    const [mapData, setMap] = useState(
        mapParsed
    )
    //console.log(mapData);

    useEffect(() => {
        setLoading(false);
        setMap(JSON.parse(localStorage.getItem("mapParsed")));
    }, [mapData, isLoading, setLoading, setMap]);



    return (
        <div className="App">
            <Grid gap={fr(3)} templateColumns={11}>
                <Grid.Item columnStart={1} columnEnd={12} rowStart={1} rowEnd={2}>
                    <Item className="Header">
                        <span className="HeaderText">
                            <h1>
                                Terra-Logger. Azgaar's Fantasy Map Generator to structured Markdown.
                            </h1>

                            {mapData ?
                                (<Chip className="MapName" size="lg" color="emerald"><Planet size={16} pt={2} /> Current Map Loaded: {mapData.mapInfo.info.mapName}</Chip>) : ""}
                        </span>
                    </Item>
                </Grid.Item>
                <Grid.Item columnStart={1} columnEnd={3} rowStart={2} rowEnd={12}>
                    <Item className="Navigation">
                        {
                            mapData
                                ? (<div>
                                    <ul>
                                        {Object.entries(mapData.mapInfo.info).map(([key, value]) => <li key={key}>{key.replace(/([A-Z])/g, ' $1')
                                            // uppercase the first character
                                            .replace(/^./, (str) => str.toUpperCase())}: {value}</li>)}
                                    </ul>
                                </div>)
                                : <UploadForm mapData={mapData} setMap={setMap} isLoading={isLoading} setLoading={setLoading} Package={Package} />
                        }
                        {/*
                            mapData
                                ? <SiteNav mapData={mapData} setMap={setMap} />
                                : <UploadForm />
                            */}
                    </Item>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            console.log("Clearing Storage");
                            localStorage.removeItem("mapParsed")
                        }}>
                        Clear Saved Data - WARNING YOU WILL LOSE ALL DATA
                    </Button>
                </Grid.Item>
                <Grid.Item columnStart={3} columnEnd={12} rowStart={2} rowEnd={12} >
                    <Item className="Content">
                        {mapData ? (<InfoCard mapData={mapData} setMap={setMap} />) : ""}
                    </Item>
                </Grid.Item>
            </Grid>
        </div>
    );
}


export default App;
