import { matchSorter } from "match-sorter";

export async function getCities(query) {
    fakeNetwork(`getCities:${query}`);
    let cities = localStorage.getItem("cities");
    if (!cities) cities = [];
    if (query) {
        cities = matchSorter(cities, query, { keys: ["first", "last"] });
    }
    return cities;
}

export async function getCity(_id) {
    fakeNetwork(`city:${_id}`);
    let Cities = JSON.parse(localStorage.getItem("cities"));
    let City = Cities.find(city => city._id === _id);
    return City ?? null;
}

export async function updateCity(_id, updates) {
    fakeNetwork();
    let cities = localStorage.getItem("cities");
    let city = cities.find(city => city._id === _id);
    if (!city) throw new Error("No city found for", _id);
    Object.assign(city, updates);
    set(cities);
    return city;
}

export async function deleteContact(_id) {
    let map = localStorage.getItem("mapParsed");
    let cities = map.Locations.cities;
    let index = cities.findIndex(city => city._id === _id);
    if (index > -1) {
        cities.splice(index, 1);
        set(cities);
        return true;
    }
    return false;
}

function set(cities) {
    return localStorage.setItem("cities", cities);
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache = {};

async function fakeNetwork(key) {
    if (!key) {
        fakeCache = {};
    }

    if (fakeCache[key]) {
        return;
    }

    fakeCache[key] = true;
    return new Promise(res => {
        setTimeout(res, Math.random() * 800);
    });
}