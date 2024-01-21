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

  useEffect(() => {


    let map = {
      "biomesData": JSON.parse(localStorage.getItem("biomesData")),
      "cities": JSON.parse(localStorage.getItem("cities")),
      "countries": JSON.parse(localStorage.getItem("countries")),
      "grid": JSON.parse(localStorage.getItem("grid")),
      "info": JSON.parse(localStorage.getItem("info")),
      "mapCoordinates": JSON.parse(localStorage.getItem("mapCoordinates")),
      "nameBases": JSON.parse(localStorage.getItem("nameBases")),
      "notes": JSON.parse(localStorage.getItem("notes")),
      "pack": JSON.parse(localStorage.getItem("pack")),
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
