import { useState, useLayoutEffect, useEffect } from "react"
import "./assets/css/App.css";
import Package from "../../../package.json"
import MainNav from "./modules/mainNav"

import {
  Root,
  Error as ErrorPage,
  Overview,
  Categories,
  Countries,
  Cities,
  Religions,
  Tags,
  Settings2 as Settings
} from "./routes/baseRoutes/"

//import CountryView, { loader as countryLoader } from './routes/countryView/countryView.jsx';
import { City, cityLoader } from "./routes/advRoutes/"


import ViewCity from "./routes/advRoutes/ViewCity";
import ViewCountry from "./routes/advRoutes/ViewCountry";
import { ViewCity, ViewCountry } from "./routes/advRoutes";

import { Paper, Grid, AppBar, Container } from "@mui/material/"
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation
} from "react-router-dom"


window.onmessage = (event) => {
  // event.source === window means the message is coming from the preload
  // script, as opposed to from an <iframe> or other source.
  if (event.source === window && event.data === "main-world-port") {
    const [port] = event.ports
    // Once we have the port, we can communicate directly with the main
    // process.
    port.onmessage = (event) => {
      console.log("from main process:", event.data)
      port.postMessage(event.data.test * 2)
    }
  }
}

const lightMode = createTheme(
  {
    palette: {
      mode: "light",
      primary: {
        main: "#8309ac",
      },
      secondary: {
        main: "#21d4e6",
      },
      background: {
        default: "#fff5da",
      },
    },
  }
);

const darkMode = createTheme(
  {
    palette: {
      mode: "dark",
      primary: {
        main: "#8309ac",
      },
      secondary: {
        main: "#21d4e6",
      },
    },
    props: {
      MuiAppBar: {
        color: "secondary",
      },
    },
  }
);

const router = createBrowserRouter([
  { basename: "/" },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Root />,
        errorElement: <ErrorPage />
      },
      {
        path: "overview",
        element: <Overview />,
        errorElement: <ErrorPage />
      },
      {
        path: "cities",
        element: <Cities />,
        errorElement: <ErrorPage />
      },
      {
        path: "countries",
        element: <Countries />,
        errorElement: <ErrorPage />
      },
      {
        path: "religions",
        element: <Religions />,
        errorElement: <ErrorPage />
      },
      {
        path: "categories",
        element: <Categories />,
        errorElement: <ErrorPage />
      },
      {
        path: "tags",
        element: <Tags />,
        errorElement: <ErrorPage />
      },
      {
        path: "settings",
        element: <Settings {...Package} />,
        errorElement: <ErrorPage />
      },
      {
        path: "view_city",
        element: <ViewCity />,
        errorElement: <ErrorPage />
      },
      {
        path: "view_country/:_id",
        element: <ViewCountry />,
        errorElement: <ErrorPage />
      },
      {
        path: "view_country",
        element: <ViewCountry />,
        errorElement: <ErrorPage />
      },
      /*  {
        loader: countryLoader,
        path: "countries/:_id/view",
        element: <CountryView />,
        errorElement: <ErrorPage />,
      },
      {
        loader: cityLoader,
        path: "cities/:_id",
        element: <CityView />,
        errorElement: <ErrorPage />,
      } */

    ]
  }
])




function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState("Loading...");
  const [darkTheme, setDarkTheme] = useState(false);


  const [mapInfo, setMapInfo] = useState()
  const [appInfo, setAppInfo] = useState({
    id: Package.version,
    application: {
      name: Package.name,
      version: Package.version,
      afmgVer: "1.95.05",
      supportedLanguages: ["en"],
      defaultLanguage: "en",
      onboarding: true
    },
    userSettings: {
      theme: "light",
      language: "en",
      showWelcomeMessage: true,
      fontSize: "medium",
      exportOption: "",
      screen: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      mapInfo: {
        name: "",
        seed: ""
      }
    },
    tags: []
  })


  const Wrapper = ({ children }) => {
    const location = useLocation()
    useLayoutEffect(() => {
      document.getElementById("Content").scrollTo(0, 0)
    }, [location.pathname])
    return children
  }

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "rgba(193, 197, 195, 0.6)",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    overflow: "auto"
  }))

  const toggleDarkMode = () => {
    setDarkTheme(!darkTheme);
  };


  // Load application data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from the Application route
        const applicationResponse = await fetch("http://localhost:3000/api/application");
        const applicationData = await applicationResponse.json();

        //console.log("Data from /application:", applicationData);

        if (!applicationData || applicationData.length === 0) {
          // If data is empty or undefined, make a POST request
          const postResponse = await fetch("http://localhost:3000/api/application", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(appInfo)
          });

          console.log("Saving Data...");



          // Fetch the updated data after posting
          const updatedApplicationResponse = await fetch("http://localhost:3000/api/application");
          const updatedApplicationData = await updatedApplicationResponse.json();

          // Set the state with the updated data
          setAppInfo(updatedApplicationData);
          console.log("Saving state...");
        } else {
          // If data exists, set the state with the fetched data

          setAppInfo(applicationData[0])

        }

        const rootElement = document.getElementById("root");

        // Check if darkTheme is active in db
        if (applicationData[0].userSettings.theme !== "light") {
          // Add class "dark" to the root element
          rootElement.classList.add("dark");
        } else {
          // Remove class "dark" from the root element
          rootElement.classList.remove("dark");
        }


      } catch (error) {
        console.error("Error fetching or updating data:", error);
      }
    };


    fetchData();
  }, []);

  useEffect(() => {
    const rootElement = document.getElementById("root");

    // Check if darkTheme is true
    if (darkTheme) {
      // Add class "dark" to the root element
      rootElement.classList.add("dark");
    } else {
      // Remove class "dark" from the root element
      rootElement.classList.remove("dark");
    }
  }, [darkTheme]);

  let map = {
    "cities": [],
    "countries": [],
    "cultures": [],
    "info": {},
    "nameBases": [],
    "notes": [],
    "religions": [],
    "settings": {},
    "SVG": "",
    "svgMod": ""
  }

  // Load everything else.
  useEffect(() => {
    // Array of API calls, each with a key and endpoint
    const apiCalls = [
      { key: "cities", title: "Cities", endpoint: "http://localhost:3000/api/cities" },
      { key: "countries", title: "Countries", endpoint: "http://localhost:3000/api/countries" },
      { key: "cultures", title: "Cultures", endpoint: "http://localhost:3000/api/cultures" },
      { key: "info", title: "Map Info", endpoint: "http://localhost:3000/api/info" },
      { key: "nameBases", title: "Name Bases", endpoint: "http://localhost:3000/api/namebases" },
      { key: "notes", title: "Notes", endpoint: "http://localhost:3000/api/notes" },
      { key: "religions", title: "Religions", endpoint: "http://localhost:3000/api/religions" },
      { key: "settings", title: "Settings", endpoint: "http://localhost:3000/api/settings" },
      { key: "SVG", title: "SVG", endpoint: "http://localhost:3000/api/SVG" },
      { key: "svgMod", title: "SVG", endpoint: "http://localhost:3000/api/svgMod" },
    ];

    // Total number of API calls
    const totalApiCalls = apiCalls.length;
    // Total number of objects to be loaded from API calls
    let totalObjects = 0;
    // Number of completed API calls
    let completedApiCalls = 0;

    // Function to handle each API call
    const handleApiCall = async ({ key, title, endpoint }, index) => {
      try {
        // Introduce a delay of 1 second (1000 milliseconds) between API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch data from the API endpoint
        const response = await fetch(endpoint);
        const responseData = await response.json();

        // Process the response based on the key
        switch (key) {
          case "cities":
            // Increment totalObjects with the length of responseData
            totalObjects += responseData.length;
            map.cities = responseData;
            break;
          case "countries":
            // Increment totalObjects with the length of responseData
            totalObjects += responseData.length;
            map.countries = responseData;
            break;
          case "cultures":
            // Increment totalObjects with the length of responseData
            totalObjects += responseData.length;
            map.cultures = responseData;
            break;
          case "info":
            // Increment totalObjects by 1
            totalObjects += 1;
            map.info = responseData[0]
            break;
          case "nameBases":
            // Increment totalObjects with the length of responseData
            totalObjects += responseData.length;
            map.nameBases = responseData;
            break;
          case "notes":
            // Increment totalObjects with the length of responseData
            totalObjects += responseData.length;
            map.notes = responseData;
            break;
          case "religions":
            // Increment totalObjects with the length of responseData
            totalObjects += responseData.length;
            map.religions = responseData;
            break;
          case "settings":
            // Increment totalObjects by 1
            totalObjects += 1;
            if (responseData.length > 0) {
            if (typeof responseData === 'object' && Object.keys(responseData).length > 0) {
              map.settings = responseData[0].info;
            }
            break;
          case "SVG":
            // Increment totalObjects by 1
            totalObjects += 1;
            if (responseData.length > 0) {
            if (typeof responseData === 'string' && responseData.length > 0) {
              map.SVG = responseData[0].svg;
            }
            break;
          case "svgMod":
            // Increment totalObjects by 1
            totalObjects += 1;
            if (typeof responseData === 'string' && responseData.length > 0) {
              map.svgMod = responseData[0].svg;
            }
            break;
          default:
            break;
        }
        // Update progress after each API call
        completedApiCalls++;
        const newProgress = Math.floor((completedApiCalls / totalApiCalls) * 100);
        setProgress(newProgress);

        // Update loading details
        setLoadingDetails(`Loading ${completedApiCalls}/${totalApiCalls}: ${title}`);

        // If all API calls are completed, set loading to false
        if (completedApiCalls === totalApiCalls) {
          setLoading(false);
          setLoadingDetails("Loading completed");
          setMapInfo(map);
          if (map.svgMod !== null) {
            // Replace SVG in body of document //
            let svg = document.getElementById("map");
            if (!svg) {
              document.body.insertAdjacentHTML("afterbegin", map.svgMod);
            }
          }
          //document.getElementById("map").attr("width", window.innerWidth)
        }
      } catch (error) {
        console.error("Error in API call:", error);
        // Handle errors as needed
      }
    };

    // Sequentially start the API calls
    const sequentialApiCalls = async () => {
      for (let i = 0; i < apiCalls.length; i++) {
        await handleApiCall(apiCalls[i], i);
      }
    };

    sequentialApiCalls();
  }, []);


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
              <h1>
                Terra-Logger. Azgaar&apos;s Fantasy Map Generator to structured Markdown.
              </h1>
            </AppBar>
            <Container maxWidth="xl" className="pageBody">
              <Grid container spacing={2}>
                <Grid item lg={3} md={2} xs={2}>
                  <Item className="Navigation">
                    <MainNav setMap={setMapInfo} app={appInfo} setApp={setAppInfo} theme={darkTheme ? darkMode : lightMode} />
                  </Item>
                </Grid>
                <Grid item lg={9} md={10} xs={10}>
                  <Item className="Content" id="Content">
                    <Wrapper>
                      <div className="contentBody">
                        <Outlet context={[mapInfo, setMapInfo, appInfo, darkTheme ? darkMode : lightMode]} />
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

function RouteOut() {
  return (
    <RouterProvider router={router} />
  )
}

export default RouteOut
