import React from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { IconContext } from 'react-icons'

import {
  Typography,
  Card,
  CardContent,
  Unstable_Grid2 as Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

import {
  FaMapLocation,
  FaPeopleGroup,
  FaCrown,
  FaMoneyBillTransfer,
  FaUsers
} from "react-icons/fa6";

import "./viewStyles.css"



const ViewCountry = () => {
  // Access the ID parameter from the URL
  const { _id } = useParams();

  const [mapInfo, setMapInfo, appInfo, theme] = useOutletContext();

  const country = mapInfo.countries.find(country => country._id === _id);

  console.log(JSON.stringify(country));

  return (
    <IconContext.Provider value={{ size: '1.5rem', color: theme.palette.mode == "light" ? theme.palette.primary.dark : theme.palette.text.primary }}>
      <Grid container spacing={3} justifyContent="center" className="countryDisplay">
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {country.name} ({country.fullName})
                <img
                  src={"https://armoria.herokuapp.com/?coa=" + encodeURIComponent(JSON.stringify(country.coa))}
                  alt={country.name + " Coat of Arms"}
                  title={country.name + " Coat of Arms"}
                  style={{ verticalAlign: 'middle', marginRight: '10px', float: "left", maxWidth: "50px" }} />
              </Typography>
              <Typography variant="body1" paragraph>
                {country.description}
              </Typography>
              <Typography variant="subtitle1">
                <ListItemIcon>
                  <FaMapLocation />
                </ListItemIcon>
                Location: {mapInfo.info.mapName}
              </Typography>
              <Typography variant="subtitle1">
                <ListItemIcon>
                  <FaPeopleGroup />
                </ListItemIcon>
                <ListItem className="popList">
                  Population: {country.population.total}<br />
                  Rural: {country.population.rural}<br />
                  Urban: {country.population.urban}
                </ListItem>
              </Typography>
              <Typography variant="subtitle1">
                <ListItemIcon>
                  <FaCrown />
                </ListItemIcon>
                Ruler: King/Queen Name
              </Typography>
              <Typography variant="subtitle1">
                <ListItemIcon>
                  <FaMoneyBillTransfer />
                </ListItemIcon>
                Economy: Thriving trade in magical artifacts and potions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Government and Politics
              </Typography>
              <Typography variant="body2">
                <strong>Government Structure:</strong>
                <List>
                  <ListItem>
                    <ListItemText primary="Monarchy" />
                  </ListItem>
                </List>
              </Typography>
              <Typography variant="body2">
                <strong>Key Figures:</strong>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <FaCrown />
                    </ListItemIcon>
                    <ListItemText primary="King/Queen Name" secondary="Ruler of the country." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FaUsers />
                    </ListItemIcon>
                    <ListItemText primary="Council of Nobles" secondary="Advisory body to the monarch." />
                  </ListItem>
                </List>
              </Typography>
              <Typography variant="body2">
                <strong>Political System:</strong>
                <List>
                  <ListItem>
                    <ListItemText primary="Decentralized governance" />
                  </ListItem>
                </List>
              </Typography>
              <Typography variant="body2">
                <strong>Political Stability:</strong>
                <List>
                  <ListItem>
                    <ListItemText primary="Maintained through diplomacy and military strength" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Intrigue and power struggles are common" />
                  </ListItem>
                </List>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                History
              </Typography>
              <Typography variant="body2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Culture and Customs
              </Typography>
              <Typography variant="body2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Cities
              </Typography>
              <Typography variant="body2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </IconContext.Provider>
  )
}

export default ViewCountry
