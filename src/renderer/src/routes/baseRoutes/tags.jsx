import { Unstable_Grid2 as Grid, Button } from '@mui/material';
import LinesEllipsis from 'react-lines-ellipsis'


// Your React component or other file

import {
    getTagById,
    getTagByName,
    getAllTags,
    getDefaultTags,
    getTagsByType,
    getAllTagTypes
} from '../../modules/utilities/tags';

import '../../assets/css/miscStyles.css';

const Tags = () => {

    /*     // Example usage
        //const tagId = 'eIBl7agFZ8OszsjN5t8xD';
        //const tagById = getTagById(tagId);
    
        //if (tagById) {
        //    console.log('Found tag by _id:', tagById);
        //} else {
        //    console.log('Tag not found');
        //}
    
        //const tagName = 'WorldOverview';
        //const tagByName = getTagByName(tagName);
    
        //if (tagByName) {
        //    console.log('Found tag by name:', tagByName);
        //} else {
        //    console.log('Tag not found');
        //}
    
        //const allTags = getAllTags();
        //console.log('All tags:', allTags);
    
        //const defaultTags = getDefaultTags();
        //console.log('Default tags:', defaultTags);
    
        //const tagType = 'WorldOverview';
        //const tagsByType = getTagsByType(tagType);
        //console.log(`Tags with type '${tagType}':`, tagsByType);
    
        //const allTagTypes = getAllTagTypes();
        //console.log('All tag types:', allTagTypes); */

    const tagsList = getAllTags();
    return (
        <>
            <h3 className="text-2xl font-semibold">All Tags</h3>
            <Grid container spacing={2}>
                {tagsList.map((Tag, index) => (
                    <Grid key={index} xs={3}>
                        <div className="tag-container">
                            <div className="tag-content">
                                <h2 className="tag-name">{Tag.Name}</h2>
                                <LinesEllipsis
                                    text={Tag.Description}
                                    maxLine='2'
                                    ellipsis='...'
                                    trimRight
                                    basedOn='letters'
                                    id={'tag.id-' + Tag._id}
                                    className='tag-description'
                                />
                                <div className="tag-info">
                                    <span className="tag-posts">Number of Posts</span>
                                    <Button variant="contained" className="tag-button">
                                        View Posts
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Grid>
                ))}
            </Grid>
        </>
    );
}

export default Tags;