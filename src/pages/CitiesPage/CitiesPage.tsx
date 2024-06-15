import { Container, Grid } from '@mui/material';
import React, { useEffect, useState, Suspense } from 'react';
import { useRecoilState } from 'recoil';
import mapAtom from '../../atoms/map';
import { initDatabase } from '../../db/database';
import { queryDataFromStore } from '../../db/interactions';


import './citiesPage.css';

import BookLoader from '../../assets/BookLoader.png';

function CitiesPage() {
  const [map] = useRecoilState(mapAtom);
  const [cities, setCities] = useState<TLCity[]>([]);
  const { mapId } = map;

  const LazyCityCard = React.lazy(() => import('../../components/Cards/city'));


  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const database = await initDatabase();
        if (database) {
          console.log('Database initialized');
        }
      } catch (error) {
        console.error(error);
      }
    };

    initializeDatabase();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      const data = await queryDataFromStore('cities', 'mapIdIndex', mapId);
      if (data) {
        console.log(data);
        setCities(data);
      }
    };

    loadCities();
  }, []);

  return (
    <Container>
      <div className="contentSubHead">
        <h3>Cities</h3>
      </div>
      <div className="contentSubBody">
        <Grid container spacing={2}>
          <Suspense fallback={<Grid item xs={12}><div className="citiesLoader"><h2>Loading...</h2><img src={BookLoader} alt="" /></div></Grid>}>
          {cities.map((entry) => (
              <Grid item xs={3} key={entry._id} id={entry._id}>
                <LazyCityCard {...entry} />
              </Grid>
            ))}
          </Suspense>
        </Grid>
      </div>
    </Container>
  );
}

export default CitiesPage;
