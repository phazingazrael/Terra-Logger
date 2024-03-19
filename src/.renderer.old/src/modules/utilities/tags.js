import defaultTags from './tags.json';

const fetchTags = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/tags');
        const tags = await response.json();
        return tags || [];
    } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
    }
};

const loadTagsData = async () => {
    const fetchedTags = await fetchTags();
    return fetchedTags.length > 0 ? fetchedTags : defaultTags;
};

let tagsData = [];
loadTagsData().then(data => {
    tagsData = data;
});

// Utility function to format tag names and types
const formatTagName = (tagName) => {
    if (typeof tagName !== 'string') {
        // If tagName is not a string, return it as is
        return tagName;
    }
    // formatting logic here
    // replace camelCase with space-separated words
    return tagName.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// Utility function to find a tag by _id
export const getTagById = (tagId) => {
    const foundTag = tagsData.find((tag) => tag._id === tagId)
    return foundTag ? { ...foundTag, Name: formatTagName(foundTag.Name), Type: formatTagName(foundTag.Type) } : null
}

// Utility function to find a tag by name
export const getTagByName = (tagName) => {
    const formattedTagName = formatTagName(tagName)
    const foundTag = tagsData.find((tag) => formatTagName(tag.Name) === formattedTagName)
    return foundTag ? { ...foundTag, Name: formatTagName(foundTag.Name), Type: formatTagName(foundTag.Type) } : null
}

// Utility function to get all tags
export const getAllTags = () => {
    return tagsData.map((tag) => ({ ...tag, Name: formatTagName(tag.Name) }))
}

// Utility function to get default tags (you can customize the condition for default tags)
export const getDefaultTags = () => {
    return tagsData
        .filter((tag) => tag.Type === 'Default')
        .map((tag) => ({ ...tag, Name: formatTagName(tag.Name), Type: formatTagName(tag.Type) }))
}

// Utility function to get tags by type
export const getTagsByType = (type) => {
    const formattedType = formatTagName(type)
    return tagsData
        .filter((tag) => formatTagName(tag.Type) === formattedType)
        .map((tag) => ({ ...tag, Name: formatTagName(tag.Name), Type: formatTagName(tag.Type) }))
}

// Utility function to get a list of all available tag types
export const getAllTagTypes = () => {
    // Extract all tag types from the JSON data
    const tagTypes = tagsData.flatMap(tag => tag.Type);

    // Remove duplicates by converting to Set and back to an array
    const uniqueTypes = [...new Set(tagTypes)];

    // Log and return the unique tag types
    //console.log(JSON.stringify(uniqueTypes));
    return uniqueTypes.map(type => ({ Type: type, Name: formatTagName(type) }));
}

