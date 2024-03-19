import { Unstable_Grid2 as Grid, Container } from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import PropTypes from 'prop-types';

import { CountryCard } from '../../../modules/'


const Countries = () => {
  const [mapInfo, , , , theme] = useOutletContext()
  console.log(mapInfo.countries)

  return (
    <Container>
      <div className='contentSubHead'>
        <h3 className=''>Countries</h3>
      </div>
      <div className='contentSubBody'>
        <Grid container spacing={2}>
          {mapInfo.countries.map((entry, index) => (
            <Grid xs={3} key={index} id={entry._id}>
              <CountryCard country={entry} theme={theme} />
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  )
}

export default Countries

Countries.prpTypes = {
  mapInfo: PropTypes.shape({
    countries: PropTypes.array
  }),
  theme: PropTypes.shape({
    palette: PropTypes.shape({
      mode: PropTypes.string,
      primary: PropTypes.shape({
        dark: PropTypes.string
      }),
      text: PropTypes.shape({
        primary: PropTypes.string
      })
    })
  }).isRequired

}