import { Button, Card, CardActions, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import LinesEllipsis from 'react-lines-ellipsis';

function CountryCard(props: Readonly<Country>) {
  const country = props;
  const ImageAlt = country.name + ' CoA' || 'Country Emblem';
  return (
    <Card>
      <CardMedia
        // sx={{ backgroundColor: rgbToRgba("#f5f5f5", 0.5)}}
        title={ImageAlt}
      >
        <LazyLoadedSVG coa={country.coa} />
      </CardMedia>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {country.name}
        </Typography>
        <LinesEllipsis
          text={country.description}
          maxLine="2"
          ellipsis="..."
          trimRight
          basedOn="letters"
          id={'country.id-' + country._id}
          className="description"
          component="p"
        />
      </CardContent>
      <CardActions className="tile-info">
        <div className="tile-category">
          Tags:
          <br />
          {country.tags.map((tag, index) => (
            <Chip size="small" key={index} label={tag.Name} />
          ))}
        </div>
        <Link to={'/view_country/' + country._id}>
          <Button className="tile-button" color="secondary" variant="contained">
            View
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}

export default CountryCard;