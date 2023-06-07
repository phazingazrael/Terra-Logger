import * as React from 'react';
import Package from "../package.json";
import './App.css';

import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import InfoCard from "./component/infocard/infoCard.jsx"

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'rgba(193, 197, 195, 0.6)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


function App() {
    console.log(Package.version);



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
                    <Grid item xs={4}>
                        <Item>xs=4</Item>
                    </Grid>
                    <Grid item xs={8}>
                        <Item>
                            <InfoCard />
                        </Item>

                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default App;
