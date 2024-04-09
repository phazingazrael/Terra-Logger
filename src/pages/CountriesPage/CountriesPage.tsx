import { Container, Grid } from '@mui/material';
import { useRecoilState } from 'recoil';
import mapAtom from '../../atoms/map';

function CountriesPage() {
  const [map] = useRecoilState(mapAtom);
  return (
    <Container>
      <div className="contentSubHead">
        <h3>Countries</h3>
      </div>
      <div className="contentSubBody">
        <Grid container spacing={2}>
          {map.countries.map((entry, index) => (
            <Grid xs={3} key={index.toString()} id={entry._id}>
              {/* <CountryCard country={entry} /> */}
              <p>{entry.name}</p>
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  );
}

export default CountriesPage;
