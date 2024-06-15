/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useMemo } from 'react';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { getDataFromStore } from '../../db/interactions';

function CityView() {
  let cityId = useParams();
  const [city, setCity] = useState<TLCity>();

  useEffect(() => {
    if (cityId !== undefined) {
      getDataFromStore('cities', cityId._id).then((data) => {
        setCity(data as TLCity);
      })
    }
  }, []);

  const IconStyles = useMemo(() => ({ size: '1.5rem' }), []);

  return (
    <Container className="Settings">
      <IconContext.Provider value={IconStyles}>
        <h3>{city?.name}</h3>
        <div className="contentSubBody"></div>
      </IconContext.Provider>
    </Container>
  );
}

export default CityView;
