import './infoCard.css';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';

import { Card, fr, Flex, Button, ActionButton, Image, Text } from "@prismane/core";
import { Heart } from "@phosphor-icons/react";

import opacify from 'opacify';
import invert from 'invert-color';




const CountryInfoCard = ({ mapData, setMap, isLoading, setLoading }) => {
	useEffect(() => {

	}, []);


	return (
		<div className="container">
			{mapData.Locations.countries.map((element, index) => (
				<div key={index}>
					<Card w={fr(67)} m={fr(3)} p={fr(5)} style={{ backgroundColor: opacify.hexToRgba(element.color ? (element.color) : ("#231e39"), 0.7), float: "left", color: element.color ? (invert(element.color, true)) : ("#b3b8cd") }} key={index}>
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
						<Card.Footer direction="column" gap={fr(3)} className="skills">
							<Text as="h6">Skills</Text>
							<Text>
								<ul>
									<li>Front End Development</li>
									<li>HTML</li>
									<li>CSS</li>
									<li>JavaScript</li>
									<li>React</li>
									<li>Node</li>
								</ul>
							</Text>
						</Card.Footer>
					</Card>

				</div>
			))
			}
		</div>
	);
}

export default CountryInfoCard;