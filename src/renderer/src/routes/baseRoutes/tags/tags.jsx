import { useEffect, useState } from 'react';
import { Unstable_Grid2 as Grid, Button, Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';


import { getAllTags } from '../../../modules/';

import './tags.css';


const filterObjectsByTag = (tagId, ...arrays) => {
    // Use flatMap to combine all arrays into a single array of objects
    return arrays
        .flatMap(array => array)
        // Use filter to keep objects that have the specified tagId in their tags array
        .filter(object => object.tags && object.tags.some(tag => tag._id === tagId));
}


const Tags = () => {
    const [tagsList, setTagsList] = useState();
    // Function to filter objects based on a specific tag _id

    useEffect(() => {
        setTagsList(getAllTags);
    }, []);

    return (
        <>
            <h3>All Tags</h3>
            <Grid container spacing={2}>
                {tagsList ?
                    tagsList.sort((a, b) => a.Name.localeCompare(b.Name)).map((Tag, index) => (
                        <TagType tagType={Tag} key={index} />
                    ))
                    : ""}
            </Grid>
        </>
    );
}

const TagType = (props) => {
    const tagType = props.tagType;
    const Tags = tagType.Tags;
    const [mapInfo, , , ,] = useOutletContext();

    return (
        Tags.some((tag) => filterObjectsByTag(tag._id, mapInfo.countries, mapInfo.cities, mapInfo.religions, mapInfo.cultures).length !== 0) ?
            (
                <Grid xs={4}>
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography variant='h6'>{tagType.Name} <span>{tagType.Count + " Items"}</span></Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {Tags.sort((a, b) => a.Name.localeCompare(b.Name)).map((Tag, index) => (
                                    filterObjectsByTag(Tag._id, mapInfo.countries, mapInfo.cities, mapInfo.religions, mapInfo.cultures).length !== 0 ?
                                        (<TagItem data={Tag} key={index} />) : ""
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            ) : ""
    );
}

TagType.propTypes = {
    tagType: PropTypes.shape({
        _id: PropTypes.string,
        Count: PropTypes.number,
        Name: PropTypes.string,
        Tags: PropTypes.array,
        Type: PropTypes.string
    })
}

const TagItem = (props) => {
    const { _id, Default, Name } = props.data;
    const [mapInfo, , , ,] = useOutletContext();
    return (
        <Grid xs={12}>
            <span>{Name}</span>
            <div className="tag-info">
                <span className="tag-posts">
                    {filterObjectsByTag(_id, mapInfo.countries, mapInfo.cities, mapInfo.religions, mapInfo.cultures).length + " Items"}
                    <br />
                    {"Default: " + Default}
                </span>
                <Button variant="contained" className="tag-button">
                    View Posts
                </Button>
            </div>
        </Grid>
    )
}

TagItem.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string,
        Default: PropTypes.bool,
        Name: PropTypes.string,
        Type: PropTypes.string,
        Description: PropTypes.string
    }),
}

export default Tags;