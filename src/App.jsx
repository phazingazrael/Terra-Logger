import * as React from 'react';
import Package from "../package.json";
import './App.css';
import { useState, useEffect } from 'react';

import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import InfoCard from "./component/infocard/infoCard.jsx"

import UploadForm from './component/uploadForm/index.jsx';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'rgba(193, 197, 195, 0.6)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


function App() {
    console.log(JSON.stringify(Package));
    let mapParsed = localStorage.getItem("mapParsed");

    const [map, setMap] = useState(
        JSON.parse(mapParsed)
    )



    return (
        <div className="App">
            <AppBar position="static">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Item>
                            <h1>
                                Terra-Logger. Azgaar's Fantasy Map Generator to structured Markdown.
                            </h1>
                        </Item>
                    </Grid>
                </Grid>
            </AppBar>
            <Container maxWidth="xl">
                <Grid container spacing={2}>
                    <Grid item lg={3} xs={5}>
                        <Item>
                            {/*
                            map
                                ? <SiteNav map={map} setMap={setMap} />
                                : <UploadForm />
                        */

                                map
                                    ? <div>
                                        <table>
                                            <tr>
                                                <td>Map Name</td>
                                                <td>{map.info.mapName}</td>
                                            </tr>
                                            <tr>
                                                <td>AFMG Version</td>
                                                <td>{map.info.version}</td>
                                            </tr>
                                            <tr>
                                                <td>Description</td>
                                                <td>{map.info.description}</td>
                                            </tr>
                                            <tr>
                                                <td>Exported At</td>
                                                <td>{map.info.exportedAt}</td>
                                            </tr>
                                            <tr>
                                                <td>Map Seed</td>
                                                <td>{map.info.seed}</td>
                                            </tr>
                                            <tr>
                                                <td>Map ID</td>
                                                <td>{map.info.mapId}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    : <UploadForm />}
                        </Item>
                    </Grid>
                    <Grid item lg={9} xs={5}>
                        <Item>
                            <InfoCard map={map} setMap={setMap} />
                        </Item>

                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default App;
