import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import { /*LazyLoadedSVG,*/ rgbToRgba } from '../../';

import React, { useEffect } from 'react';
import '../cards.css';

const MapsCard: React.FC<MapsCardProps> = ({
  handleMapSelect,
  id,
  info,
  mapId,
  settings,
  SVG,
  svgMod,
}) => {
  console.log(id, info, mapId, settings, SVG, svgMod);
  const theme: any = useOutletContext();

  let themeColor = null;

  if (theme.palette.mode === 'dark') {
    themeColor = theme.palette.primary.dark;
  } else if (theme.palette.mode === 'light') {
    themeColor = theme.palette.primary.light;
  }

  let mapsListing = document.getElementById('MapsList');

  if (mapsListing) {
    let mapsListSvg = mapsListing.getElementsByTagName('svg');
    let mapsListViewboxes = mapsListing.getElementsByTagName('g');
    let svgContainer = document.getElementsByClassName('svg-container');

    let svgWidth = svgContainer.item(0)?.clientWidth;
    let svgHeight = svgContainer.item(0)?.clientHeight;

    if (mapsListSvg.length > 0) {
      for (const svg of mapsListSvg) {
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        for (const viewbox of mapsListViewboxes) {
          if (viewbox.id === 'viewbox') {
            for (const viewbox of mapsListViewboxes) {
              // viewbox.setAttribute(
              //   'transform',
              //   `scale(${svgWidth / info.width},${svgHeight / info.height})`,
              // );
              viewbox.removeAttribute('transform');
              viewbox.removeAttribute('width');
              viewbox.removeAttribute('height');
            }
          }
        }
      }
    }
  }

  useEffect(() => {
    if (mapId === id) {
      console.log('map loaded');
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
