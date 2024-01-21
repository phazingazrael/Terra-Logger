export const Api = {
    // Get all items from a specific collection with an optional limit
    getAll: (collectionName, limit = dataArray.length) => {
        const storedData = localStorage.getItem(collectionName);
        const dataArray = storedData ? JSON.parse(storedData) : [];
        return dataArray.slice(0, limit);
    },

    // Get items from a specific collection based on page and limit
    getByPage: (collectionName, page = 1, pageSize = 10) => {
        const storedData = localStorage.getItem(collectionName);
        const dataArray = storedData ? JSON.parse(storedData) : [];
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    },

    // Get an item by ID from a specific collection
    getById: (collectionName, itemId) => {
        const storedData = localStorage.getItem(collectionName);
        const dataArray = storedData ? JSON.parse(storedData) : [];
        return dataArray.find((item) => item.id === itemId);
    },

    // Get items by a specific property value from a specific collection
    getByProperty: (collectionName, propertyName, propertyValue, limit = dataArray.length) => {
        const storedData = localStorage.getItem(collectionName);
        const dataArray = storedData ? JSON.parse(storedData) : [];
        return dataArray.filter((item) => item[propertyName] === propertyValue).slice(0, limit);
    },

    // Update an item in a specific collection
    update: (collectionName, itemId, updatedData) => {
        const storedData = localStorage.getItem(collectionName);
        let dataArray = storedData ? JSON.parse(storedData) : [];

        const updatedIndex = dataArray.findIndex((item) => item.id === itemId);

        if (updatedIndex !== -1) {
            dataArray[updatedIndex] = { ...dataArray[updatedIndex], ...updatedData };
            localStorage.setItem(collectionName, JSON.stringify(dataArray));
            return true; // Update successful
        }

        return false; // Item not found
    },

    // Delete an item from a specific collection
    delete: (collectionName, itemId) => {
        const storedData = localStorage.getItem(collectionName);
        let dataArray = storedData ? JSON.parse(storedData) : [];

        const updatedArray = dataArray.filter((item) => item.id !== itemId);

        if (updatedArray.length !== dataArray.length) {
            localStorage.setItem(collectionName, JSON.stringify(updatedArray));
            return true; // Delete successful
        }

        return false; // Item not found
    },
};

// Example usage:

// Get all items from the 'yourDataKey' collection with a limit of 5
const limitedItems = dynamicApi.getAll('yourDataKey', 5);
console.log(limitedItems);

// Get items from the 'yourDataKey' collection for page 2 with a page size of 3
const pageItems = dynamicApi.getByPage('yourDataKey', 2, 3);
console.log(pageItems);

// Get an item by ID from the 'yourDataKey' collection
const itemId = 1;
const itemById = dynamicApi.getById('yourDataKey', itemId);
console.log(itemById);

// Get items by a specific property value from the 'yourDataKey' collection with a limit of 2
const propertyItems = dynamicApi.getByProperty('yourDataKey', 'category', 'example', 2);
console.log(propertyItems);

// Update an item in the 'yourDataKey' collection
const updateResult = dynamicApi.update('yourDataKey', 1, { updatedProperty: 'new value' });
console.log(updateResult); // true if successful, false if item not found

// Delete an item from the 'yourDataKey' collection
const deleteResult = dynamicApi.delete('yourDataKey', 1);
console.log(deleteResult); // true if successful, false if item not found
