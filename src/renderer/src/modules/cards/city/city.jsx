import { Card, CardMedia, CardContent, Typography, CardActions, Chip, Button, Skeleton } from '@mui/material';
import PropTypes from 'prop-types';
import LinesEllipsis from 'react-lines-ellipsis';

import { LazyLoadedSVG, rgbToRgba } from '../..';


export const CityCard = (props) => {
    const { city, theme, loading } = props;
    const ImageAlt = "";
    return (
        <Card>
            {loading
                ? (
                    <Skeleton variant='rectangular' width='100%' height={200} />
                )
                : (
                    <>
                        <CardMedia
                            sx={{ backgroundColor: theme ? rgbToRgba(theme.palette.primary.light, 0.5) : "" }}
                            title={ImageAlt}
                        >
                            <LazyLoadedSVG coa={city.coa} />
                        </CardMedia>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {city.name}
                            </Typography>
                            <Typography color="text.secondary" component="div">
                                <LinesEllipsis
                                    text={city.description}
                                    maxLine='2'
                                    ellipsis='...'
                                    trimRight
                                    basedOn='letters'
                                    id={'city.id-' + city._id}
                                    className='description'
                                    component='p'
                                />
                            </Typography>
                        </CardContent>
                        <CardActions className='tile-info'>
                            <div className='tile-category'>
                                Tags:
                                <br />
                                {city.tags.map((tag, index) => (
                                    <Chip size='small' key={index} label={tag.Name} />
                                ))}
                            </div>
                            <Button className="tile-button" color="secondary" variant="contained">View</Button>
                        </CardActions>
                    </>
                )}
        </Card>
    );
}

CityCard.propTypes = {
    city: PropTypes.shape({
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
    }).isRequired,
    loading: PropTypes.bool.isRequired
}