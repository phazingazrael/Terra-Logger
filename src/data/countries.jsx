import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getCountries(query) {
    fakeNetwork(`getCountries:${query}`);
    let countries = localStorage.getItem("countries");
    if (!countries) countries = [];
    if (query) {
        countries = matchSorter(countries, query, { keys: ["first", "last"] });
    }
    return countries;
}

export async function getCountry(_id) {
    fakeNetwork(`country:${_id}`);
    let Countries = JSON.parse(localStorage.getItem("countries"));
    let Country = Countries.find(country => country._id === _id);
    return Country ?? null;
}

export async function updateCountry(_id, updates) {
    fakeNetwork();
    let countries = localStorage.getItem("countries");
    let country = countries.find(country => country._id === _id);
    if (!country) throw new Error("No country found for", _id);
    Object.assign(country, updates);
    set(countries);
    return country;
}

export async function deleteContact(_id) {
    let map = localStorage.getItem("mapParsed");
    let countries = map.Locations.countries;
    let index = countries.findIndex(country => country._id === _id);
    if (index > -1) {
        countries.splice(index, 1);
        set(countries);
        return true;
    }
    return false;
}

function set(countries) {
    return localStorage.setItem("countries", countries);
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