/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState, useMemo } from "react";
import { Container } from "@mui/material";
import { IconContext } from "react-icons";
import { useParams } from "react-router-dom";
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
						<section className="citySection">
							<div className="container">
								<div className="grid-container">
									<div className="content">
										<div className="text-content">
											<h1 className="title">{city?.name}</h1>
											<p className="location">{city?.country.name}</p>
											<p className="population">
												Population: {city?.population}
											</p>
										</div>
									</div>
									<div
										className="image-container"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
										dangerouslySetInnerHTML={{ __html: city?.coaSVG ?? "" }}
									/>
								</div>
							</div>
						</section>
						<section className="citySection">
							<div className="container grid-layout">
								<div className="text-content">
									<h2 className="title">Description</h2>
									<p className="description">{city?.description}</p>
									<div className="features-culture">
										<div className="features">
											<h3 className="subtitle">Features</h3>
											<ul className="list">
												{city?.features.map((feature) => (
													<li key={feature}>{feature}</li>
												))}
											</ul>
										</div>
										<div className="culture">
											<h3 className="subtitle">Culture</h3>
											<p>get culture information and render it here:</p>
										</div>
									</div>
								</div>
								<div className="text-content">
									<h2 className="title">&nbsp;</h2>
									<p className="description">{city?.description}</p>
									<div className="features-culture">
										<div className="features">
											<h3 className="subtitle">Tags</h3>
											<ul className="list">
												{city?.features.map((feature) => (
													<li key={feature}>{feature}</li>
												))}
											</ul>
										</div>
										<div className="culture">
											<h3 className="subtitle">Map Link</h3>
											<p>render Map link here</p>
										</div>
									</div>
								</div>
							</div>
						</section>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CityView;
