import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import { rgbToRgba } from '../Util';

import React, { useEffect } from 'react';
import './cards.css';

const MapsCard: React.FC<MapsCardProps> = ({
  handleMapSelect,
  id,
  info,
  mapId,
  svgMod,
}) => {
  // console.log(id, info, mapId, settings, SVG, svgMod);
  const theme: any = useOutletContext();

  let themeColor = null;

  if (theme.palette.mode === 'dark') {
    themeColor = theme.palette.primary.dark;
  } else if (theme.palette.mode === 'light') {
    themeColor = theme.palette.primary.light;
  }



  useEffect(() => {
    if (mapId === id) {
      // console.log('map loaded');
    }
  });

  const ImageAlt = '';
  return (
    <Card>
      <CardMedia
        sx={{ backgroundColor: theme ? rgbToRgba(themeColor as string, 0.5 as number) : '' }}
        title={ImageAlt}
      >
        <div className="svg-container" dangerouslySetInnerHTML={{ __html: svgMod }} />
        <input type="checkbox" onChange={() => handleMapSelect(id)} />
      </CardMedia>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {info.name}
        </Typography>
      </CardContent>
      <CardActions className="tile-info">
        <Button className="tile-button" color="secondary" variant="contained">
          View
        </Button>
      </CardActions>
    </Card>
  );
};
type MapsCardProps = {
  handleMapSelect: (mapId: string) => void;
  id: string;
  info: {
    name: string;
    seed: string;
    width: number;
    height: number;
    ID: string;
    // ... other properties ...
  };
  mapId: string;
  settings: {
    mapName: string;
    distanceUnit: string;
    // ... other properties ...
  };
  SVG: string;
  svgMod: string;
};
export default MapsCard;
