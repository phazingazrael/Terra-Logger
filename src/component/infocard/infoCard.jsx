import './infoCard.css';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';

import Grid from '@mui/material/Grid';

const InfoCard = () => {

	useEffect(() => {

	}, []);


	return (
		<Grid item xs={8}>
			<article>
				<figure id='COA'>
					{/*enter coa code here*/}
				</figure>

				<div>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti repellat, consequuntur doloribus voluptate esse iure?
					</p>
					<h1>
						Marvellous Macaw
					</h1>
				</div>
			</article>
		</Grid>
	);
}

export default InfoCard;