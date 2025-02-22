/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState, useMemo } from "react";
import { Container, Typography } from "@mui/material";
import { IconContext } from "react-icons";
import { useParams, Link } from "react-router-dom";
import { getDataFromStore } from "../../db/interactions";

import "./city.css";

function CityView() {
	const cityId = useParams();
	const [city, setCity] = useState<TLCity>();

	useEffect(() => {
		if (cityId !== undefined) {
			getDataFromStore("cities", cityId._id).then((data) => {
				setCity(data as TLCity);
			});
		}
	}, [cityId]);

	const IconStyles = useMemo(() => ({ size: "1.5rem" }), []);
	console.log(JSON.stringify(city));

	return (
		<Container className="Settings">
			<IconContext.Provider value={IconStyles}>
				<div className="contentSubBody">
					<div className="flex-container">
						<div className="city-wiki">
							<div className="city-header">
								<div
									className="city-image"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
									dangerouslySetInnerHTML={{ __html: city?.coaSVG ?? "" }}
								/>
								<div className="city-info">
									<Typography variant="h1">{city?.name}</Typography>
									<div className="city-meta">
										<p>
											<Typography color="primary" component="h3">
												Country: {city?.country.name}
											</Typography>
											<Typography color="primary" component="h3">
												Population: {city?.population}
											</Typography>
											<Typography color="primary" component="h3">
												Size: {city?.size}
											</Typography>
											{city?.capital && (
												<Typography
													color="primary"
													component="h3"
													className="capital-badge"
												>
													Capital
												</Typography>
											)}
										</p>
									</div>
								</div>
							</div>

							<main className="city-content">
								<section className="description">
									<Typography color="primary" component="h2">
										Description
									</Typography>
									<Typography color="primary" component="p">
										{city?.description && city?.description.length > 0
											? city?.description
											: `${city?.name} is a ${city?.size.toLowerCase()} in ${city?.country.name}.`}
									</Typography>
								</section>

								<div className="content-grid">
									<section className="features">
										<Typography color="primary" component="h2">
											Features
										</Typography>
										<Typography color="primary" component="ul">
											{city?.features.map((feature, index) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												<li key={index}>{feature}</li>
											))}
										</Typography>
									</section>

									<section className="tags">
										<Typography color="primary" component="h2">
											Tags
										</Typography>
										<div className="tag-list">
											{city?.tags.map((tag) => (
												<Typography
													component="span"
													color="primary"
													key={tag._id}
													className="tag"
													title={tag.Description}
												>
													{tag.Name}
												</Typography>
											))}
										</div>
									</section>

									<section className="map-link">
										<Typography color="primary" component="h2">
											Map
										</Typography>
										{city?.mapLink && (
											<Link
												to={city.mapLink}
												target="_blank"
												rel="noopener noreferrer"
											>
												View City Map
											</Link>
										)}
									</section>

									<section className="additional-info">
										<Typography color="primary" component="h2">
											Additional Information
										</Typography>
										<Typography color="primary" component="p">
											Map ID: {city?.mapId}
										</Typography>
										<Typography color="primary" component="p">
											Map Seed: {city?.mapSeed}
										</Typography>
										<Typography color="primary" component="p">
											City Type: {city?.type}
										</Typography>
										<Typography color="primary" component="p">
											Culture ID: {city?.culture.id}
										</Typography>
									</section>
								</div>
							</main>
						</div>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CityView;
