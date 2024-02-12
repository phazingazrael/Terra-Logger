import { Unstable_Grid2 as Grid, Button, Chip } from '@mui/material'
import { useOutletContext } from 'react-router-dom'


const Page = () => {
  const [mapInfo, setMapInfo, appInfo] = useOutletContext()

  return (

    <Container>
      <div className='contentSubHead'>
        <h3 className=''>NAME</h3>
      </div>
      <div className='contentSubBody'>

      </div>
    </Container>
  )
}

export default Page
