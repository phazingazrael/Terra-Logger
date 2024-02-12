import * as React from 'react'
import { useEffect, useState } from 'react'
import { MenuList, MenuItem, ListItemText, ListItemIcon, Divider, Popover, Typography } from '@mui/material/'
import { NavLink } from 'react-router-dom'
import { IconContext } from 'react-icons'
import { TiBook, TiClipboard, TiCog, TiDocumentText, TiGlobe, TiHome, TiTags } from 'react-icons/ti'
import { ImDiamonds } from 'react-icons/im'

const MainNav = ({ setMap, app, setApp, theme }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }


  const handleClear = async () => {
    console.log('Clearing Storage')

    fetch('http://localhost:3000/api/deleteAll', {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));

    app.userSettings.mapInfo.name = "";
    app.userSettings.mapInfo.seed = "";
    const mapInfoData = {
      name: "",
      seed: ""
    };

    // Remove map background
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.remove();
    }

    // Update only the mapInfo fields in appInfo
    setApp(prevAppInfo => ({
      ...prevAppInfo,
      userSettings: {
        ...prevAppInfo.userSettings,
        mapInfo: {
          ...prevAppInfo.userSettings.mapInfo,
          ...mapInfoData
        }
      }
    }));

    setMap();
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  useEffect(() => {

  }, [])

  return (
    <MenuList style={{ color: theme.palette.mode == "light" ? theme.palette.primary.dark : theme.palette.text.primary }}>
      <IconContext.Provider value={{ size: '1.75rem', color: theme.palette.mode == "light" ? theme.palette.primary.dark : theme.palette.text.primary }}>
        <MenuItem onClick={openMenu}>
          <ListItemIcon>
            <TiGlobe />
          </ListItemIcon>
          <ListItemText>
            {app.userSettings.mapInfo.name.length > 0
              ? (
                <span className='mapName'>
                  {app.userSettings.mapInfo.name}
                </span>
              )
              : 'No Map Loaded'}
          </ListItemText>
        </MenuItem>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <div className='mapDetails' />
          <NavLink
            to='/' onClick={() => {
              handleClose()
              handleClear()
            }} color='warning.main'>
            <MenuItem >
              <ListItemIcon />
              <ListItemText>Delete Map Data</ListItemText>
            </MenuItem>
          </NavLink>
        </Popover>
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
        {app.userSettings.mapInfo.name.length > 0
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
              <MenuItem>
                <ListItemIcon>
                  <TiClipboard />
                </ListItemIcon>
                <ListItemText>Entries</ListItemText>
                <ListItemIcon className='inactive'>
                  <ImDiamonds />
                </ListItemIcon>
              </MenuItem>
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

export default MainNav
