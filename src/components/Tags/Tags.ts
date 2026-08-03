import defaultTags from "./tags.json";

interface TagData {
	_id: string;
	Name: string;
	Tags: TagItem[];
	Type: string;
}

interface TagItem {
	_id: string;
	Default: boolean;
	Description: string;
	Name: string;
	Type: string;
}

const tagsData: TagData[] = defaultTags;

// Utility function to format tag names and types
const formatTagName = (tagName: string) => {
	if (typeof tagName !== "string") {
		// If tagName is not a string, return it as is
		return tagName;
	}
	// formatting logic here
	// replace camelCase with space-separated words
	return tagName.replace(/([a-z])([A-Z])/g, "$1 $2");
};

// Utility function to get all tags
export const getAllTags = () => {
	return tagsData.map((tag) => ({ ...tag, Name: formatTagName(tag.Name) }));
};
