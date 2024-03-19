import { useState, useEffect } from 'react'
import { Unstable_Grid2 as Grid, LinearProgress, Alert, AlertTitle, Container } from '@mui/material'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { useOutletContext } from 'react-router-dom'

import { CityCard } from '../../../modules/cards/city/city'

const Cities = () => {
  const [mapInfo, , , , theme] = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [loadedCities, setLoadedCities] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentCityName, setCurrentCityName] = useState('')
  const [currentCount, setCurrentCount] = useState(0)
  const batchSize = 5 // Adjust the batch size as needed

  const allCities = mapInfo.cities;
  useEffect(() => {
    const loadData = async () => {
      try {
        const totalCities = allCities.length

        for (let i = 0; i < totalCities; i += batchSize) {
          const batchCities = allCities.slice(i, i + batchSize)

          // Process the city data and update state
          setLoadedCities((prevCities) => [...prevCities, ...batchCities])

          // Update loading progress, current city name, and current count
          const progress = Math.min(((i + batchSize) / totalCities) * 100, 100) // Ensure progress doesn't exceed 100%
          setLoadingProgress(progress)
          setCurrentCityName(batchCities[batchCities.length - 1].name) // Show the last city in the batch
          const currentCountValue = Math.min(i + batchSize, totalCities) // Ensure count doesn't exceed totalCities
          setCurrentCount(currentCountValue)

          // console.log(`Loaded ${currentCountValue} out of ${totalCities} cities`);

          // Simulate a delay for each batch
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
        // Finalize loading when both progress and count reach their maximum values

        setLoading(false)
        setCurrentCityName('') // Clear current city name
        setCurrentCount(totalCities) // Set count to the total number of cities
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [mapInfo.cities])


  return (
    <Container>
      <div className='contentSubHead'>
        <h3 className=''>Cities</h3>
        {loading && (
          <div>
            <Alert severity='success' variant='outlined' icon={<WarningAmberOutlinedIcon fontSize='inherit' />}>
              {currentCount === mapInfo.cities.length
                ? (
                  <p>
                    Finalizing loading of city data....
                  </p>
                )
                : (
                  <>
                    <AlertTitle>Loading City data takes a decent amount of time, Due to size of the data this must be loaded each time.</AlertTitle>
                    <p>
                      Loading City: {currentCityName} (City {currentCount} out of {mapInfo.cities.length})
                    </p>
                    <LinearProgress variant='determinate' value={loadingProgress} />
                  </>
                )}

            </Alert>
          </div>
        )}
      </div>
      <div className='contentSubBody'>
        <Grid container spacing={2}>
          {loadedCities.map((entry, index) => (
            <Grid xs={3} key={index} id={entry._id}>
              <CityCard city={entry} theme={theme} loading={loading} />
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  )
}

export default Cities
