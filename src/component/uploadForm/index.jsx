import * as React from 'react';
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

const UploadForm = ({ isLoading, setLoading, mapData, setMap }) => {


    const readJSON = (e) => {
        const fileReader = new FileReader();

        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            let result = JSON.parse(e.target.result);

            localStorage.setItem("rawMap", JSON.stringify(result));

            console.log(result.info);

            const states = result.cells.states;
            const cities = result.cells.burgs;
            const provinces = result.cells.provinces;
            const cultures = result.cells.cultures;
            const features = result.cells.features;
            const religions = result.cells.religions;
            var cityArray = cities.filter((value) => Object.keys(value).length !== 0);
            var stateArray = states.filter((value) => Object.keys(value).length !== 0);
            var religionArray = religions.filter(
                (value) => Object.keys(value).length !== 0
            );

            let mapData = {
                Locations: {
                    cities: [],
                    countries: [],
                    provinces: []
                },
                mapInfo: {
                    info: result.info,
                    settings: result.settings,
                    coords: result.coords
                },
                notes: result.notes,
                nameBases: result.nameBases,
                religions: []
            }
            let Cities = [];
            let Countries = [];
            let Provinces = [];




            cityArray.map((City) => {


                let cityObj = {
                    "_id": "",
                    "capital": null,
                    "coa": {},
                    "country": {},
                    "culture": null,
                    "features": [],
                    "i": null,
                    "isCapital": null,
                    "mapLink": null,
                    "name": null,
                    "population": null,
                    "size": null,
                    "type": null
                };



                cityObj.name = City.name;
                cityObj.i = City.i;


                let cityState = City.state;
                let country = states[cityState];


                cityObj.country = {
                    name: country.name || "",
                    "nameFull": country.fullName || "",
                    "govForm": country.form || "",
                    "govName": country.formName || "",
                    "cid": country.i || "0",
                    "c_id": "",
                };



                if (City.capital === true) {
                    cityObj.capital = "Yes";
                    cityObj.isCapital = true;
                    cityObj.features.push("Capital")
                } else {
                    cityObj.capital = "No";
                    cityObj.isCapital = false;
                }
                if (City.citadel === 1) {
                    cityObj.features.push("Citadel");
                }
                if (City.port === 1) {
                    cityObj.features.push("Port");
                }
                if (City.plaza === 1) {
                    cityObj.features.push("Plaza");
                }
                if (City.walls === 1) {
                    cityObj.features.push("Walls");
                }
                if (City.shanty === 1) {
                    cityObj.features.push("Shanty Town");
                }
                if (City.temple === 1) {
                    cityObj.features.push("Temple");
                }


                cityObj.features.sort((a, b) => a.localeCompare(b));


                cityObj.culture = cultures[City.culture].name;

                cityObj.coa = City.coa || undefined;

                if (City.link !== undefined) {
                    cityObj.mapLink = City.link;
                }


                const populationvalue = Math.round(
                    City.population * mapData.mapInfo.settings.populationRate * mapData.mapInfo.settings.urbanization
                );

                cityObj.population = populationvalue.toLocaleString("en-US");

                if (populationvalue < 21) {
                    cityObj.size = "Thorp";
                } else if ((populationvalue > 21, populationvalue < 60)) {
                    cityObj.size = "Hamlet";
                } else if ((populationvalue > 61, populationvalue < 200)) {
                    cityObj.size = "Village";
                } else if ((populationvalue > 201, populationvalue < 2000)) {
                    cityObj.size = "Small Town";
                } else if ((populationvalue > 2001, populationvalue < 5000)) {
                    cityObj.size = "Large Town";
                } else if ((populationvalue > 5001, populationvalue < 10000)) {
                    cityObj.size = "Small City";
                } else if ((populationvalue > 10001, populationvalue < 25000)) {
                    cityObj.size = "Large City";
                } else if (populationvalue > 25000) {
                    cityObj.size = "Metropolis";
                }
                cityObj.type = "City - " + cityObj.size;


                Cities.push(cityObj);
                mapData.Locations.cities.push(cityObj);



            });
            localStorage.setItem("cities", JSON.stringify(Cities));

            states.map((State) => {

                let countryObj = {
                    "_id": "",
                    "coa": {},
                    "color": "",
                    "culture": "",
                    "description": "",
                    "fullName": "",
                    "i": "",
                    "name": "",
                    "political": {
                        "diplomacy": [],
                        "form": "",
                        "formName": "",
                        "military": [],
                        "neighbors": [],
                        "ruler": "",
                        "leaders": []
                    },
                    "population": {
                        "rural": "",
                        "total": "",
                        "urban": ""
                    },
                    "tags": [],
                    "type": "",
                    "warCampaigns": []
                }

                countryObj.name = State.name || "";
                countryObj.fullName = State.fullName || State.name;
                countryObj.warCampaigns = State.campaigns || "";
                countryObj.color = State.color || "#231e39";
                countryObj.political.form = State.form || "";
                countryObj.political.formName = State.formName || "";
                countryObj.i = State.i || "";
                countryObj._id = nanoid();
                countryObj.coa = State.coa || undefined;
                countryObj.political.military = State.military || "";

                countryObj.description = lorem.generateParagraphs(7);


                State.Settlement = "Country";
                countryObj.type = State.Settlement;


                State.diplomacy.map((Diplomat, index) => {
                    if (Diplomat === "Suspicion") {
                        Diplomat = "Suspicious"
                    }

                    let dipObj = {
                        name: states[index].fullName || states[index].name,
                        status: Diplomat
                    }
                    countryObj.political.diplomacy.push(dipObj);

                });

                State.neighbors.map((neighbor, index) => {

                    let nObj = {
                        name: states[neighbor].fullName || states[neighbor].name
                    }
                    countryObj.political.neighbors.push(nObj);

                });


                countryObj.political.diplomacy.sort((a, b) => a.name.localeCompare(b.name));

                if (cultures[State.culture] === undefined) {
                    cultures[State.culture] = 0;
                }

                countryObj.culture = cultures[State.culture].name || "";


                const urbanvalue = Math.round(
                    State.urban * mapData.mapInfo.settings.populationRate * mapData.mapInfo.settings.urbanization
                );
                countryObj.population.urban = urbanvalue.toLocaleString("en-US") || "";
                State.urbanPop = urbanvalue.toLocaleString("en-US");

                const ruralvalue = Math.round(State.rural * mapData.mapInfo.settings.populationRate);

                State.ruralPop = ruralvalue.toLocaleString("en-US");
                countryObj.population.rural = ruralvalue.toLocaleString("en-US") || "";

                State.populationout = Math.round(ruralvalue + urbanvalue);
                State.populationout = State.populationout.toLocaleString("en-US");
                countryObj.population.total = State.populationout || "";

                Countries.push(countryObj);
                mapData.Locations.countries.push(countryObj);



            });

            localStorage.setItem("countries", JSON.stringify(Countries));

            religions.map((Religion) => {
                const urbanvalue = Math.round(
                    Religion.urban * mapData.mapInfo.settings.populationRate * mapData.mapInfo.settings.urbanization
                ).toLocaleString("en-US");
                Religion.urbanPop = urbanvalue;

                const ruralvalue = Math.round(
                    Religion.rural * mapData.mapInfo.settings.populationRate
                ).toLocaleString("en-US");
                Religion.ruralPop = ruralvalue;

                let religObj = {
                    i: Religion.i || "",
                    name: Religion.name || "",
                    color: Religion.color || "",
                    culture: Religion.culture || "",
                    type: Religion.type || "",
                    form: Religion.form || "",
                    deity: Religion.deity || "",
                    center: Religion.center || "",
                    origins: Religion.origins || "",
                    code: Religion.code || "",
                };
            });


            localStorage.setItem("mapParsed", JSON.stringify(mapData));
        };
        fileReader.onloadend = e => {
            let mapData = JSON.parse(localStorage.getItem("mapParsed"));
            let Countries = JSON.parse(localStorage.getItem("countries"));
            let Cities = JSON.parse(localStorage.getItem("cities"));


            Countries.map((Country) => {
                Country.cities = [];
                Country.tags.push(Country.type)
                Cities.filter(obj => {
                    return obj.country.cid === Country.i
                }).map((city) => {
                    Country.cities.push(city);
                });

            });

            mapData.Locations.cities = Cities;
            mapData.Locations.countries = Countries;
            localStorage.setItem("countries", JSON.stringify(Countries))
            setMap(mapData)
        };
    }

    useEffect(() => {

    }, [mapData, isLoading, setLoading, setMap]);

    return (
        <div className="uploadForm">
            <h5>Uh Oh, Looks like there isn't anything loaded, Want to load an exported map.json file?</h5>
            <div>
                <label htmlFor="upload">
                    Upload File:
                </label>
                <input
                    type="file"
                    name="upload"
                    id="upload"
                    accept='.json'
                    onChange={readJSON}
                />
            </div>
        </div>
    );
}

export default UploadForm;
