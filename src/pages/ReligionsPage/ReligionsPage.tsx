import { Container, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import mapAtom from '../../atoms/map';
import { initDatabase } from '../../db/database';
import { queryDataFromStore } from '../../db/interactions';

import { ReligionCard } from "../../components/cards";

function ReligionsPage() {
  const [map] = useRecoilState(mapAtom);
  const [religions, setReligions] = useState<TLReligion[]>([]);
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
    const loadReligions = async () => {
      const data = await queryDataFromStore('religions', 'mapIdIndex', mapId);
      if (data) {
        console.log(data);
        setReligions(data);
      }
    };

    loadReligions();
  }, []);
  return (
    <Container>
      <div className="contentSubHead">
        <h3>Religions</h3>
      </div>
      <div className="contentSubBody">
        <Grid container spacing={2}>
          {religions.map((entry) => (
            <Grid item xs={3} key={entry._id} id={entry._id}>
              <ReligionCard {...entry} />
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  );
}

export default ReligionsPage;
