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
    FaUsers,
    FaCity
} from "react-icons/fa6";

import {
    GiCrossedSwords,
    GiDramaMasks,
    GiUncertainty,
    GiThreeFriends,
    GiCrown,
    GiSwordsEmblem,
    GiBowArrow,
    GiHorseHead,
    GiRollingBomb,
    GiShipBow,
    GiAxeSword
} from "react-icons/gi";


import "./viewStyles.css"



const ViewCountry = () => {
    // Access the ID parameter from the URL
    const { _id } = useParams();

    const [mapInfo, setMapInfo, appInfo, theme] = useOutletContext();
    const country = mapInfo.countries.find(country => country._id === _id);

    if (!appInfo) console.log(setMapInfo, appInfo);

    function getStatusIcon(status) {
        switch (status) {
            case "Ally":
                return <GiThreeFriends />;
            case "Enemy":
                return <GiCrossedSwords />;
            case "Rival":
                return <GiDramaMasks />;
            case "Unknown":
                return <GiUncertainty />;
            default:
                return <GiCrown />;
        }
    }
    function getMilitaryIcon(icon) {
        switch (icon) {
            case "\u2694\uFE0F": // Unicode for ⚔️
                return <GiSwordsEmblem />;
            case "\uD83C\uDFA1": // Unicode for 🏹
                return <GiBowArrow />;
            case "\uD83D\uDC34": // Unicode for 🐴
                return <GiHorseHead />;
            case "\uD83D\uDCA3": // Unicode for 💣
                return <GiRollingBomb />;
            case "\uD83C\uDF0A": // Unicode for 🌊
                return <GiShipBow />;
            case "\uD83D\uDC51": // Unicode for 👑
                return <GiCrown />;
            default:
                return <GiAxeSword />;
        }
    }

    return (
        <div className='contentSubBody'>
            <IconContext.Provider value={{ size: '1.5rem', color: theme.palette.mode == "light" ? theme.palette.primary.dark : theme.palette.text.primary }}>
                <Grid container spacing={3} justifyContent="center" className="countryDisplay">
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" gutterBottom>

                                    <img
                                        src={"https://armoria.herokuapp.com/?coa=" + encodeURIComponent(JSON.stringify(country.coa))}
                                        alt={country.name + " Coat of Arms"}
                                        title={country.name + " Coat of Arms"}
                                        style={{ verticalAlign: 'middle', marginRight: '10px', float: "left", maxWidth: "50px" }} />
                                    {country.name} <span style={{ fontSize: '22px' }}>({country.fullName})</span>
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {country.description}
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
                                <Typography variant="subtitle1">
                                    <ListItemIcon>
                                        <FaMapLocation />
                                    </ListItemIcon>
                                    Location: {mapInfo.info.mapName}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <ListItemIcon>
                                        <FaCrown />
                                    </ListItemIcon>
                                    Ruler: {country.political.ruler}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <ListItemIcon>
                                        <FaMoneyBillTransfer />
                                    </ListItemIcon>
                                    Economy: {country.economy.description}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    <ListItemIcon>
                                        <FaPeopleGroup />
                                    </ListItemIcon>
                                    Population:
                                    <ListItem>
                                        Rural: {country.population.rural}<br />
                                        Urban: {country.population.urban}<br />
                                        Total: {country.population.total}
                                    </ListItem>
                                </Typography>
                                <Typography variant="h5" gutterBottom>
                                    Government Structure:
                                </Typography>
                                <Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemText primary={country.political.form + " (" + country.political.formName + ")"} />
                                        </ListItem>
                                    </List>
                                </Typography>
                                <Typography variant="h5" gutterBottom>
                                    Key Figures:
                                </Typography>
                                <Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <FaCrown />
                                            </ListItemIcon>
                                            <ListItemText primary={country.political.ruler} secondary="Ruler of the country." />
                                        </ListItem>
                                        {/* Map over leaders array here */}
                                        <ListItem>
                                            <ListItemIcon>
                                                <FaUsers />
                                            </ListItemIcon>
                                            <ListItemText primary="Council of Nobles" secondary="Advisory body to the monarch." />
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
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                {/* Diplomacy Section */}
                                <Typography variant="h5" gutterBottom>
                                    Diplomatic Relations
                                </Typography>
                                <List dense>
                                    {country.political.diplomacy.map((relationship) => (
                                        <ListItem key={relationship.id}>
                                            <ListItemIcon>
                                                {getStatusIcon(relationship.status)}
                                            </ListItemIcon>
                                            <ListItemText primary={relationship.name} secondary={`Status: ${relationship.status}`} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                {/* Military Section */}
                                <Typography variant="h5" gutterBottom>
                                    Military Regiments
                                </Typography>
                                <List dense>
                                    {country.political.military.map((unit, index) => (
                                        <ListItem id={unit._id} key={index}>
                                            <ListItemIcon>
                                                {getMilitaryIcon(unit.icon)}
                                            </ListItemIcon>
                                            <ListItemText primary={unit.name} secondary={`Total Units: ${unit.a}`} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                {/* Neighbors Section */}
                                <Typography variant="h5" gutterBottom>
                                    Neighboring Countries
                                </Typography>
                                <List dense>
                                    {country.political.neighbors.map((neighbor) => (
                                        <ListItem key={neighbor.id}>
                                            <ListItemIcon>
                                                <FaCity />
                                            </ListItemIcon>
                                            <ListItemText primary={neighbor.name} />
                                        </ListItem>
                                    ))}
                                </List>
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
        </div>
    )
}

export default ViewCountry
