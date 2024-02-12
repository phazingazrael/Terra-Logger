import defaultTags from './tags.json'
const tags = await fetch('http://localhost:3000/api/tags')

console.log('default tags:')

let tagsData = []
tags
    ? (
        tagsData = [...defaultTags]
    )
    : (
        tagsData = [...defaultTags, ...tags]
    )

// Utility function to format tag names and types
const formatTagName = (tagName) => {
    // formatting logic here
    // replace camelCase with space-separated words
    return tagName.replace(/([a-z])([A-Z])/g, '$1 $2')
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
    return tagsData.map((tag) => ({ ...tag, Name: formatTagName(tag.Name), Type: formatTagName(tag.Type) }))
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
    const uniqueTypes = [...new Set(tagsData.map((tag) => formatTagName(tag.Type)))]
    return uniqueTypes.map((type) => ({ Type: type }))
}
