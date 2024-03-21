import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Unstable_Grid2 as Grid,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

import { getAllTags } from '../components/Tags/Tags';

interface TagData {
  _id: string;
  Count: number;
  Name: string;
  Tags: TagItems[];
  Type: string;
}

interface TagItems {
  _id: string;
  Default: boolean;
  Description: string;
  Name: string;
  Type: string;
}

const tagsData: TagData[] = getAllTags();

const filterObjectsByTag = (
  tagId: string,
  ...arrays: Array<(object & { tags?: TagItems[] })[]>
): (object & { tags?: TagItems[] })[] => {
  return arrays
    .flatMap((array) => array)
    .filter(
      (object: object & { tags?: TagItems[] }) =>
        Array.isArray(object.tags) && object.tags.some((tag) => tag._id === tagId)
    );
};

const sortTagsList = (tagsList: TagItems[]) => {
  return tagsList.sort((a, b) => a.Name.localeCompare(b.Name));
};
const sortTagTypes = (tagsList: TagData[]) => {
  return tagsList.sort((a, b) => a.Name.localeCompare(b.Name));
};

const Tags = () => {
  const [tagsList, setTagsList] = useState<TagData[] | undefined>();
  // Function to filter objects based on a specific tag _id
  useEffect(() => {
    setTagsList(tagsData);
  }, []);

  return (
    <>
      <h3>All Tags</h3>
      <Grid container spacing={2}>
        {tagsList ? sortTagTypes(tagsList).map((Tag) => <TagType {...Tag} key={Tag._id} />) : ''}
      </Grid>
    </>
  );
};

const TagType = (props: TagData) => {
  const { _id, Name, Type, Count, Tags } = props;

  return Tags.some((tag) => filterObjectsByTag(tag._id).length !== 0) ? (
    <Grid xs={4} className={Type} id={_id}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h6">
            {Name} <span>{Count + ' Items'}</span>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {sortTagsList(Tags).map((Tag) =>
              filterObjectsByTag(Tag._id).length !== 0 ? <TagItem {...Tag} key={Tag._id} /> : ''
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  ) : (
    ''
  );
};

const TagItem = (props: TagItems) => {
  const { _id, Default, Description, Name, Type } = props;
  return (
    <Grid xs={12}>
      <span>{Name}</span>
      <div className="tag-info">
        <span className="tag-posts">
          {filterObjectsByTag(_id).length + ' Items'}
          <br />
          {'Default: ' + Default}
          <br />
          {'Description: ' + Description}
          <br />
          {'Type: ' + Type}
        </span>
        <Button variant="contained" className="tag-button">
          View Posts
        </Button>
      </div>
    </Grid>
  );
};

export default Tags;
