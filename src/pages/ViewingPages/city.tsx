/* eslint-disable jsx-a11y/label-has-associated-control */
import { Container } from '@mui/material';
import { useMemo } from 'react';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';

function CityView() {
  let cityId = useParams();

  const IconStyles = useMemo(() => ({ size: '1.5rem' }), []);

  return (
    <Container className="Settings">
      <IconContext.Provider value={IconStyles}>
        <h3>{}</h3>
        <div className="contentSubBody">{String(cityId)}</div>
      </IconContext.Provider>
    </Container>
  );
}

export default CityView;
