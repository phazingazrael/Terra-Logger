import { useEffect } from 'react'
import { MenuList, MenuItem, ListItemText, ListItemIcon, Divider } from '@mui/material/'
import { NavLink } from 'react-router-dom'
import { IconContext } from 'react-icons'
import { TiBook, TiClipboard, TiCog, TiDocumentText, TiGlobe, TiHome, TiTags } from 'react-icons/ti'
import { ImDiamonds } from 'react-icons/im'
import PropTypes from 'prop-types';


export const MainNav = ({ app, theme }) => {

  let mapName = '';
  let mapLoaded = false;
  if (app.mapInfo.name.length > 0) {
    mapLoaded = true;
    mapName = app.mapInfo.name;
  }


  useEffect(() => {

  }, [])

  return (
    <MenuList style={{ color: theme.palette.mode == "light" ? theme.palette.primary.dark : theme.palette.text.primary }}>
      <IconContext.Provider value={{ size: '1.75rem', color: theme.palette.mode == "light" ? theme.palette.primary.dark : theme.palette.text.primary }}>
        <MenuItem>
          <ListItemIcon>
            <TiGlobe />
          </ListItemIcon>
          <ListItemText>
            {mapLoaded
              ? mapName
              : 'No Map Loaded'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <NavLink
          to='/' className={({ isActive }) =>
            isActive ? 'active' : ''}
        >
          <MenuItem>
            <ListItemIcon>
              <TiHome />
            </ListItemIcon>
            <ListItemText>Home</ListItemText>
            <ListItemIcon className='inactive'>
              <ImDiamonds />
            </ListItemIcon>
          </MenuItem>
        </NavLink>
        {mapLoaded
          ? (
            <>
              <NavLink
                to='/overview' className={({ isActive }) =>
                  isActive ? 'active' : ''}
              >
                <MenuItem>
                  <ListItemIcon>
                    <TiBook />
                  </ListItemIcon>
                  <ListItemText>Overview</ListItemText>
                  <ListItemIcon className='inactive'>
                    <ImDiamonds />
                  </ListItemIcon>
                </MenuItem>
              </NavLink>
              <NavLink
                to='/entries' className={({ isActive }) =>
                  isActive ? 'active' : ''}
              >
                <MenuItem>
                  <ListItemIcon>
                    <TiClipboard />
                  </ListItemIcon>
                  <ListItemText>Entries</ListItemText>
                  <ListItemIcon className='inactive'>
                    <ImDiamonds />
                  </ListItemIcon>
                </MenuItem>
              </NavLink>
              <div className='subMenu'>
                <NavLink
                  to='/countries' className={({ isActive }) =>
                    isActive ? 'active' : ''}
                >
                  <MenuItem>
                    <ListItemIcon>
                      <TiDocumentText />
                    </ListItemIcon>
                    <ListItemText>Countries</ListItemText>
                    <ListItemIcon className='inactive'>
                      <ImDiamonds />
                    </ListItemIcon>
                  </MenuItem>
                </NavLink>
                <NavLink
                  to='/cities' className={({ isActive }) =>
                    isActive ? 'active' : ''}
                >
                  <MenuItem>
                    <ListItemIcon>
                      <TiDocumentText />
                    </ListItemIcon>
                    <ListItemText>Cities</ListItemText>
                    <ListItemIcon className='inactive'>
                      <ImDiamonds />
                    </ListItemIcon>
                  </MenuItem>
                </NavLink>
                <NavLink
                  to='/religions' className={({ isActive }) =>
                    isActive ? 'active' : ''}
                >
                  <MenuItem>
                    <ListItemIcon>
                      <TiDocumentText />
                    </ListItemIcon>
                    <ListItemText>Religions</ListItemText>
                    <ListItemIcon className='inactive'>
                      <ImDiamonds />
                    </ListItemIcon>
                  </MenuItem>
                </NavLink>
                <NavLink
                  to='/tags' className={({ isActive }) =>
                    isActive ? 'active' : ''}
                >
                  <MenuItem>
                    <ListItemIcon>
                      <TiTags />
                    </ListItemIcon>
                    <ListItemText>Tags</ListItemText>
                    <ListItemIcon className='inactive'>
                      <ImDiamonds />
                    </ListItemIcon>
                  </MenuItem>
                </NavLink>
              </div>
            </>
          )
          : ''}

        <NavLink
          to='/settings' className={({ isActive }) =>
            isActive ? 'active' : ''}
        >
          <MenuItem>
            <ListItemIcon>
              <TiCog />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
            <ListItemIcon className='inactive'>
              <ImDiamonds />
            </ListItemIcon>
          </MenuItem>
        </NavLink>
      </IconContext.Provider>
    </MenuList>
  )
}

MainNav.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string,
    application: PropTypes.shape({
      name: PropTypes.string,
      version: PropTypes.string,
      afmgVer: PropTypes.string,
      supportedLanguages: PropTypes.array,
      defaultLanguage: PropTypes.string,
      onboarding: PropTypes.bool
    }),
    userSettings: PropTypes.shape({
      theme: PropTypes.string,
      language: PropTypes.string,
      showWelcomeMessage: PropTypes.bool,
      fontSize: PropTypes.string,
      exportOption: PropTypes.string,
      screen: PropTypes.object
    }),
    mapInfo: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  theme: PropTypes.shape({
    palette: PropTypes.shape({
      mode: PropTypes.string,
      primary: PropTypes.shape({
        dark: PropTypes.string
      }),
      text: PropTypes.shape({
        primary: PropTypes.string
      })
    })
  }).isRequired
}