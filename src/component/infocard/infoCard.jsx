import './infoCard.css';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';

import invert from 'invert-color';



const tempData = [
	{
		"id": "b32b3e08-38ac-4ec0-8380-2005f5453e74",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "f83dd608-2427-4798-a838-fa3748b91956",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "6dc85977-f777-43af-943c-092c9372ad5d",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "1d35408b-f23c-45d3-8c7b-de8d7521c023",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "a7922a91-eb46-446a-b7f9-222024d49ab7",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "a8b52770-6ba7-479a-9904-6b4cc3483f18",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "c08390af-62db-4e41-8121-7747365bf125",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "1a45e877-f283-4d45-aa6d-cdbcd42204c7",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "d09ae4d3-97b9-4036-a7d7-f824766ff3a4",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "52e3411d-1cdf-4c30-aa4d-0c3ff0893bc1",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "5a239b02-3a5c-49c6-8784-69e6157cf976",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "764a7918-fb18-41c6-aa5a-bb8ddaad8ff9",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "89b4253b-c840-4f10-82d0-15505a4c028a",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "5182de91-defd-4840-9f51-9928b02cc6b5",
		"name": "John Doe",
		"age": 28
	},
	{
		"id": "22d95770-0422-4171-a83b-bb633a4aac4a",
		"name": "John Doe",
		"age": 28
	}
]

let url = "https://armoria.herokuapp.com/?size=500&format=svg";
//let url = "https://armoria.herokuapp.com/?coa=" + JSON.stringify(City.coa);

/* if (City.coa !== undefined) {
	getCoa();
} else {
	City.coa = "";
	//getCoa();
} */

const InfoCard = ({ map, setMap }) => {
	console.log(JSON.stringify(map.info));
	useEffect(() => {

	}, []);

	function randomColor() {
		Math.floor(Math.random() * 16777215).toString(16);
	}



	return (
		<div className="container">
			{map.cells.states.map((element, index) => (
				<div key={index} class="card-container">
					{
						element.coa === undefined ? (
							<img className="round coa" src="https://armoria.herokuapp.com/?size=500&format=svg" />
						) : (
							<img className="round coa" src={"https://armoria.herokuapp.com/?coa=" + JSON.stringify(element.coa)} />
						)
					}
					<h3>{element.fullName}</h3>
					<h6>{element.name}</h6>
					<p>"element.description"</p>
					<div class="skills">
						<h6>Skills</h6>
						<ul>
							<li>UI / UX</li>
							<li>Front End Development</li>
							<li>HTML</li>
							<li>CSS</li>
							<li>JavaScript</li>
							<li>React</li>
							<li>Node</li>
						</ul>
					</div>
				</div>
			))
			}
		</div>
	);
}

export default InfoCard;