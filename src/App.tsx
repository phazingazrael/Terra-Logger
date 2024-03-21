import { useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Package from '../package.json';
import MainLayout from './layouts/MainLayout';
import { ErrorPage, HomePage, Overview, Settings, Tags } from './pages';

import './App.css';

import { AppInfo } from './definitions/AppInfo';
import { MapInfo } from './definitions/MapInfo';

const App = (): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapInfo, setMapInfo] = useState<MapInfo>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [appInfo, setAppInfo] = useState<AppInfo>();

  useEffect(() => {
    const nullMap = {
      cities: [],
      countries: [],
      cultures: [],
      info: {
        name: '',
        seed: ''
      },
      nameBases: [],
      notes: [],
      npcs: [],
      religions: [],
      settings: {
        mapName: '',
        distanceUnit: '',
        distanceScale: '',
        areaUnit: '',
        heightUnit: '',
        heightExponent: '',
        temperatureScale: '',
        barSize: '',
        barLabel: '',
        barBackOpacity: '',
        barBackColor: '',
        barPosX: '',
        barPosY: '',
        populationRate: '',
        urbanization: '',
        mapSize: '',
        latitude0: '',
        prec: '',
        options: {
          pinNotes: false,
          showMFCGMap: false,
          winds: [],
          temperatureEquator: 0,
          temperatureNorthPole: 0,
          temperatureSouthPole: 0,
          stateLabelsMode: '',
          year: 0,
          era: '',
          eraShort: '',
          military: []
        },
        hideLabels: 0,
        stylePreset: '',
        rescaleLabels: 0,
        urbanDensity: 0
      },
      SVG: '',
      svgMod: ''
    };
    const defaultApp = {
      id: Package.version,
      application: {
        name: Package.name,
        version: Package.version,
        afmgVer: '1.95.05',
        supportedLanguages: ['en'],
        defaultLanguage: 'en',
        onboarding: true,
        description: Package.descriptionFull
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
      }
    };
    setMapInfo(nullMap);
    setAppInfo(defaultApp);
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <MainLayout
          mapInfo={mapInfo}
          setMapInfo={setMapInfo}
          appInfo={appInfo}
          setAppInfo={setAppInfo}
        />
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          element: <HomePage />,
          errorElement: <ErrorPage />
        },
        {
          path: 'overview',
          element: <Overview />,
          errorElement: <ErrorPage />
        },
        {
          path: 'tags',
          element: <Tags />,
          errorElement: <ErrorPage />
        },
        {
          path: 'settings',
          element: <Settings />,
          errorElement: <ErrorPage />
        }
      ]
    }
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
