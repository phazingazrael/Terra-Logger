import { Unstable_Grid2 as Grid, Button } from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import LinesEllipsis from 'react-lines-ellipsis'

import '../../assets/css/miscStyles.css'
import Place from '../../assets/placeholder.svg'

const Entries = () => {
  const [mapData, setMap] = useOutletContext()
  console.log(mapData)

  const entries = [...mapData.countries, ...mapData.cities, ...mapData.religions]
  const ImageAlt = ''
  return (
    <>
      <h3 className='text-2xl font-semibold'>All Entries</h3>
      <Grid container spacing={2}>
        {entries.map((entry, index) => (
          <Grid xs={3} key={index} id={entry._id}>
            <div className='post' data-id='21'>
              <div className='post-image'>
                <img src={Place} alt={ImageAlt} data-id='22' />
              </div>
              <div className='post-content' data-id='23'>
                <h2 className='post-title' data-id='24'>
                  {entry.name}
                </h2>
                <LinesEllipsis
                  text={entry.description}
                  maxLine='3'
                  ellipsis='...'
                  trimRight
                  basedOn='letters'
                  id={'entry.id-' + entry._id}
                  className='post-text'
                />
                <div className='post-info' data-id='26'>
                  <span className='post-category' data-id='27'>
                    Category:
                                        <br />
                    Category 1
                                    </span>
                  <Button variant='contained' className='post-button' data-id='28'>
                    Read More
                                    </Button>
                </div>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default Entries
