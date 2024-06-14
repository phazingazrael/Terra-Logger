/* eslint-disable jsx-a11y/label-has-associated-control */
import { Container } from '@mui/material';
import { useMemo } from 'react';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import appAtom from '../../atoms/app.tsx';
import mapAtom from '../../atoms/map.tsx';

function CityView() {
  const [map, setMap] = useRecoilState(mapAtom);
  const [app, setApp] = useRecoilState(appAtom);
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
