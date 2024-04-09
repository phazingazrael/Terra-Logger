import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import mapAtom from './atoms/map';
import MainLayout from './layouts/MainLayout';
import { CountriesPage, ErrorPage, HomePage, Overview, Settings, Tags } from './pages';

import './App.css';

const App = (): JSX.Element => {
  const [map, setMap] = useRecoilState<TLMapInfo>(mapAtom);

  useEffect(() => {
    function handleResize() {
      const { innerHeight, innerWidth } = window;
      console.log('resized to: ', innerWidth, 'x', innerHeight);
      const mapElement = document.getElementById('map');
      const viewBox = document.getElementById('viewbox');
      const originalHeight = map.info.height;
      const originalWidth = map.info.width;
      if (mapElement) {
        console.log(originalHeight, originalWidth);
        console.log(innerHeight, innerWidth);
        console.log(originalHeight / innerHeight, originalWidth / innerWidth);
        console.log(innerHeight / originalHeight, innerWidth / originalWidth);

        if (viewBox) {
          mapElement.setAttribute('height', innerHeight as unknown as string);
          mapElement.setAttribute('width', innerWidth as unknown as string);
          viewBox.setAttribute('height', innerHeight as unknown as string);
          viewBox.setAttribute('width', innerWidth as unknown as string);

          // Apply transformation to scale content
          viewBox.setAttribute(
            'transform',
            `scale(${innerWidth / originalWidth},${innerHeight / originalHeight})`,
          );
        }
      }
    }

    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    const mapData: string | null = localStorage.getItem('Terra_Logger_Map');
    console.log(mapData);
    console.log(map);
    if (mapData) {
      console.log('Map data found');
      const newMap: TLMapInfo = JSON.parse(mapData) as TLMapInfo;
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
          errorElement: <ErrorPage />,
        },
        {
          path: 'overview',
          element: <Overview />,
          errorElement: <ErrorPage />,
        },
        {
          path: 'tags',
          element: <Tags />,
          errorElement: <ErrorPage />,
        },
        {
          path: 'settings',
          element: <Settings />,
          errorElement: <ErrorPage />,
        },
        {
          path: 'countries',
          element: <CountriesPage />,
          errorElement: <ErrorPage />,
        },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
