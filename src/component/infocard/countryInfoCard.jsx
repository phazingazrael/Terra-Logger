import './infoCard.css';
import * as React from 'react';
import { useState, useEffect, useMemo, useReducer } from 'react';
import { Link } from 'react-router-dom';

import {
	Card,
	CardHeader,
	CardMedia,
	CardContent,
	CardActions,
	Grid,
	Typography,
	Box,
	List,
	ListItem,
	ListItemText,
	Divider,
	Button
} from '@mui/material';

import ReactFlipCard from 'reactjs-flip-card'

import opacify from 'opacify';

import { UsersFour, Buildings, Eye } from '@phosphor-icons/react';

//import { Heart } from "@phosphor-icons/react";




const CountryInfoCard = ({ Countries }) => {
	const [_, forceUpdate] = useReducer((x) => x + 1, 0);
	const styles = {
		card: { width: "auto", height: "auto" },
	}

	const [mapData, setMap] = useState(
		JSON.parse(localStorage.getItem("mapParsed"))
	)

	function removeObjectWithId(arr, id) {
		const objWithIdIndex = arr.findIndex((obj) => obj._id === id);

		if (objWithIdIndex > -1) {
			arr.splice(objWithIdIndex, 1);
		}

		localStorage.setItem("mapParsed", JSON.stringify(mapData));
		setMap(mapData);

		return arr;
	}

	const delCountry = (data) => {
		console.log('saving data');
		let upd_obj = mapData.Locations.countries.findIndex((obj => obj._id === data._id));
		let tMap = mapData.Locations.countries;
		tMap.splice(upd_obj, 1);
		localStorage.setItem("mapParsed", JSON.stringify(mapData));
		setMap();
		setMap(JSON.parse(localStorage.getItem("mapParsed")));
		setLoading(false);
	};

	useEffect(() => {
	}, [mapData, setMap]);

	return (
		<div className="cardContainer">
			<Grid container spacing={3} className='cardGrid'>
				{Countries.map((element, index) => (
					<Grid item xs={3} key={index} id={element._id} className='cardItem' >
						<ReactFlipCard
							frontStyle={styles.card}
							backStyle={styles.card}
							flipTrigger='onClick'
							frontComponent={<Card className="countryCard front" variant="outlined" style={{ backgroundColor: opacify.hexToRgba("#FFFFFF", 0.7) }} >
								<CardHeader
									title={element.name}
									subheader={element.fullName}
									className='cardHead'
								/>
								<CardMedia
									component="img"
									height="150"
									style={{ backgroundColor: opacify.hexToRgba(element.color ? (element.color) : ("#231e39"), 0.7), objectFit: "contain" }}
									image={element.coa === undefined ? ("https://armoria.herokuapp.com/?size=500&format=svg") : ("https://armoria.herokuapp.com/?coa=" + JSON.stringify(element.coa))}
									alt={element.fullName + " Coat of Arms"}
									className='cardMedia'
								/>
								<CardContent className='cardContent'>
									<Typography variant="body2" color="text.secondary">
										{element.description}
									</Typography>
								</CardContent>
								<CardActions disableSpacing className='cardActions'>
									<Box display={'flex'}>
										<Box p={1} flex={'auto'} className="actionItem">
											<p className="statLabel"><UsersFour size={16} /></p>
											<p className="statLabel">Population</p>
											<p className="statValue">{element.population.total}</p>
										</Box>
										<Box p={1} flex={'auto'} className="actionItem border-gradient">
											<p className="statLabel"><Buildings size={16} /></p>
											<p className="statLabel">Cities</p>
											<p className="statValue">{element.cities.length}</p>
										</Box>
									</Box>
								</CardActions>
							</Card>}
							backComponent={<Card className="countryCard back" variant="outlined" style={{ backgroundColor: opacify.hexToRgba("#FFFFFF", 0.7) }} >
								<CardHeader
									title={element.name}
									subheader={element.fullName}
									className='cardHead'
								/>
								<CardContent className='cardContent'>
									<List sx={{ width: '100%', bgcolor: 'background.paper' }} className="cardList">
										<ListItem className="cardListItem">
											<ListItemText primary={"Culture: " + element.culture} />
										</ListItem>
										<Divider />
										<ListItem className="cardListItem">
											<ListItemText primary="Population" />
										</ListItem>
										<ListItem className="cardListItem">
											<ListItemText primary={"Rural: " + element.population.rural} />
										</ListItem>
										<ListItem className="cardListItem">
											<ListItemText primary={"Urban: " + element.population.urban} />
										</ListItem>
										<ListItem className="cardListItem">
											<ListItemText primary={"Total: " + element.population.total} />
										</ListItem>
										<Divider />
										<ListItem className="cardListItem">
											<ListItemText primary="Political Information" />
										</ListItem>
										<ListItem className="cardListItem">
											<ListItemText primary={"Govt Form: " + element.political.form} />
										</ListItem>
										<ListItem className="cardListItem">
											<ListItemText primary={"Neighbors: " + element.political.neighbors.length} />
										</ListItem>
										<ListItem className="cardListItem">
											<ListItemText primary={"Allies: " + element.political.diplomacy.filter(obj => {
												return obj.status === "Ally"
											}).length} />
										</ListItem>
									</List>
								</CardContent>
								<CardActions disableSpacing className='cardActions buttons'>
									<Link to={"/main_window/countries/" + `${element._id}` + "/edit"}>
										<Button variant="contained" color="success" onClick={() => console.log("edit")}>Edit</Button>
									</Link>
									<Link to={"/main_window/countries/" + `${element._id}` + "/view"}>
										<Button variant="contained" onClick={() => console.log("/country/" + element._id + "/view")}>View</Button>
									</Link>
									<Button variant="contained" color="error" onClick={() => (
										setTimeout(5000,
											delCountry(element),
											forceUpdate()
										)
									)}>Delete</Button>
								</CardActions>
							</Card>}
						/>
					</Grid>
				))
				}
			</Grid>
		</div>
	);
}

export default CountryInfoCard;