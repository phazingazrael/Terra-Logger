import { AppBar, Container, Grid } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { Outlet } from 'react-router-dom';
import Item from '../components/Item.tsx';
import MainNav from '../components/MainNav.tsx';

import { AppInfo } from '../definitions/AppInfo';
import { MapInfo } from '../definitions/MapInfo';

interface MainLayoutProps {
  mapInfo?: MapInfo;
  setMapInfo: Dispatch<SetStateAction<MapInfo | undefined>>;
  appInfo?: AppInfo;
  setAppInfo: Dispatch<SetStateAction<AppInfo | undefined>>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ mapInfo, setMapInfo, appInfo, setAppInfo }) => {
  return (
    <div>
      <AppBar position="static">
        <h1>Terra-Logger. Azgaar&apos;s Fantasy Map Generator to structured Markdown.</h1>
      </AppBar>
      <Container maxWidth="xl" className="pageBody">
        <Grid container spacing={2}>
          <Grid item lg={3} md={2} xs={2}>
            <Item className="Navigation">
              <MainNav />
            </Item>
          </Grid>
          <Grid item lg={9} md={10} xs={10}>
            <Item className="Content" id="Content">
              <div className="contentBody">
                <Outlet context={[mapInfo, setMapInfo, appInfo, setAppInfo]} />
              </div>
            </Item>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default MainLayout;
