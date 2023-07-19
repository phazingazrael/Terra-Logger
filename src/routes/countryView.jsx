import React, { useState, useEffect } from 'react';
import { Form, useLoaderData } from "react-router-dom";
import { getCountry } from "../countries.jsx";


import { Box } from '@mui/material';

import "./countryView/main.css"


export async function loader({ params }) {
    console.log(params._id)
    const country = await getCountry(params._id);
    return { country };
}



const CountryView = () => {
    const { country } = useLoaderData();
    return (
        <Box style={{ backgroundColor: 'rgba(193, 197, 195, 0.7)' }}>
            <div id="main">
                <div className="inner countryPage">


                    <header id="header" style={{ borderBottom: "solid 5px " + country.color }}>
                        <h1 className="logo"><strong>{country.fullName}</strong> ({country.name})</h1>
                        <ul className="icons">
                            <li><span className="icon brands fa-twitter"><span className="label">Twitter</span></span></li>
                            <li><a href="#" className="icon brands fa-facebook-f"><span className="label">Facebook</span></a></li>
                            <li><a href="#" className="icon brands fa-snapchat-ghost"><span className="label">Snapchat</span></a></li>
                            <li><a href="#" className="icon brands fa-instagram"><span className="label">Instagram</span></a></li>
                            <li><a href="#" className="icon brands fa-medium-m"><span className="label">Medium</span></a></li>
                        </ul>
                    </header>


                    <section id="banner">
                        <div className="content">
                            <header>
                                <h1>Description</h1>
                                <p>A free and fully responsive site template</p>
                            </header>
                            <p>{country.description}</p>
                        </div>
                        <span className="image object">
                            <img src="images/pic10.jpg" alt="" />
                        </span>
                    </section>


                    <section>
                        <header className="major" style={{ borderBottom: "solid 5px " + country.color }}>
                            <h2>Replace this with Features</h2>
                        </header>
                        <div className="features">
                            <article>
                                <span className="icon fa-gem"></span>
                                <div className="content">
                                    <h3>Portitor ullamcorper</h3>
                                    <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                </div>
                            </article>
                            <article>
                                <span className="icon solid fa-paper-plane"></span>
                                <div className="content">
                                    <h3>Sapien veroeros</h3>
                                    <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                </div>
                            </article>
                            <article>
                                <span className="icon solid fa-rocket"></span>
                                <div className="content">
                                    <h3>Quam lorem ipsum</h3>
                                    <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                </div>
                            </article>
                            <article>
                                <span className="icon solid fa-signal"></span>
                                <div className="content">
                                    <h3>Sed magna finibus</h3>
                                    <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                </div>
                            </article>
                        </div>
                    </section>


                    <section>
                        <header className="major" style={{ borderBottom: "solid 5px " + country.color }}>
                            <h2>Replace this section with cities.map</h2>
                        </header>
                        <div className="posts">
                            <article>
                                <a href="#" className="image"><img src="images/pic01.jpg" alt="" /></a>
                                <h3>Interdum aenean</h3>
                                <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                <ul className="actions">
                                    <li><a href="#" className="button">More</a></li>
                                </ul>
                            </article>
                            <article>
                                <a href="#" className="image"><img src="images/pic02.jpg" alt="" /></a>
                                <h3>Nulla amet dolore</h3>
                                <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                <ul className="actions">
                                    <li><a href="#" className="button">More</a></li>
                                </ul>
                            </article>
                            <article>
                                <a href="#" className="image"><img src="images/pic03.jpg" alt="" /></a>
                                <h3>Tempus ullamcorper</h3>
                                <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                <ul className="actions">
                                    <li><a href="#" className="button">More</a></li>
                                </ul>
                            </article>
                            <article>
                                <a href="#" className="image"><img src="images/pic04.jpg" alt="" /></a>
                                <h3>Sed etiam facilis</h3>
                                <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                <ul className="actions">
                                    <li><a href="#" className="button">More</a></li>
                                </ul>
                            </article>
                            <article>
                                <a href="#" className="image"><img src="images/pic05.jpg" alt="" /></a>
                                <h3>Feugiat lorem aenean</h3>
                                <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                <ul className="actions">
                                    <li><a href="#" className="button">More</a></li>
                                </ul>
                            </article>
                            <article>
                                <a href="#" className="image"><img src="images/pic06.jpg" alt="" /></a>
                                <h3>Amet varius aliquam</h3>
                                <p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
                                <ul className="actions">
                                    <li><a href="#" className="button">More</a></li>
                                </ul>
                            </article>
                        </div>
                    </section>

                </div>
            </div>
        </Box>
    );
}

export default CountryView;