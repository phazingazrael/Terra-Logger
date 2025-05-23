import { Container, Grid2 as Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { queryDataFromStore } from "../../db/interactions";

import { ReligionCard } from "../../components/Cards";

import type { TLReligion } from "../../definitions/TerraLogger";

function ReligionsPage() {
	const [map] = useRecoilState(mapAtom);
	const [religions, setReligions] = useState<TLReligion[]>([]);
	const { mapId } = map;
	useEffect(() => {
		const initializeDatabase = async () => {
			try {
				const database = await initDatabase();
				if (database) {
					console.info("Database initialized");
				}
			} catch (error) {
				console.error(error);
			}
		};

		initializeDatabase();
	}, []);

	useEffect(() => {
		const loadReligions = async () => {
			const data = await queryDataFromStore("religions", "mapIdIndex", mapId);
			if (data) {
				setReligions(data);
			}
		};

		loadReligions();
	}, [mapId]);
	return (
		<Container>
			<div className="contentSubHead">
				<h3>Religions</h3>
			</div>
			<div className="contentSubBody">
				<Grid container spacing={2}>
					{religions.map((entry) => (
						<Grid size={3} key={entry._id} id={entry._id}>
							<ReligionCard {...entry} />
						</Grid>
					))}
				</Grid>
			</div>
		</Container>
	);
}

export default ReligionsPage;
