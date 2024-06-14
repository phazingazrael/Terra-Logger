import { Button, Card, CardActions, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import LinesEllipsis from 'react-lines-ellipsis';
import { Link, useOutletContext } from 'react-router-dom';

import { LazyLoadedSVG, rgbToRgba } from '../../';

import '../cards.css';

function CityCard(props: Readonly<TLCity>) {
  const city = props;
  const theme: any = useOutletContext();

  let themeColor = null;

  if (theme.palette.mode === 'dark') {
    themeColor = theme.palette.primary.dark;
  } else if (theme.palette.mode === 'light') {
    themeColor = theme.palette.primary.light;
  }

  const ImageAlt = '';
  return (
    <Card>
      <CardMedia
        sx={{ backgroundColor: theme ? rgbToRgba(themeColor as string, 0.5 as number) : '' }}
        title={ImageAlt}
      >
        <LazyLoadedSVG {...(city.coa as TLCoA)} />
      </CardMedia>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {city.name}
        </Typography>
        <LinesEllipsis
          text={city.description}
          maxLine="2"
          ellipsis="..."
          trimRight
          basedOn="letters"
          id={'city.id-' + city._id}
          className="description"
          component="p"
        />
      </CardContent>
      <CardActions className="tile-info">
        <div className="tile-category">
          Tags:
          <br />
          {city.tags.map((tag) => (
            <Chip size="small" key={city._id} label={tag.Name} />
          ))}
        </div>
        <Link to={'/view_city/' + city._id}>
          <Button className="tile-button" color="secondary" variant="contained">
            View
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}

CityCard.propTypes = {
  city: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    coa: PropTypes.object,
    description: PropTypes.string,
    tags: PropTypes.array,
  }),
  theme: PropTypes.shape({
    palette: PropTypes.shape({
      mode: PropTypes.string,
      primary: PropTypes.shape({
        dark: PropTypes.string,
        light: PropTypes.string,
      }),
      text: PropTypes.shape({
        primary: PropTypes.string,
      }),
    }),
  }),
};
export default CityCard;
