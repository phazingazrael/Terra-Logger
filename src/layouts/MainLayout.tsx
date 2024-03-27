import { AppBar, Container, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Item from '../components/Item.tsx';
import MainNav from '../components/MainNav.tsx';

const MainLayout = (): JSX.Element => {
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
                <Outlet />
              </div>
            </Item>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default MainLayout;
