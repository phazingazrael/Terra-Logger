import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom'
import { IconContext } from 'react-icons'

import {
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';

console.log("test");

import { FaMapLocation, FaPeopleGroup, FaCrown, FaMoneyBillTransfer, FaHouse, FaBook, FaUsers, FaUser } from "react-icons/fa6";

const ViewCity = () => {
  const [, , , theme] = useOutletContext()

  const iconContextValue = useMemo(() => {
    return {
      size: '1.5rem',
      color: theme.palette.mode === "light" ? theme.palette.primary.dark : theme.palette.text.primary
    };
  }, [theme]); // Dependency array ensures the object is recreated only when theme changes

  return (
    <IconContext.Provider value={iconContextValue}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                <Avatar variant="square" src="https://picsum.photos/seed/picsum/50/50" style={{ float: "left", marginRight: "1vw" }} />
                City Name
              </Typography>
              <Typography variant="body1" paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
              <Typography variant="subtitle1" paragraph>
                <ListItemIcon>
                  <FaMapLocation />
                </ListItemIcon>
                Location: Fantasy Region, Fantasy Continent
              </Typography>
              <Typography variant="subtitle1" paragraph>
                <ListItemIcon>
                  <FaPeopleGroup />
                </ListItemIcon>
                Population: 100,000
              </Typography>
              <Typography variant="subtitle1" paragraph>
                <ListItemIcon>
                  <FaCrown />
                </ListItemIcon>
                Ruler: King/Queen Name
              </Typography>
              <Typography variant="subtitle1" paragraph>
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
              <Typography variant="body2" paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Points of Interest
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaHouse />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="The Castle" secondary="Residence of the royal family." />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaBook />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="The Library of Wisdom" secondary="Repository of ancient knowledge." />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaUsers />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="The Guild Hall" secondary="Center for training and collaboration among artisans and mages." />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Factions of Interest
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaUser />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="The Royal Court" secondary="Advisors and officials serving the monarch." />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaUser />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="The Mage Council" secondary="Custodians of magical knowledge and lore." />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaUser />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="The Merchant Consortium" secondary="Key players in the country's economy." />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Persons of Interest
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaUser />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="King/Queen Name" secondary="Ruler of the realm." />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaUser />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="Archmage Elminster" secondary="Master of the arcane arts." />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Avatar>
                      <FaUser />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary="Lady Catherine" secondary="Renowned diplomat and peacemaker." />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                History
              </Typography>
              <Typography variant="body2" paragraph>
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
              <Typography variant="body2" paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Architecture
              </Typography>
              <Typography variant="body2" paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2" paragraph>
                Lorem ips um dolor sit amet, consectetur adipiscing elit. Sed gravida augue quis ipsum lobortis, at rhoncus libero posuere. Nulla facilisi.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </IconContext.Provider>
  )
}

export default ViewCity
