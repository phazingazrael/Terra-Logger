import { Container, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import mapAtom from '../../atoms/map';
import { CityCard } from '../../components/Cards';
import { initDatabase } from '../../db/database';
import { queryDataFromStore } from '../../db/interactions';

function CitiesPage() {
  const [map] = useRecoilState(mapAtom);
  const [cities, setCities] = useState<TLCity[]>([]);
  const { mapId } = map;

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
          {cities.map((entry) => (
            <Grid item xs={3} key={entry.mapSeed} id={entry._id}>
              <CityCard {...entry} />
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  );
}

export default CitiesPage;
