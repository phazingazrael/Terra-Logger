const getDataFromLocalStorage = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

// Combine data from local storage
const countries = getDataFromLocalStorage('Countries');
const cities = getDataFromLocalStorage('Cities');
const religions = getDataFromLocalStorage('Religions');

const entriesData = [...countries, ...cities, ...religions];

// Utility function to format entry names and types
const formatEntryName = (entryName) => {
    // Formatting logic here
    // Replace camelCase with space-separated words
    return entryName.replace(/([a-z])([A-Z])/g, '$1 $2');
};

// Utility function to find an entry by _id
export const getEntryById = (entryId) => {
    const foundEntry = entriesData.find((entry) => entry._id === entryId);
    return foundEntry ? { ...foundEntry, Name: formatEntryName(foundEntry.Name), Type: formatEntryName(foundEntry.Type) } : null;
};

// Utility function to find an entry by name
export const getEntryByName = (entryName) => {
    const formattedEntryName = formatEntryName(entryName);
    const foundEntry = entriesData.find((entry) => formatEntryName(entry.Name) === formattedEntryName);
    return foundEntry ? { ...foundEntry, Name: formatEntryName(foundEntry.Name), Type: formatEntryName(foundEntry.Type) } : null;
};

// Utility function to get all entries
export const getAllEntries = () => {
    return entriesData.map((entry) => ({ ...entry, Name: formatEntryName(entry.Name), Type: formatEntryName(entry.Type) }));
};

// Utility function to get default entries (you can customize the condition for default entries)
export const getDefaultEntries = () => {
    return entriesData
        .filter((entry) => entry.Type === 'Default')
        .map((entry) => ({ ...entry, Name: formatEntryName(entry.Name), Type: formatEntryName(entry.Type) }));
};

// Utility function to get entries by type
export const getEntriesByType = (type) => {
    const formattedType = formatEntryName(type);
    return entriesData
        .filter((entry) => formatEntryName(entry.Type) === formattedType)
        .map((entry) => ({ ...entry, Name: formatEntryName(entry.Name), Type: formatEntryName(entry.Type) }));
};

// Utility function to get a list of all available entry types
export const getAllEntryTypes = () => {
    const uniqueTypes = [...new Set(entriesData.map((entry) => formatEntryName(entry.Type)))];
    return uniqueTypes.map((type) => ({ Type: type }));
};
