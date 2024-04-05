import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList } from '@mui/material/';
import { useEffect, useMemo, useState } from 'react';
import { IconContext } from 'react-icons';
import { ImDiamonds } from 'react-icons/im';
import {
  TiBook,
  TiClipboard,
  TiCog,
  TiDocumentText,
  TiGlobe,
  TiHome,
  TiTags,
} from 'react-icons/ti';
import { NavLink } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import mapAtom from '../atoms/map';

const MainNav = (): JSX.Element => {
  const iconStyles = useMemo(() => ({ size: '1.75rem' }), []);
  const [map] = useRecoilState(mapAtom);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapName, setMapName] = useState('');

  useEffect(() => {
    if (map.info.name !== '') {
      setMapName(map.info.name);
      setMapLoaded(true);
    }
  }, [map]);

  return (
    <MenuList>
      <IconContext.Provider value={iconStyles}>
        <MenuItem>
          <ListItemIcon>
            <TiGlobe />
          </ListItemIcon>
          <ListItemText>{mapLoaded ? mapName : 'No Map Loaded'}</ListItemText>
        </MenuItem>
        <Divider />
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MenuItem>
            <ListItemIcon>
              <TiHome />
            </ListItemIcon>
            <ListItemText>Home</ListItemText>
            <ListItemIcon className="inactive">
              <ImDiamonds />
            </ListItemIcon>
          </MenuItem>
        </NavLink>
        {mapLoaded ? (
          <>
            <NavLink to="/overview" className={({ isActive }) => (isActive ? 'active' : '')}>
              <MenuItem>
                <ListItemIcon>
                  <TiBook />
                </ListItemIcon>
                <ListItemText>Overview</ListItemText>
                <ListItemIcon className="inactive">
                  <ImDiamonds />
                </ListItemIcon>
              </MenuItem>
            </NavLink>
            <NavLink to="/entries" className={({ isActive }) => (isActive ? 'active' : '')}>
              <MenuItem>
                <ListItemIcon>
                  <TiClipboard />
                </ListItemIcon>
                <ListItemText>Entries</ListItemText>
                <ListItemIcon className="inactive">
                  <ImDiamonds />
                </ListItemIcon>
              </MenuItem>
            </NavLink>
            <div className="subMenu">
              <NavLink to="/countries" className={({ isActive }) => (isActive ? 'active' : '')}>
                <MenuItem>
                  <ListItemIcon>
                    <TiDocumentText />
                  </ListItemIcon>
                  <ListItemText>Countries</ListItemText>
                  <ListItemIcon className="inactive">
                    <ImDiamonds />
                  </ListItemIcon>
                </MenuItem>
              </NavLink>
              <NavLink to="/cities" className={({ isActive }) => (isActive ? 'active' : '')}>
                <MenuItem>
                  <ListItemIcon>
                    <TiDocumentText />
                  </ListItemIcon>
                  <ListItemText>Cities</ListItemText>
                  <ListItemIcon className="inactive">
                    <ImDiamonds />
                  </ListItemIcon>
                </MenuItem>
              </NavLink>
              <NavLink to="/religions" className={({ isActive }) => (isActive ? 'active' : '')}>
                <MenuItem>
                  <ListItemIcon>
                    <TiDocumentText />
                  </ListItemIcon>
                  <ListItemText>Religions</ListItemText>
                  <ListItemIcon className="inactive">
                    <ImDiamonds />
                  </ListItemIcon>
                </MenuItem>
              </NavLink>
              <NavLink to="/tags" className={({ isActive }) => (isActive ? 'active' : '')}>
                <MenuItem>
                  <ListItemIcon>
                    <TiTags />
                  </ListItemIcon>
                  <ListItemText>Tags</ListItemText>
                  <ListItemIcon className="inactive">
                    <ImDiamonds />
                  </ListItemIcon>
                </MenuItem>
              </NavLink>
            </div>
          </>
        ) : (
          ''
        )}

        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
          <MenuItem>
            <ListItemIcon>
              <TiCog />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
            <ListItemIcon className="inactive">
              <ImDiamonds />
            </ListItemIcon>
          </MenuItem>
        </NavLink>
      </IconContext.Provider>
    </MenuList>
  );
};
export default MainNav;
