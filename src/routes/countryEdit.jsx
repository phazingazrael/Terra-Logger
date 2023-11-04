import React, { useState, useReducer } from 'react';
import { useLoaderData } from "react-router-dom";
import { Link } from 'react-router-dom';

import MapBook from '~icons/gis/map-book.jsx';

import { Box } from '@mui/material';

import EdiText from 'react-editext';

import { getCountry } from "../data/countries.jsx";

import "./countryView/main.css";
import "./countryEdit/countryEdit.css";


export async function loader({ params }) {
    console.log(params._id)
    const country = await getCountry(params._id);
    return { country };
}





const CountryView = () => {
    let Cities = JSON.parse(localStorage.getItem("cities"));
    const { country } = useLoaderData();
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

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
        localStorage.setItem("countries", JSON.stringify(tMap));
        localStorage.setItem("mapParsed", JSON.stringify(toMap));
        setMap(toMap);
        forceUpdate();
        console.log(data)
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

    console.log(JSON.stringify(country));
    return (
        <Box style={{ backgroundColor: 'rgba(193, 197, 195, 0.7)' }}>
            <div id="main">
                <div className="inner countryPage">
                    <header id="header" style={{ borderBottom: "solid 5px " + country.color }}>
                        <h1 className="logo">
                            <strong>
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
                                />

                            </strong> ({country.name})
                        </h1>
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
                            <header>
                                <h1>Description</h1>
                            </header>
                            <p>
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
                                    onCancel={v => console.log('CANCELLED: ', v)}
                                    onEditingStart={v => console.log('EDITING STARTED: ', v)}
                                    onSave={v => {
                                        console.log('SAVED: ', v)
                                        country.description = v;
                                        console.log("country.fullName: " + country.description)
                                        saveCountry(country);
                                    }}
                                    value={country.description}
                                />
                            </p>
                        </div>
                        <span className="image object">
                            <img src={country.coa === undefined ? ("https://armoria.herokuapp.com/?size=500&format=svg") : ("https://armoria.herokuapp.com/?coa=" + JSON.stringify(country.coa))} alt="" />
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
                        </span>
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
    );
}

export default CountryView;