import { Card, CardMedia, CardContent, Typography, CardActions, Chip, Button } from '@mui/material';
import PropTypes from 'prop-types';
import LinesEllipsis from 'react-lines-ellipsis';
import { Link } from 'react-router-dom';

import { LazyLoadedSVG, rgbToRgba } from '../..';

import '../cards.css';

export const CountryCard = (props) => {
    const { country, theme } = props;
    const ImageAlt = "";
    return (
        <Card>
            <CardMedia
                sx={{ backgroundColor: theme ? rgbToRgba(theme.palette.primary.light, 0.5) : "" }}
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
                    maxLine='2'
                    ellipsis='...'
                    trimRight
                    basedOn='letters'
                    id={'country.id-' + country._id}
                    className='description'
                    component='p'
                />
            </CardContent>
            <CardActions className='tile-info'>
                <div className='tile-category'>
                    Tags:
                    <br />
                    {country.tags.map((tag, index) => (
                        <Chip size='small' key={index} label={tag.Name} />
                    ))}
                </div>
                <Link to={"/view_country/" + country._id}>
                    <Button className="tile-button" color="secondary" variant="contained">View</Button>
                </Link>
            </CardActions>
        </Card>
    );
}

CountryCard.propTypes = {
    country: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        coa: PropTypes.object,
        description: PropTypes.string,
        tags: PropTypes.array
    }),
    theme: PropTypes.shape({
        palette: PropTypes.shape({
            mode: PropTypes.string,
            primary: PropTypes.shape({
                dark: PropTypes.string,
                light: PropTypes.string
            }),
            text: PropTypes.shape({
                primary: PropTypes.string
            })
        })
    }).isRequired
}