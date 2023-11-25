import React, { useState, useReducer, useEffect } from 'react';
import { useLoaderData } from "react-router-dom";
import { Link } from 'react-router-dom';

import MapBook from '~icons/gis/map-book.jsx';

import { Box, Button } from '@mui/material';

import EdiText from 'react-editext';

import { getCity } from "../../data/cities.jsx";
import { getCountry } from "../../data/countries.jsx";

import "./main.css";


export async function loader({ params }) {
    //console.log(params._id)
    console.log(params)
    const city = await getCity(params._id);
    //console.log(JSON.stringify(city))
    return { city };
}


const CityView = () => {
    const [editing, setEditing] = useState(false)
    const { city } = useLoaderData();


    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

    const [mapData, setMap] = useState(
        JSON.parse(localStorage.getItem("mapParsed"))

    )

    const saveCity = (data) => {
        console.log('saving data');
        let Cities = JSON.parse(localStorage.getItem("cities"));
        let mapData = JSON.parse(localStorage.getItem("mapParsed"));
        let upd_obj = Cities.findIndex((obj => obj._id === data._id));
        let tMap = Cities;
        let toMap = mapData;
        tMap.splice(upd_obj, 1, data);
        toMap.Locations.cities.splice(upd_obj, 1, data);
        //localStorage.setItem("cities", JSON.stringify(tMap));
        //localStorage.setItem("mapParsed", JSON.stringify(toMap));
        setMap(toMap);
        forceUpdate();
        //console.log(data)
    }

    const delCity = (data) => {
        console.log('saving data');
        let Cities = JSON.parse(localStorage.getItem("cities"));
        let upd_obj = Cities.findIndex((obj => obj._id === data._id));
        let tMap = Cities;
        tMap.splice(upd_obj, 1,);
        localStorage.setItem("mapParsed", JSON.stringify(mapData));
        setMap();
        setMap(JSON.parse(localStorage.getItem("mapParsed")));
        setLoading(false);
    };

    let Countries = JSON.parse(localStorage.getItem("countries"));


    const country = Countries.filter(obj => {
        return obj._id === city.country._id
    })

    useEffect(() => {

        console.log(JSON.stringify(country))
        city.color = country.color;
        console.log(city);
        forceUpdate()
    }, []);

    return (
        <div>
            <Button variant="contained" onClick={() => {
                setEditing(e => !e)
            }}>Toggle Editing Mode</Button>
            <Button variant="contained" color="error" onClick={() => (
                setTimeout(5000,
                    delCity(element),
                    forceUpdate()
                )
            )}>Delete</Button>

            <Box className="contentMain" style={{ backgroundColor: 'rgba(193, 197, 195, 0.7)' }}>

                <div id="main">
                    <div className="inner cityPage">
                        <header id="header" style={{ borderBottom: "solid 5px " + city.color }}>
                            <div>
                                <h1 className="logo">
                                    <EdiText
                                        showButtonsOnHover
                                        type='text'
                                        onCancel={v => console.log('CANCELLED: ', v)}
                                        onEditingStart={v => console.log('EDITING STARTED: ', v)}
                                        onSave={v => {
                                            console.log('SAVED: ', v)
                                            city.name = v;
                                            console.log("city.name: " + city.name)
                                            saveCity(city);
                                        }}
                                        value={city.name}
                                        editing={editing}
                                    />
                                </h1>
                            </div>
                            <ul className="icons">
                                <li>
                                    <span className="icon brands cityIcon" style={{ backgroundColor: country.color, }}>
                                        <MapBook style={{ width: "5vw", height: "7vh" }} />
                                        <span className="label">City</span>
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
                                            city.description = v;
                                            console.log("city.fullName: " + city.description)
                                            saveCity(city);
                                        }}
                                        value={city.description}
                                        editing={editing}
                                    />
                                </div>
                                <div className="object emblem">
                                    <h1>Coat of Arms / Emblem</h1>
                                    <img className="image-coa" src={city.coa === undefined ? ("https://armoria.herokuapp.com/?size=500&format=svg") : ("https://armoria.herokuapp.com/?coa=" + JSON.stringify(city.coa))} alt="Coat of Arms" />
                                    <div className="detailsPad">
                                        <h6>Population:</h6>
                                        <ul className="alt">
                                            <li>
                                                {city.size} - Population: {city.population}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <header className="major" style={{ borderBottom: "solid 5px " + country.color }}>
                                <h1>Cities within {city.fullName}</h1>
                            </header>
                            <div>
                            </div>
                            <div className="posts grid">

                            </div>
                        </section>

                    </div>
                </div>
            </Box>
        </div>
    );
}

export default CityView;