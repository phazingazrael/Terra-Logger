import { Unstable_Grid2 as Grid, Container, Chip, Typography, Card, CardMedia, CardActions, CardContent, Button } from '@mui/material'
import { Link, useOutletContext } from 'react-router-dom'
import LinesEllipsis from 'react-lines-ellipsis'

import { LazyLoadedSVG } from '../../modules/LazyLoadedSVG'

import '../../assets/css/countries.css'

import '../../assets/css/shortTags.css'

const Countries = () => {
  const [mapInfo, setMapInfo, appInfo, theme] = useOutletContext()
  console.log(mapInfo)
  console.log(theme)

  let ImageAlt = ''

  function rgbToRgba(rgb, opacity) {
    // Parse the RGB values from the string
    const [r, g, b] = rgb.match(/\d+/g);

    // Return the RGBA color string with opacity
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return (
    <Container>
      <div className='contentSubHead'>
        <h3 className=''>Countries</h3>
      </div>
      <div className='contentSubBody'>
        <Grid container spacing={2}>
          {mapInfo.countries.map((entry, index) => (
            <Grid xs={3} key={index} id={entry._id}>
              <Card>
                <CardMedia
                  sx={{ backgroundColor: theme ? rgbToRgba(theme.palette.primary.light, 0.5) : "" }}
                  title={ImageAlt}
                >
                  <LazyLoadedSVG coa={entry.coa} />
                </CardMedia>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {entry.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <LinesEllipsis
                      text={entry.description}
                      maxLine='2'
                      ellipsis='...'
                      trimRight
                      basedOn='letters'
                      id={'entry.id-' + entry._id}
                      className='post-text'
                    />
                  </Typography>
                </CardContent>
                <CardActions className='country-tile-info'>
                  <div className='country-tile-category'>
                    Tags:
                    <br />
                    {entry.tags.map((tag, index) => (
                      <Chip size='small' key={index} label={tag.Name} />
                    ))}
                  </div>
                  <Link to={"/view_country/" + entry._id}>
                    <Button className="country-tile-button" color="secondary" variant="contained">View</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  )
}

export default Countries
