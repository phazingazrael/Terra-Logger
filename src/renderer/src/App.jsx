import React, { useState, useLayoutEffect, useEffect } from 'react'
import './App.css'
import Package from '../../../package.json'
import { MainNav } from './modules'
import { PropTypes } from 'prop-types'

import {
  Cities,
  Countries,
  Entries,
  Error as ErrorPage,
  Overview,
  Religions,
  Root,
  Settings,
  Tags
} from './routes/baseRoutes/'

import { ViewCity, ViewCountry } from './routes/advRoutes'

import { Paper, Grid, AppBar, Container } from '@mui/material/'
import { createTheme, ThemeProvider, styled } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'

const lightMode = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8309ac'
    },
    secondary: {
      main: '#21d4e6'
    },
    background: {
      default: '#fff5da'
    }
  }
})

const darkMode = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8309ac'
    },
    secondary: {
      main: '#21d4e6'
    }
  },
  props: {
    MuiAppBar: {
      color: 'secondary'
    }
  }
})

const router = createBrowserRouter([
  { basename: '/' },
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <Root />,
        errorElement: <ErrorPage />
      },
      {
        path: 'overview',
        element: <Overview />,
        errorElement: <ErrorPage />
      },
      {
        path: 'cities',
        element: <Cities />,
        errorElement: <ErrorPage />
      },
      {
        path: 'countries',
        element: <Countries />,
        errorElement: <ErrorPage />
      },
      {
        path: 'entries',
        element: <Entries />,
        errorElement: <ErrorPage />
      },
      {
        path: 'religions',
        element: <Religions />,
        errorElement: <ErrorPage />
      },
      {
        path: 'tags',
        element: <Tags />,
        errorElement: <ErrorPage />
      },
      {
        path: 'settings',
        element: <Settings {...Package} />,
        errorElement: <ErrorPage />
      },
      {
        path: 'view_city',
        element: <ViewCity />,
        errorElement: <ErrorPage />
      },
      {
        path: 'view_country/:_id',
        element: <ViewCountry />,
        errorElement: <ErrorPage />
      },
      {
        path: 'view_country',
        element: <ViewCountry />,
        errorElement: <ErrorPage />
      }
    ]
  }
])

function App() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [loadingDetails, setLoadingDetails] = useState('Loading...')
  const [darkTheme, setDarkTheme] = useState(false)

  const [mapInfo, setMapInfo] = useState({
    cities: [],
    countries: [],
    cultures: [],
    info: {},
    nameBases: [],
    notes: [],
    npcs: [],
    religions: [],
    settings: {},
    SVG: '',
    svgMod: ''
  })
  const [appInfo, setAppInfo] = useState({
    id: Package.version,
    application: {
      name: Package.name,
      version: Package.version,
      afmgVer: '1.95.05',
      supportedLanguages: ['en'],
      defaultLanguage: 'en',
      onboarding: true
    },
    userSettings: {
      theme: 'light',
      language: 'en',
      showWelcomeMessage: true,
      fontSize: 'medium',
      exportOption: '',
      screen: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio
      }
    },
    mapInfo: {
      name: '',
      seed: ''
    },
    tags: []
  })

  const Wrapper = ({ children }) => {
    const location = useLocation()
    useLayoutEffect(() => {
      document.getElementById('Content').scrollTo(0, 0)
    }, [location.pathname])
    return children
  }

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'rgba(193, 197, 195, 0.6)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    overflow: 'auto'
  }))

  const toggleDarkMode = () => {
    setDarkTheme(!darkTheme)
  }

  // Load application data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from the Application route
        const applicationResponse = await fetch('http://localhost:3000/api/application')
        const applicationData = await applicationResponse.json()

        if (!applicationData || applicationData.length === 0) {
          // If data is empty or undefined, make a POST request
          // eslint-disable-next-line no-unused-vars
          const postResponse = await fetch('http://localhost:3000/api/application', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(appInfo)
          })

          // Fetch the updated data after posting
          const updatedApplicationResponse = await fetch('http://localhost:3000/api/application')
          const updatedApplicationData = await updatedApplicationResponse.json()

          // Set the state with the updated data
          setAppInfo(updatedApplicationData[0])
        } else {
          // If data exists, set the state with the fetched data

          setAppInfo(applicationData[0])
        }
      } catch (error) {
        console.error('Error fetching or updating data:', error)
      }
      const rootElement = document.getElementById('root')

      // Check if darkTheme is active in db
      if (appInfo) {
        if (appInfo.userSettings.theme !== 'light') {
          // Add class "dark" to the root element
          rootElement.classList.add('dark')
        } else {
          // Remove class "dark" from the root element
          rootElement.classList.remove('dark')
        }
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const rootElement = document.getElementById('root')

    // Check if darkTheme is true
    if (darkTheme) {
      // Add class "dark" to the root element
      rootElement.classList.add('dark')
    } else {
      // Remove class "dark" from the root element
      rootElement.classList.remove('dark')
    }
  }, [darkTheme])

  let map = {
    cities: [],
    countries: [],
    cultures: [],
    info: {},
    nameBases: [],
    notes: [],
    npcs: [],
    religions: [],
    settings: {},
    SVG: '',
    svgMod: ''
  }

  // Load everything else.
  useEffect(() => {
    // Array of API calls, each with a key and endpoint
    const apiCalls = [
      { key: 'cities', title: 'Cities', endpoint: 'http://localhost:3000/api/cities' },
      { key: 'countries', title: 'Countries', endpoint: 'http://localhost:3000/api/countries' },
      { key: 'cultures', title: 'Cultures', endpoint: 'http://localhost:3000/api/cultures' },
      { key: 'info', title: 'Map Info', endpoint: 'http://localhost:3000/api/info' },
      { key: 'nameBases', title: 'Name Bases', endpoint: 'http://localhost:3000/api/namebases' },
      { key: 'notes', title: 'Notes', endpoint: 'http://localhost:3000/api/notes' },
      { key: 'npcs', title: "NPC's", endpoint: 'http://localhost:3000/api/npc' },
      { key: 'religions', title: 'Religions', endpoint: 'http://localhost:3000/api/religions' },
      { key: 'settings', title: 'Settings', endpoint: 'http://localhost:3000/api/settings' },
      { key: 'SVG', title: 'SVG', endpoint: 'http://localhost:3000/api/SVG' },
      { key: 'svgMod', title: 'SVG', endpoint: 'http://localhost:3000/api/svgMod' }
    ]

    // Total number of API calls
    const totalApiCalls = apiCalls.length
    // Number of completed API calls
    let completedApiCalls = 0

    // Function to handle each API call
    const handleApiCall = async ({ key, title, endpoint }) => {
      try {
        // Introduce a delay of 1 second (1000 milliseconds) between API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Fetch data from the API endpoint
        const response = await fetch(endpoint)
        const responseData = await response.json()

        // Process the response based on the key
        switch (key) {
          case 'cities':
            map.cities = responseData
            break
          case 'countries':
            map.countries = responseData
            break
          case 'cultures':
            map.cultures = responseData
            break
          case 'info':
            map.info = responseData[0]
            break
          case 'nameBases':
            map.nameBases = responseData
            break
          case 'notes':
            map.notes = responseData
            break
          case 'npcs':
            map.npcs = responseData
            break
          case 'religions':
            map.religions = responseData
            break
          case 'settings':
            if (typeof responseData === 'object' && Object.keys(responseData).length > 0) {
              map.settings = responseData[0].info
            }
            break
          case 'SVG':
            if (typeof responseData === 'string' && responseData.length > 0) {
              map.SVG = responseData[0].svg
            }
            break
          case 'svgMod':
            if (typeof responseData === 'string' && responseData.length > 0) {
              map.svgMod = responseData[0].svg
            }
            break
          default:
            break
        }
        // Update progress after each API call
        completedApiCalls++
        const newProgress = Math.floor((completedApiCalls / totalApiCalls) * 100)
        setProgress(newProgress)

        // Update loading details
        setLoadingDetails(`Loading ${completedApiCalls}/${totalApiCalls}: ${title}`)

        // If all API calls are completed, set loading to false
        if (completedApiCalls === totalApiCalls) {
          setLoading(false)
          setLoadingDetails('Loading completed')
          setMapInfo(map)
          if (map.svgMod !== null) {
            // Replace SVG in body of document //
            let svg = document.getElementById('map')
            if (!svg) {
              document.body.insertAdjacentHTML('afterbegin', map.svgMod)
            }
          }
        }
      } catch (error) {
        console.error('Error in API call:', error)
      }
    }

    // Sequentially start the API calls
    const sequentialApiCalls = async () => {
      for (const apiCall of apiCalls) {
        await handleApiCall(apiCall)
      }
    }

    sequentialApiCalls()
  }, [])

  return (
    <ThemeProvider theme={darkTheme ? darkMode : lightMode}>
      <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
      <CssBaseline />
      <div className="App">
        {loading ? (
          <div className="loadingScreen">
            <div className="loadingBox">
              <p>{loadingDetails}</p>
              <progress value={progress} max="100" />
            </div>
          </div>
        ) : (
          <div>
            <AppBar position="static">
              <h1>Terra-Logger. Azgaar&apos;s Fantasy Map Generator to structured Markdown.</h1>
            </AppBar>
            <Container maxWidth="xl" className="pageBody">
              <Grid container spacing={2}>
                <Grid item lg={3} md={2} xs={2}>
                  <Item className="Navigation">
                    <MainNav
                      setMap={setMapInfo}
                      app={appInfo}
                      setApp={setAppInfo}
                      theme={darkTheme ? darkMode : lightMode}
                    />
                  </Item>
                </Grid>
                <Grid item lg={9} md={10} xs={10}>
                  <Item className="Content" id="Content">
                    <Wrapper>
                      <div className="contentBody">
                        <Outlet
                          context={[
                            mapInfo,
                            setMapInfo,
                            appInfo,
                            setAppInfo,
                            darkTheme ? darkMode : lightMode
                          ]}
                        />
                      </div>
                    </Wrapper>
                  </Item>
                </Grid>
              </Grid>
            </Container>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}

App.propTypes = {
  theme: PropTypes.shape({
    palette: PropTypes.shape({
      mode: PropTypes.string,
      primary: PropTypes.shape({
        dark: PropTypes.string,
        light: PropTypes.string
      }),
      text: PropTypes.shape({
        primary: PropTypes.string,
        secondary: PropTypes.string,
        disabled: PropTypes.string
      })
    })
  })
}

function RouteOut() {
  return <RouterProvider router={router} />
}

export default RouteOut
