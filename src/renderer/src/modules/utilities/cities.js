let citiesData = JSON.parse(localStorage.getItem("cities"));

// Utility function to format city names
const formatCityName = (cityName) => {

    // Replace camelCase with space-separated words
    return cityName.replace(/([a-z])([A-Z])/g, '$1 $2');
};

// Utility function to get a city by _id
export const getCityById = (cityId) => {
    const foundCity = citiesData.find((city) => city._id === cityId);
    return foundCity ? { ...foundCity, name: formatCityName(foundCity.name) } : null;
};

// Utility function to get all cities
export const getAllCities = () => {
    return citiesData.map((city) => ({ ...city, name: formatCityName(city.name) }));
};

// Utility function to get cities by type
export const getCitiesByType = (type) => {
    const formattedType = formatCityName(type);
    return citiesData
        .filter((city) => formatCityName(city.type) === formattedType)
        .map((city) => ({ ...city, name: formatCityName(city.name) }));
};

// Utility function to get cities by country
export const getCitiesByCountry = (countryName) => {
    const formattedCountryName = formatCityName(countryName);
    return citiesData
        .filter((city) => formatCityName(city.country.name) === formattedCountryName)
        .map((city) => ({ ...city, name: formatCityName(city.name) }));
};

// Utility function to get a list of all available city tags
export const getAllCityTags = () => {
    const allTags = citiesData.reduce((tags, city) => {
        return tags.concat(city.tags.map((tag) => tag.Name));
    }, []);

    // Remove duplicates and format the tag names
    return [...new Set(allTags)].map((tagName) => formatCityName(tagName));
};

// Utility function to get a list of all available city types
export const getAllCityTypes = () => {
    const allTypes = citiesData.map((city) => formatCityName(city.type));

    // Remove duplicates
    return [...new Set(allTypes)];
};

export const getCitiesByTags = (tags) => {
    const formattedTags = tags.map((tag) => formatCityName(tag));

    return citiesData
        .filter((city) => {
            const cityTags = city.tags.map((tag) => formatCityName(tag.Name));
            return formattedTags.every((tag) => cityTags.includes(tag));
        })
        .map((city) => ({ ...city, name: formatCityName(city.name) }));
};


// Example 1: Get a city by _id
// const cityById = Cities.getCityById("cPTOS9YvWBfS2kh08wgpi");
// console.log("City by _id:", cityById);

// Example 2: Get all cities
// const allCities = Cities.getAllCities();
// console.log("All cities:", allCities);

// Example 3: Get cities by type
// const citiesByType = Cities.getCitiesByType("City - Large Town");
// console.log("Cities by type:", citiesByType);

// Example 4: Get cities by country
// const citiesByCountry = Cities.getCitiesByCountry("Chavian Divine Principality");
// console.log("Cities by country:", citiesByCountry);

// Example 5: Get all available city tags
// const allCityTags = Cities.getAllCityTags();
// console.log("All city tags:", allCityTags);

// Example 6: Get all available city types
// const allCityTypes = Cities.getAllCityTypes();
// console.log("All city types:", allCityTypes);

// Example 7: Get cities by tags
// const citiesByTags = Cities.getCitiesByTags(["City", "Temple"]);
// console.log("Cities by tags:", citiesByTags);
