import React, { useState, useReducer } from 'react';
import { useLoaderData } from "react-router-dom";
import { Link } from 'react-router-dom';

import MapBook from '~icons/gis/map-book.jsx';

import { Box, Button } from '@mui/material';

import EdiText from 'react-editext';

import Sketch from '@uiw/react-color-sketch';

import { getCountry } from "../data/countries.jsx";

import "./countryView/main.css";


export async function loader({ params }) {
    console.log(params._id)
    const country = await getCountry(params._id);
    return { country };
}


const CountryView = () => {
    const [editing, setEditing] = useState(false)
    let Cities = JSON.parse(localStorage.getItem("cities"));
    const { country } = useLoaderData();
    //console.log(JSON.stringify(country));


    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

    const [hex, setHex] = useState(country.color);
    const [disableAlpha, setDisableAlpha] = useState(false);

    const [mapData, setMap] = useState(
        JSON.parse(localStorage.getItem("mapParsed"))
    )

    const saveCountry = (data) => {
        console.log('saving data');
        let Countries = JSON.parse(localStorage.getItem("countries"));
        let mapData = JSON.parse(localStorage.getItem("mapParsed"));
        let upd_obj = Countries.findIndex((obj => obj._id === data._id));
        let tMap = Countries;
        let toMap = mapData;
        tMap.splice(upd_obj, 1, data);
        toMap.Locations.countries.splice(upd_obj, 1, data);
        //localStorage.setItem("countries", JSON.stringify(tMap));
        //localStorage.setItem("mapParsed", JSON.stringify(toMap));
        setMap(toMap);
        forceUpdate();
        //console.log(data)
    }

    const delCountry = (data) => {
        console.log('saving data');
        let Countries = JSON.parse(localStorage.getItem("countries"));
        let upd_obj = Countries.findIndex((obj => obj._id === data._id));
        let tMap = Countries;
        tMap.splice(upd_obj, 1,);
        localStorage.setItem("mapParsed", JSON.stringify(mapData));
        setMap();
        setMap(JSON.parse(localStorage.getItem("mapParsed")));
        setLoading(false);
    };

    return (
        <div>
            <Button variant="contained" onClick={() => {
                setEditing(e => !e)
            }}>Toggle Editing Mode</Button>
            <Button variant="contained" color="error" onClick={() => (
                setTimeout(5000,
                    delCountry(element),
                    forceUpdate()
                )
            )}>Delete</Button>

            <Box className="contentMain" style={{ backgroundColor: 'rgba(193, 197, 195, 0.7)' }}>

                <div id="main">
                    <div className="inner countryPage">
                        <header id="header" style={{ borderBottom: "solid 5px " + country.color }}>
                            <div>
                                <h1 className="logo">
                                    <EdiText
                                        showButtonsOnHover
                                        type='text'
                                        onCancel={v => console.log('CANCELLED: ', v)}
                                        onEditingStart={v => console.log('EDITING STARTED: ', v)}
                                        onSave={v => {
                                            console.log('SAVED: ', v)
                                            country.fullName = v;
                                            console.log("country.fullName: " + country.fullName)
                                            saveCountry(country);
                                        }}
                                        value={country.fullName}
                                        editing={editing}
                                    />
                                </h1>
                                <h2>
                                    <EdiText
                                        showButtonsOnHover
                                        type='text'
                                        onCancel={v => console.log('CANCELLED: ', v)}
                                        onEditingStart={v => console.log('EDITING STARTED: ', v)}
                                        onSave={v => {
                                            console.log('SAVED: ', v)
                                            country.name = v.replace(/\(|\)/g, "");
                                            console.log("country.name: " + country.name)
                                            saveCountry(country);
                                        }}
                                        value={"(" + country.name + ")"}
                                        editing={editing}
                                    />
                                </h2>
                            </div>
                            <ul className="icons">
                                <li>
                                    <span className="icon brands countryIcon" style={{ backgroundColor: country.color, }}>
                                        <MapBook style={{ width: "5vw", height: "7vh" }} />
                                        <span className="label">Country</span>
                                    </span>
                                </li>
                            </ul>
                        </header>
                        <section id="banner">
                            <div className="content">
                                <div className="description">
                                    <header>
                                        <h1>Description</h1>
                                    </header>
                                    <EdiText
                                        startEditingOnFocus
                                        showButtonsOnHover
                                        type='textarea'
                                        viewContainerClassName='textArea-view-wrapper'
                                        saveButtonClassName='textArea-save-button'
                                        editButtonClassName='textArea-edit-button'
                                        cancelButtonClassName='textArea-cancel-button'
                                        saveButtonContent="Save"
                                        cancelButtonContent="Cancel"
                                        editButtonContent="Edit"
                                        inputProps={{
                                            rows: 50,
                                            columns: 25
                                        }}
                                        onCancel={v => console.log('CANCELLED: ', v)}
                                        onEditingStart={v => console.log('EDITING STARTED: ', v)}
                                        onSave={v => {
                                            console.log('SAVED: ', v)
                                            country.description = v;
                                            console.log("country.fullName: " + country.description)
                                            saveCountry(country);
                                        }}
                                        value={country.description}
                                        editing={editing}
                                    />
                                </div>
                                {
                                    editing
                                        ? (
                                            <div className="cColor object">
                                                <h1>Color</h1>
                                                <Sketch
                                                    style={{ marginLeft: 20 }}
                                                    color={hex}
                                                    disableAlpha={disableAlpha}
                                                    onChange={(color) => {
                                                        setHex(color.hex);
                                                        country.color = color.hex;
                                                        saveCountry(country);
                                                    }}
                                                />
                                                <button onClick={() => setDisableAlpha(!disableAlpha)}>
                                                    disableAlpha={disableAlpha.toString()}
                                                </button>
                                            </div>
                                        )
                                        : ""
                                }
                                <div className="object emblem">
                                    <h1>Coat of Arms / Emblem</h1>
                                    <img className="image-coa" src={country.coa === undefined ? ("https://armoria.herokuapp.com/?size=500&format=svg") : ("https://armoria.herokuapp.com/?coa=" + JSON.stringify(country.coa))} alt="Coat of Arms" />
                                    <div className="detailsPad">
                                        <h6>Population:</h6>
                                        <ul className="alt">
                                            <li>
                                                Rural: {country.population.rural}
                                            </li>
                                            <li>
                                                Urban: {country.population.urban}
                                            </li>
                                            <li>
                                                Total: {country.population.total}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <header className="major" style={{ borderBottom: "solid 5px " + country.color }}>
                                <h1>Cities within {country.fullName}</h1>
                            </header>
                            <div>
                            </div>
                            <div className="posts grid">
                                {Cities.filter(obj => {
                                    return obj.country._id === country._id
                                }).map((city) => {
                                    return (
                                        <article key={city._id} className="cityCard child">
                                            <img
                                                src={city.coa === undefined ? ("https://armoria.herokuapp.com/?size=500&format=svg") : ("https://armoria.herokuapp.com/?coa=" + JSON.stringify(city.coa))}
                                                alt=""
                                            />
                                            <h3>{city.name}</h3>
                                            <p>{city.description}</p>
                                            <ul className="actions">
                                                <li>
                                                    <Link to={"/main_window/cities/" + `${city._id}` + "/view"}>More</Link>
                                                </li>
                                            </ul>
                                        </article>
                                    )
                                })}
                            </div>
                        </section>

                    </div>
                </div>
            </Box>
        </div>
    );
}

export default CountryView;