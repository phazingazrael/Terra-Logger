// Code within this file is modified code from Azgaar's Fantasy Map Generator
// Modifications made are to enable the loaded .map file and extraction of map information and the map svg for rendering.
// Additional modifications made to make code work with terra-logger codebase.

/* MIT License

Copyright 2017-2021 Max Haniyeu (Azgaar), azgaar.fmg@yandex.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

You can produce, without restrictions, any derivative works from the original
software and even reap commercial benefits from the sale of the secondary product.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
*/

import React from 'react';
import { useOutletContext } from "react-router-dom";

import * as d3 from 'd3';
import Delaunator from 'delaunator';
import { nanoid } from 'nanoid';
import { LoremIpsum } from "lorem-ipsum";

import { Biomes } from './biomes';

let rawMap = {
    "biomesData": {},
    "cities": [],
    "countries": [],
    "cultures": [],
    "info": {},
    "nameBases": [],
    "notes": [],
    "religions": [],
    "settings": {},
    "SVG": null,
    "svgMod": null
}

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

const fetchData = async (coa) => {
    try {
        const url =
            coa === undefined
                ? 'https://armoria.herokuapp.com/?size=500&format=svg'
                : 'https://armoria.herokuapp.com/?coa=' + encodeURIComponent(JSON.stringify(coa));

        const response = await fetch(url);
        const svgText = await response.text();
        //console.log(svgText)
        return (svgText);
    } catch (error) {
        console.error('Error fetching SVG:', error);
    }
};

export const parseLoadedResult = (result) => {
    try {
        const resultAsString = new TextDecoder().decode(result);
        // data can be in FMG internal format or base64 encoded
        const isDelimited = resultAsString.substring(0, 10).includes("|");
        const decoded = isDelimited ? resultAsString : decodeURIComponent(atob(resultAsString));

        const mapFile = decoded.split("\r\n");
        const mapVersion = parseFloat(mapFile[0].split("|")[0] || mapFile[0]);
        return [mapFile, mapVersion];
    } catch (error) {
        // map file can be compressed with gzip
        const uncompressedData = uncompress(result);
        if (uncompressedData) return parseLoadedResult(uncompressedData);

        console.error(error);
        return [null, null];
    }
}

export const uncompress = (compressedData) => {
    try {
        const uncompressedStream = new Blob([compressedData]).stream().pipeThrough(new DecompressionStream("gzip"));

        let uncompressedData = [];
        for (const chunk of uncompressedStream) {
            uncompressedData = uncompressedData.concat(Array.from(chunk));
        }

        return new Uint8Array(uncompressedData);
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const parseLoadedData = (data, appData) => {
    try {

        // begin processing map file // 

        let appInfo = appData
        // Parse Map Parameters //
        const params = data[0].split("|");

        if (params[3]) {
            let seed = params[3];
            appInfo.mapInformation.mapSeed = seed;
            rawMap.info.seed = seed;
        }
        if (params[4]) rawMap.info.graphWidth = +params[4]
        if (params[5]) rawMap.info.graphHeight = +params[5]
        rawMap.info.mapId = params[6]

        // Parse Map Settings //
        const settings = data[1].split("|");

        // Get Map Name and Save to Settings & Info objects in localStorage //
        if (settings[20]) rawMap.settings.mapName = rawMap.info.mapName = settings[20];
        localStorage.setItem("info", JSON.stringify(rawMap.info));

        if (settings[0]) rawMap.settings.distanceUnit = settings[0];
        if (settings[1]) rawMap.settings.distanceScale = settings[1];
        if (settings[2]) rawMap.settings.areaUnit = settings[2];
        if (settings[3]) rawMap.settings.heightUnit = settings[3];
        if (settings[4]) rawMap.settings.heightExponent = settings[4];
        if (settings[5]) rawMap.settings.temperatureScale = settings[5];
        if (settings[6]) rawMap.settings.barSize = settings[6];
        if (settings[7] !== undefined) rawMap.settings.barLabel = settings[7];
        if (settings[8] !== undefined) rawMap.settings.barBackOpacity = settings[8];
        if (settings[9]) rawMap.settings.barBackColor = settings[9];
        if (settings[10]) rawMap.settings.barPosX = settings[10];
        if (settings[11]) rawMap.settings.barPosY = settings[11];
        if (settings[12]) rawMap.settings.populationRate = settings[12];
        if (settings[13]) rawMap.settings.urbanization = settings[13];
        if (settings[14]) rawMap.settings.mapSize = settings[14];
        if (settings[15]) rawMap.settings.latitude0 = settings[15], 0, 100;
        if (settings[18]) rawMap.settings.prec = settings[18];
        if (settings[19]) rawMap.settings.options = JSON.parse(settings[19]);
        // setting 16 and 17 (temperature) are part of options now, kept as "" in newer versions for compatibility
        if (settings[16]) rawMap.settings.options.temperatureEquator = +settings[16];
        if (settings[17]) rawMap.settings.options.temperatureNorthPole = rawMap.settings.options.temperatureSouthPole = +settings[17];
        if (settings[21]) rawMap.settings.hideLabels = +settings[21];
        if (settings[22]) rawMap.settings.stylePreset = settings[22];
        if (settings[23]) rawMap.settings.rescaleLabels = +settings[23];
        if (settings[24]) rawMap.settings.urbanDensity = +settings[24];

        localStorage.setItem("settings", JSON.stringify(rawMap.settings));


        // Parse Map Notes //
        if (data[4]) {
            rawMap.notes = JSON.parse(data[4]);
            localStorage.setItem("notes", JSON.stringify(rawMap.notes));
        }

        // Biomes information //
        const biomesInfo = data[3].split("|");
        rawMap.biomesData = Biomes.getDefault();
        rawMap.biomesData.color = biomesInfo[0].split(",");
        rawMap.biomesData.habitability = biomesInfo[1].split(",").map(h => +h);
        rawMap.biomesData.name = biomesInfo[2].split(",");

        // push custom biomes if any
        for (let i = rawMap.biomesData.i.length; i < rawMap.biomesData.name.length; i++) {
            rawMap.biomesData.i.push(rawMap.biomesData.i.length);
            rawMap.biomesData.iconsDensity.push(0);
            rawMap.biomesData.icons.push([]);
            rawMap.biomesData.cost.push(50);
        }
        localStorage.setItem("biomesData", JSON.stringify(rawMap.biomesData));

        let cultures = JSON.parse(data[13]);
        let countries = JSON.parse(data[14]);
        let cities = JSON.parse(data[15]);
        let religions = JSON.parse(data[29]);



        cultures.map((Culture) => {
            let culObj = {
                "urbanPop": "",
                "ruralPop": "",
                "tags": []
            }

            const urbanvalue = Math.round(
                Culture.urban * rawMap.settings.populationRate * rawMap.settings.urbanization
            ).toLocaleString("en-US");

            const ruralvalue = Math.round(
                Culture.rural * rawMap.settings.populationRate
            ).toLocaleString("en-US");

            culObj.urbanPop = urbanvalue;
            culObj.ruralPop = ruralvalue;
            culObj.name = Culture.name;
            culObj.base = Culture.base;
            culObj.shield = Culture.shield;
            culObj.id = Culture.i.toString();
            culObj.color = Culture.color;
            culObj.type = Culture.type;
            culObj.expansionism = Culture.expansionism;
            culObj.origins = Culture.origins;
            culObj.code = Culture.code;
            culObj.urban = Culture.urban;
            culObj.rural = Culture.rural;
            culObj.area = Culture.area;
            culObj.cells = Culture.cells;
            culObj._id = nanoid();
            culObj.tags.push({
                "_id": "3za6JbQcWqraNj0guhnqk",
                "Name": "Culture",
                "Type": "WorldOverview",
                "Description": "The customs, arts, social institutions, and achievements of the world's inhabitants."
            })

            rawMap.cultures.push(culObj)

        })
        localStorage.setItem("cultures", JSON.stringify(rawMap.cultures))

        var countryArray = countries.filter((value) => Object.keys(value).length !== 0);
        countryArray.map((Country) => {

            let countryObj = {
                "_id": "",
                "cities": [],
                "coa": {},
                "color": "",
                "culture": "",
                "description": "",
                "fullName": "",
                "id": "",
                "img": "",
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

            countryObj.name = Country.name || "";
            countryObj.fullName = Country.fullName || Country.name;
            countryObj.warCampaigns = Country.campaigns || "";
            countryObj.color = Country.color || "#231e39";
            countryObj.political.form = Country.form || "";
            countryObj.political.formName = Country.formName || "";
            countryObj.id = Country.i.toString() || 0;
            countryObj._id = nanoid();
            countryObj.coa = Country.coa || undefined;
            countryObj.political.military = Country.military || "";

            countryObj.description = lorem.generateParagraphs(2);

            countryObj.tags.push({
                "_id": "TJaHO2uqBFZcoXWIfc5hJ",
                "Name": "Country",
                "Type": "Locations",
                "Description": "A distinct and sovereign nation within the world, often with defined borders."
            })

            Country.Settlement = "Country";
            countryObj.type = Country.Settlement;


            Country.diplomacy.map((Diplomat, index) => {
                if (Diplomat === "Suspicion") {
                    Diplomat = "Suspicious"
                }

                let dipObj = {
                    name: countries[index].fullName || countries[index].name,
                    status: Diplomat
                }
                countryObj.political.diplomacy.push(dipObj);

            });

            Country.neighbors.map((neighbor, index) => {

                let nObj = {
                    name: countries[neighbor].fullName || countries[neighbor].name
                }
                countryObj.political.neighbors.push(nObj);

            });


            countryObj.political.diplomacy.sort((a, b) => a.name.localeCompare(b.name));

            if (cultures[Country.culture] === undefined) {
                cultures[Country.culture] = 0;
            }

            countryObj.culture = cultures[Country.culture].name || "";


            const urbanvalue = Math.round(
                Country.urban * rawMap.settings.populationRate * rawMap.settings.urbanization
            );
            countryObj.population.urban = urbanvalue.toLocaleString("en-US") || "";
            Country.urbanPop = urbanvalue.toLocaleString("en-US");

            const ruralvalue = Math.round(Country.rural * rawMap.settings.populationRate);

            Country.ruralPop = ruralvalue.toLocaleString("en-US");
            countryObj.population.rural = ruralvalue.toLocaleString("en-US") || "";

            Country.populationout = Math.round(ruralvalue + urbanvalue);
            Country.populationout = Country.populationout.toLocaleString("en-US");
            countryObj.population.total = Country.populationout || "";
            


            rawMap.countries.push(countryObj);
            //mapData.Locations.countries.push(countryObj);

        })

        let cityArray = cities.filter((value) => Object.keys(value).length !== 0);
        cityArray.map((City) => {
            let cityObj = {
                "_id": "",
                "capital": null,
                "coa": {},
                "country": {},
                "culture": null,
                "features": [],
                "id": null,
                "isCapital": null,
                "mapLink": null,
                "name": null,
                "population": null,
                "size": null,
                "tags": [{
                    "_id": "1IZunX27kOFP-ff4kpeLQ",
                    "Name": "City",
                    "Type": "Locations",
                    "Description": "A large and permanent human settlement within the world."
                }],
                "type": null
            };

            cityObj.name = City.name;
            cityObj.id = City.i.toString();
            cityObj._id = nanoid();
            cityObj.description = "" || lorem.generateParagraphs(2);

            let cityState = City.state;
            let country = rawMap.countries[cityState];
            cityObj.country = {
                name: country.name || "",
                "nameFull": country.fullName || "",
                "govForm": country.political.form || "",
                "govName": country.political.formName || "",
                "id": country.id,
                "_id": country._id || ""
            };



            if (City.capital === true) {
                cityObj.capital = "Yes";
                cityObj.isCapital = true;
                cityObj.features.push("Capital")
                cityObj.tags.push({
                    "_id": "77eqKucwMaNXbgw_v-810",
                    "Name": "Capital",
                    "Type": "Maps",
                    "Description": "The primary city or town serving as the seat of government and administrative center."
                });
            } else {
                cityObj.capital = "No";
                cityObj.isCapital = false;
            }
            if (City.citadel === 1) {
                cityObj.features.push("Citadel");
                cityObj.tags.push({
                    "_id": "lTnDEGrVvLDS2feESzZPV",
                    "Name": "Citadel",
                    "Type": "Maps",
                    "Description": "A fortress, typically on high ground, protecting or dominating a city."
                });
            }
            if (City.port === 1) {
                cityObj.features.push("Port");
                cityObj.tags.push({
                    "_id": "3OVpUylcH9JCUZMSX9nK4",
                    "Name": "Port",
                    "Type": "Maps",
                    "Description": "Locations designated for harboring and facilitating the arrival, departure, and storage of ships and vessels. Ports are key points of trade, transportation, and naval activities within the world, often situated along coastlines or major waterways."
                })
            }
            if (City.plaza === 1) {
                cityObj.features.push("Plaza");
                cityObj.tags.push({
                    "_id": "4CoOX8cSxMIjSBOzlcWzT",
                    "Name": "Plaza",
                    "Type": "Maps",
                    "Description": "An open public square, especially in a city or town."
                })
            }
            if (City.walls === 1) {
                cityObj.features.push("Walls");
                cityObj.tags.push({
                    "_id": "7SfAGH2dfmCZVsaU8JNbt",
                    "Name": "Walls",
                    "Type": "Maps",
                    "Description": "Defensive barriers or fortifications enclosing a city or settlement."
                })
            }
            if (City.shanty === 1) {
                cityObj.features.push("Shanty Town");
                cityObj.tags.push({
                    "_id": "tgFP5-2syOFdgXGQS11hB",
                    "Name": "Shanty Town",
                    "Type": "Maps",
                    "Description": "A deprived area on the outskirts of a town consisting of makeshift dwellings."
                })
            }
            if (City.temple === 1) {
                cityObj.features.push("Temple");
                cityObj.tags.push({
                    "_id": "FeS5jSkiM7N6-yhVccuwZ",
                    "Name": "Temple",
                    "Type": "Maps",
                    "Description": "A building dedicated to the worship of deities or a place of religious practices."
                })
            }


            cityObj.features.sort((a, b) => a.localeCompare(b));


            cityObj.culture = cultures[City.culture].name;

            cityObj.coa = City.coa || undefined;

            if (City.link !== undefined) {
                cityObj.mapLink = City.link;
            }


            const populationvalue = Math.round(
                City.population * rawMap.settings.populationRate * rawMap.settings.urbanization
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


            rawMap.cities.push(cityObj);
        });

        religions.map((Religion) => {
            const urbanvalue = Math.round(
                Religion.urban * rawMap.settings.populationRate * rawMap.settings.urbanization
            ).toLocaleString("en-US");
            Religion.urbanPop = urbanvalue;

            const ruralvalue = Math.round(
                Religion.rural * rawMap.settings.populationRate
            ).toLocaleString("en-US");
            Religion.ruralPop = ruralvalue;

            let religObj = {
                i: Religion.i.toString() || "",
                name: Religion.name || "",
                culture: Religion.culture || "",
                type: Religion.type || "",
                form: Religion.form || "",
                deity: Religion.deity || "",
                origins: Religion.origins || "",
                code: Religion.code || "",
            };
            rawMap.religions.push(religObj);
        });

        let Countries = [...rawMap.countries];
        let Cities = [...rawMap.cities];
        let Religions = [...rawMap.religions];


        if (rawMap.cities !== []) {
            // Loop through each country
            Countries.forEach(country => {
                fetchData(country.coa);

                let imgURL = fetchData(country.coa)
                country.img = imgURL;
                const matchingCities = [];
                // Find cities that match the current country's id
                const countryCities = Cities.filter(city => city.country.id === country.id);

                // Add the matching cities to the result array
                matchingCities.push(...countryCities);

                matchingCities.forEach(city => {
                    country.cities.push(city._id)
                    city.country._id = country._id;
                })
            });
            localStorage.setItem("cities", JSON.stringify(rawMap.cities))
            localStorage.setItem("countries", JSON.stringify(rawMap.countries))
            localStorage.setItem("religions", JSON.stringify(rawMap.religions))
        }

        if (data[31]) {
            const namesDL = data[31].split("/");
            namesDL.forEach((d, i) => {
                const e = d.split("|");
                if (!e.length) return;
                const b = e[5].split(",").length > 2 || !rawMap.nameBases[i] ? e[5] : rawMap.nameBases[i].b;
                rawMap.nameBases[i] = { name: e[0], min: e[1], max: e[2], d: e[3], m: e[4], b };
            });
            localStorage.setItem("nameBases", JSON.stringify(rawMap.nameBases))
        }

        // svg stuff, do this last, takes a minute 
        if (data[5]) {
            const svgString = data[5];

            // Your JSON object with original height and width values
            const originalDimensions = { width: rawMap.info.graphWidth, height: rawMap.info.graphHeight };

            // Parse the SVG string
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
            const svgElement = svgDoc.documentElement;

            // Get current window dimensions
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Get original dimensions from JSON
            const originalWidth = originalDimensions.width;
            const originalHeight = originalDimensions.height;

            // Calculate scaling factors for both width and height
            const widthScale = windowWidth / originalWidth;
            const heightScale = windowHeight / originalHeight;

            // Use the smaller scaling factor to ensure the SVG fits within the window
            const minScale = Math.min(widthScale, heightScale);

            // Replace the original SVG string with the modified one
            const modifiedSvgString = new XMLSerializer().serializeToString(svgElement);

            // Now 'modifiedSvgString' contains the scaled SVG code

            // Insert 'modifiedSvgString' into the DOM or use it as needed
            document.body.insertAdjacentHTML("afterbegin", modifiedSvgString);
            localStorage.setItem("SVG", JSON.stringify(data[5]));

            let map = document.getElementById("map");
            let viewBox = document.getElementById("viewbox");
            map.setAttribute("height", innerHeight);
            map.setAttribute("width", innerWidth);

            viewBox.setAttribute("transform", `scale(${minScale})`);
            localStorage.setItem("svgMod", new XMLSerializer().serializeToString(map));
        }

        return (rawMap);
    } catch (error) {
        console.error(error);

        const alertMessage = document.getElementById('alertMessage');
        const errorBox = document.createElement('p');
        errorBox.id = "errorBox";
        errorBox.className = "error-message";
        errorBox.innerHTML = parseError(error);

        alertMessage.innerHTML = `An error is occurred on map loading. Select a different file to load, <br />generate a new random map or cancel the loading`;
        alertMessage.appendChild(errorBox);

        const alertDialog = document.createElement('div');
        alertDialog.id = 'alert';
        document.body.appendChild(alertDialog);

        const buttonWrap = document.createElement('div');
        buttonWrap.className = "button-container";


        const selectFileButton = document.createElement('button');
        selectFileButton.textContent = 'Select file';
        selectFileButton.className = "custom-button";
        selectFileButton.addEventListener('click', function () {
            //alert('Select file button clicked'); // Replace this with your logic
            alertDialog.style.display = 'none';
            //mapToLoad.click();
        });

        const newMapButton = document.createElement('button');
        newMapButton.textContent = 'New map';
        newMapButton.className = "custom-button";
        newMapButton.addEventListener('click', function () {
            //alert('New map button clicked'); // Replace this with your logic
            alertDialog.style.display = 'none';
            //regenerateMap('loading error');
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = "custom-button";
        cancelButton.addEventListener('click', function () {
            //alert('Cancel button clicked'); // Replace this with your logic
            alertDialog.style.display = 'none';
        });


        alertDialog.style.position = 'absolute';
        alertDialog.style.left = '50%';
        alertDialog.style.top = '50%';
        alertDialog.style.transform = 'translate(-50%, -50%)';
        alertDialog.style.maxWidth = '50em';
        alertDialog.style.display = 'block';
        alertDialog.appendChild(alertMessage);
        alertDialog.appendChild(buttonWrap);
        buttonWrap.appendChild(selectFileButton);
        buttonWrap.appendChild(newMapButton);
        buttonWrap.appendChild(cancelButton);
    }
    function parseError(error) {
        // Replace this with your actual implementation
        return error ? error.toString() : 'Unknown error';
    }
}