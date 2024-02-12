import { useState, useLayoutEffect, useEffect } from 'react';
import './App.css'
import Package from "../../../package.json";
import MainNav from './modules/mainNav';

import Root from './routes/baseRoutes/root.jsx';
import ErrorPage from './routes/baseRoutes/error.jsx';
import Overview from './routes/baseRoutes/overview';
import Categories from './routes/baseRoutes/categories';
import Countries from './routes/baseRoutes/countries';
import Cities from './routes/baseRoutes/cities';
import Religions from './routes/baseRoutes/reiligions';
import Tags from './routes/baseRoutes/tags';
import Settings from './routes/baseRoutes/settings';

import ViewCity from './routes/advRoutes/viewCity';

import { Paper, Grid, AppBar, Container } from "@mui/material/";
import { styled } from '@mui/material/styles';

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation
} from "react-router-dom";

window.onmessage = (event) => {
  // event.source === window means the message is coming from the preload
  // script, as opposed to from an <iframe> or other source.
  if (event.source === window && event.data === 'main-world-port') {
    const [port] = event.ports
    // Once we have the port, we can communicate directly with the main
    // process.
    port.onmessage = (event) => {
      console.log('from main process:', event.data)
      port.postMessage(event.data.test * 2)
    }
  }
}


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(193, 197, 195, 0.6)',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  overflow: "auto"
}));

const router = createBrowserRouter([
  { basename: "/" },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Root />,
        errorElement: <ErrorPage />,
      },
      {
        path: "overview",
        element: <Overview />,
        errorElement: <ErrorPage />,
      },
      {
        path: "cities",
        element: <Cities />,
        errorElement: <ErrorPage />,
      },
      {
        path: "countries",
        element: <Countries />,
        errorElement: <ErrorPage />,
      },
      {
        path: "religions",
        element: <Religions />,
        errorElement: <ErrorPage />,
      },
      {
        path: "categories",
        element: <Categories />,
        errorElement: <ErrorPage />,
      },
      {
        path: "tags",
        element: <Tags />,
        errorElement: <ErrorPage />,
      },
      {
        path: "view_city",
        element: <ViewCity />,
        errorElement: <ErrorPage />,
      },
      {
        path: "settings",
        element: <Settings {...Package} />,
        errorElement: <ErrorPage />,
      }
    ]
  }
]);

const Wrapper = ({ children }) => {
  const location = useLocation();
  useLayoutEffect(() => {
    document.getElementById("Content").scrollTo(0, 0);
  }, [location.pathname]);
  return children
}



function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [mapData, setMap] = useState();
  const [appInfo, setAppInfo] = useState({
    "_id": Package.version,
    "application": {
      "name": Package.name,
      "version": Package.version,
      "afmgVer": "1.95.05",
      "supportedLanguages": ["en"],
      "defaultLanguage": "en",
      "onboarding": true
    },
    "userSettings": {
      "theme": "light",
      "language": "en",
      "showWelcomeMessage": true,
      "fontSize": "medium",
      "exportOption": "",
      "screen": {
        "innerWidth": window.innerWidth,
        "innerHeight": window.innerHeight,
        "outerWidth": window.outerWidth,
        "outerHeight": window.outerHeight,
        "devicePixelRatio": window.devicePixelRatio,
      }
    },
    "mapInformation": {
      "mapName": "",
      "mapVersion": "",
      "mapSeed": ""
    }
  });


  const fetchDataFromAllRoutes = async () => {
    try {
      // Fetch data from the Cities routes
      const citiesResponse = await fetch('http://localhost:3000/api/cities');
      const citiesData = await citiesResponse.json();
      console.log('Data from /cities:', citiesData);

      // Fetch data from the Namebases route
      const namebasesResponse = await fetch('http://localhost:3000/api/namebases');
      const namebasesData = await namebasesResponse.json();
      console.log('Data from /namebases:', namebasesData);

      // Fetch data from the Notes route
      const notesResponse = await fetch('http://localhost:3000/api/notes');
      const notesData = await notesResponse.json();
      console.log('Data from /notes:', notesData);

      // Fetch data from the Info route
      const infoResponse = await fetch('http://localhost:3000/api/info');
      const infoData = await infoResponse.json();
      console.log('Data from /info:', infoData);

      // Fetch data from the Settings route
      const settingsResponse = await fetch('http://localhost:3000/api/settings');
      const settingsData = await settingsResponse.json();
      console.log('Data from /settings:', settingsData);

      // Fetch data from the Application route
      const applicationResponse = await fetch('http://localhost:3000/api/application');
      const applicationData = await applicationResponse.json();
      console.log('Data from /application:', applicationData);

      // Fetch data from the SVG route
      const svgResponse = await fetch('http://localhost:3000/api/SVG');
      const svgData = await svgResponse.json();
      console.log('Data from /SVG:', svgData);

      // Fetch data from the svgMod route
      const svgModResponse = await fetch('http://localhost:3000/api/svgMod');
      const svgModData = await svgModResponse.json();
      console.log('Data from /svgMod:', svgModData);

      // Add additional fetch requests for new routes as needed

    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };





  useEffect(() => {

    // Call the function to fetch data from all routes
    //fetchDataFromAllRoutes();
    let map = {
      "cities": JSON.parse(localStorage.getItem("cities")),
      "countries": JSON.parse(localStorage.getItem("countries")),
      "info": JSON.parse(localStorage.getItem("info")),
      "nameBases": JSON.parse(localStorage.getItem("nameBases")),
      "notes": JSON.parse(localStorage.getItem("notes")),
      "religions": JSON.parse(localStorage.getItem("religions")),
      "settings": JSON.parse(localStorage.getItem("settings")),
      "SVG": null,
      "svgMod": null
    }
    map.SVG = localStorage.getItem("SVG");
    map.svgMod = localStorage.getItem("svgMod");

    //setMap(map);
    if (map.cities !== null && map.countries !== null && map.info !== null && map.nameBases !== null && map.notes !== null && map.religions !== null && map.settings !== null) {


      if (mapData == undefined) { setMap(map); }
      if (map.SVG !== null) {
        // Replace SVG in body of document //
        let svg = document.getElementById("map");
        if (!svg) {
          document.body.insertAdjacentHTML("afterbegin", map.svgMod);
        }
      }
      //document.getElementById("map").attr("width", window.innerWidth)
    } else {
      //alert("NO MAP LOADED!")
    }

  }, [mapData, appInfo, setAppInfo]);
  return (
    <div className="App">
      <AppBar position="static" className="Header">
        <div className="HeaderText">
          <h1>
            Terra-Logger. Azgaar&apos;s Fantasy Map Generator to structured Markdown.
          </h1>
        </div>

      </AppBar>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item lg={3} md={2} xs={2}>
            <Item className="Navigation">
              <MainNav data={mapData} setMap={setMap} />
            </Item>
          </Grid>
          <Grid item lg={9} md={10} xs={10}>
            <Item className='Content' id="Content">
              {/* <header>
                <div>
                  <nav>
                    <a href="#">
                      Home
                    </a>
                    <a href="#">
                      Worlds
                    </a>
                    <a href="#">
                      Characters
                    </a>
                    <a href="#">
                      Stories
                    </a>
                    <a href="#">
                      Blog
                    </a>
                    <a href="#">
                      About
                    </a>
                  </nav>
                </div>
              </header> */}
              <Wrapper>
                <div className="contentBody">
                  <Outlet context={[mapData, setMap, appInfo]} />
                </div>
              </Wrapper>
            </Item>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

function RouteOut() {
  return (
    <RouterProvider router={router} />
  )
}



export default RouteOut;
