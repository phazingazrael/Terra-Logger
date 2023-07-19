import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';



export default function InfoCard(element) {


    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: element.color }} aria-label="recipe">
                        {element.name}
                    </Avatar>
                }
                title={element.fullName}
                subheader={element.name}
            />
            <CardMedia
                component="img"
                height="194"
                image={element.coa}
                alt={element.fullName + " Coat of Arms"}
            />
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    {element.description}
                </Typography>
            </CardContent>
            <CardActions disableSpacing>
                put icons for settings, viewing etc here.
            </CardActions>
        </Card>


                <Card w={fr(58)} m={fr(3)} p={fr(5)} style={{ backgroundColor: opacify.hexToRgba(element.color ? (element.color) : ("#231e39"), 0.7), float: "left", color: element.color ? (invert(element.color, true)) : ("#b3b8cd") }} key={index}>
						<Card.Header>
							<Image
								src={element.coa === undefined ? ("https://armoria.herokuapp.com/?size=500&format=svg") : ("https://armoria.herokuapp.com/?coa=" + JSON.stringify(element.coa))}
								alt={element.name}
								w="100%"
								br="base"
								className="coa"
							/>
						</Card.Header>
						<Flex direction="column" gap={fr(2)} className="CardHead">
							<Text as="h2" style={{ color: element.textColor }}>{element.fullName}</Text>
							<Text>
								{element.description}
							</Text>
						</Flex>
						<Card.Footer direction="column" gap={fr(3)} className="details">
							<Text as="h6">Details</Text>
							<Text>
								<ul>
									<li>Population: {element.population.total}</li>
									<li>Cities: {element.cities.length}</li>
									<li>Wars: {element.warCampaigns.length}</li>
									<li>Government: {element.form}</li>
									<li>Culture: {element.culture}</li>
									<li>Type: {element.type}</li>
								</ul>
							</Text>
						</Card.Footer>
					</Card>

    );
}