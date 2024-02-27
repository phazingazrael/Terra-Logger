import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useOutletContext } from 'react-router-dom'

import { UploadForm } from '../../modules'

import '../../assets/css/settingsPage.css'
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

//import ExportModal from '../../modules/export/export'

const Settings = () => {
  const [mapData, setMap, appInfo] = useOutletContext()

  let appIn = 0
  let i = 0

  useEffect(() => {

  }, [mapData, setMap, appInfo])

  return (
    <div>
      {appInfo && appInfo.userSettings.mapInfo.name.length > 0
        ? (
          <>
            <h3>
              Settings
            </h3>
            <div className='settings-grid'>
              <div className='settings-section appInf'>
                <h4 className='section-title'>General Information</h4>
                <div className='settings-list'>
                  {Object.entries(appInfo.application).map(([key, value]) => (
                    appIn === 0
                      ? (
                        <div className='settings-item' key={appIn++}>
                          <span className='item-label'>
                            {key.replace(/(^|[\s-])\S/g, function (match) {
                              return match.toUpperCase()
                            })}
                          </span>
                          <span>{value.replace(/(^|[\s-])\S/g, function (match) {
                            return match.toUpperCase()
                          })}
                          </span>
                        </div>
                      )
                      : (
                        <div className='settings-item' key={appIn++}>
                          <span className='item-label'>
                            {key.replace(/(^|[\s-])\S/g, function (match) {
                              return match.toUpperCase()
                            })}
                          </span>
                          <span>{value}</span>
                        </div>)

                  ))}
                </div>
              </div>
              <div className='settings-section map-info'>
                <h4 className='section-title'>General Settings</h4>
                <div className='section-body'>
                  <section className='setting-section'>
                    <h4 className='section-subTitle'>Azgaar&apos;s Fantasy Map Generator Export Details</h4>
                    <div className='settings-list'>
                      {Object.entries(mapData.info).map(([key, value]) => (
                        <div className='settings-item' key={i++}>
                          <span className='item-label'>
                            {key.replace(/(^|[\s-])\S/g, function (match) {
                              return match.toUpperCase()
                            })}
                          </span>
                          <span>{value}</span>
                        </div>)

                      )}
                    </div>
                  </section>
                  <Divider className='setting-divider' />
                  <section>
                    <h4 className='section-subTitle'>Azgaar&apos;s Fantasy Map Generator Export Map Settings</h4>
                    <div className='settings-list'>
                      <Accordion className='settings-accordion' sx={{ backgroundColor: '#e4e4e4' }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls='panel2a-content'
                          id='panel2a-header'
                        >
                          <Typography sx={{ color: 'text.secondary' }}>Caution, Expands for added data</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {Object.entries(mapData.settings).map(([key, value]) => (
                            <div className='settings-item' key={i++}>
                              <span className='item-label'>
                                {key.replace(/(^|[\s-])\S/g, function (match) {
                                  return match.toUpperCase()
                                })}
                              </span>
                              {typeof value === 'object'
                                ? (

                                  <Accordion sx={{ backgroundColor: '#a6a6a6' }}>
                                    <AccordionSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls='panel1a-content'
                                      id='panel1a-header'
                                    >

                                      <Typography sx={{ color: 'text.secondary' }}>Caution, Expands for added data</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      {Object.entries(value).map(([key, value]) => (
                                        <div key={key}>
                                          {key}:{typeof value === 'object'
                                            ? (
                                              <ol>
                                                {Object.entries(value).map(([key, value]) => (
                                                  <div key={key}>
                                                    {typeof value === 'object'
                                                      ? (
                                                        <Grid className='militaryGrid' container spacing={0}>
                                                          <Grid xs={3} item height='100%' className='militaryIcon militaryItem'>
                                                            <span>
                                                              {value.icon}
                                                            </span>
                                                            <span className='typeName'>
                                                              {value.name}
                                                            </span>
                                                          </Grid>
                                                          <Grid xs={3} item className='militaryItem'>
                                                            <span>Rural Population:&nbsp;</span>
                                                            <span>{value.rural}</span>
                                                          </Grid>
                                                          <Grid xs={3} item className='militaryItem'>
                                                            <span>Urban Population:&nbsp;</span>
                                                            <span>{value.urban}</span>
                                                          </Grid>
                                                          <Grid xs={3} item className='militaryItem'>
                                                            <span>Crew:&nbsp;</span>
                                                            <span>{value.crew}</span>
                                                          </Grid>
                                                          <Grid xs={3} item className='militaryItem' />
                                                          <Grid xs={3} item className='militaryItem'>
                                                            <span>Power:&nbsp;</span>
                                                            <span>{value.power}</span>
                                                          </Grid>
                                                          <Grid xs={3} item className='militaryItem'>
                                                            <span>Type:&nbsp;</span>
                                                            <span>{value.type}</span>
                                                          </Grid>
                                                          <Grid xs={3} item className='militaryItem'>
                                                            <span>Separate:&nbsp;</span>
                                                            <span>{value.separate}</span>
                                                          </Grid>
                                                        </Grid>
                                                      )
                                                      : (value)}

                                                  </div>
                                                ))}
                                              </ol>
                                            )
                                            : (value)}
                                        </div>
                                      ))}
                                    </AccordionDetails>
                                  </Accordion>
                                )
                                : (<span>{value}</span>)}
                            </div>)
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  </section>
                </div>
              </div>
              <div className='settings-section'>
                <h4 className='section-title'>Advanced Settings</h4>
                <div className='settings-list'>
                  <div className='settings-item'>
                    <span className='item-label'>Notifications:</span>
                    <span>On</span>
                  </div>
                  <div className='settings-item'>
                    <span className='item-label'>Dark Mode:</span>
                    <span>Off</span>
                  </div>
                  <div className='settings-item'>
                    <span className='item-label'>Data Usage:</span>
                    <span>Normal</span>
                  </div>
                </div>
              </div>
              <ExportModal />
            </div>
          </>
        )
        : (<UploadForm mapData={mapData} setMap={setMap} />)}

    </div>
  )
}

export default Settings
