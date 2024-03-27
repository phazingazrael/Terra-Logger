import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import appAtom from './atoms/app';
import mapAtom from './atoms/map';
import MainLayout from './layouts/MainLayout';
import { CountriesPage, ErrorPage, HomePage, Overview, Settings, Tags } from './pages';

import './App.css';

const App = (): JSX.Element => {
  const [map, setMap] = useRecoilState<MapInfo>(mapAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [app, setApp] = useRecoilState<AppInfo>(appAtom);

  useEffect(() => {
    const mapData: string | null = localStorage.getItem('Terra_Logger_Map');
    console.log(mapData);
    console.log(map);
    if (mapData) {
      console.log('Map data found');
      const newMap: MapInfo = JSON.parse(mapData) as MapInfo;
      setMap(newMap);
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />,
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
        },
        {
          path: 'countries',
          element: <CountriesPage />,
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
