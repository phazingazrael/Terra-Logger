import { Button, Grid2 as Grid, Modal, Box } from "@mui/material";
import { useState } from "react";
import { useDB } from "../../db/DataContext";
import {
	deleteDataFromStore,
	deleteDataFromStoreByMapId,
} from "../../db/interactions.tsx";

import "./index.css";
import { MapsCard } from "../Cards/index.tsx";
import UploadMap from "../UploadMap/UploadMap.tsx";
import shadows from "@mui/material/styles/shadows";
import { useOutletContext } from "react-router-dom";
import type { Context } from "../../definitions/Common.ts";

// import type { MapInf } from "../../definitions/TerraLogger.ts";

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: shadows[24],
	p: 4,
};

const MapManager: React.FC = () => {
	const { activeMapId, setActive } = useDB();
	const { mapsList }: Context = useOutletContext();
	const [selectedMaps, setSelectedMaps] = useState<string[]>([]);

	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleMapSelect = (mapId: string) => {
		if (selectedMaps.includes(mapId)) {
			setSelectedMaps(selectedMaps.filter((id) => id !== mapId));
		} else {
			setSelectedMaps([...selectedMaps, mapId]);
		}
	};

	const handleDeleteMaps = async (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();
		const allPromises = selectedMaps.map(async (mapId) => {
			// TODO: implement NPCs

			await deleteDataFromStoreByMapId("cities", "mapIdIndex", mapId);
			await deleteDataFromStoreByMapId("countries", "mapIdIndex", mapId);
			await deleteDataFromStoreByMapId("cultures", "mapIdIndex", mapId);
			await deleteDataFromStoreByMapId("notes", "mapIdIndex", mapId);
			await deleteDataFromStoreByMapId("religions", "mapIdIndex", mapId);
			await deleteDataFromStoreByMapId("nameBases", "mapIdIndex", mapId);

			await deleteDataFromStore("maps", mapId);
		});

		await Promise.all(allPromises);

		// If the active map was deleted, pick a new one if available
		if (selectedMaps.includes(activeMapId ?? "")) {
			// const remaining = mapsList.filter(
			// 	(m: MapInf) => !selectedMaps.includes(m.mapId),
			// );
			// if (remaining.length > 0) {
			// 	await setActive(remaining[0].mapId);
			// }
			await setActive("");
		}

		const mapElement = document.getElementById("map");

		if (mapElement) {
			mapElement.remove();
		}

		setSelectedMaps([]);
	};

	return (
		<div>
			<h4>Saved maps</h4>
			<Grid container spacing={2}>
				{mapsList.map((map) => (
					<Grid size={3} key={map.id} id={map.id}>
						<MapsCard {...map} handleMapSelect={handleMapSelect} />
					</Grid>
				))}
			</Grid>
			<br />
			{selectedMaps.length > 0 ? (
				<Button
					variant="contained"
					color="error"
					onClick={handleDeleteMaps}
					disabled={selectedMaps.length === 0}
				>
					Delete Selected Maps
				</Button>
			) : (
				""
			)}
			<Button
				variant="contained"
				onClick={() => {
					handleOpen();
					setTimeout(() => {
						handleClose();
					}, 10000);
				}}
			>
				Upload New Map
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={modalStyle} className="UploadMap-modal">
					<UploadMap />
				</Box>
			</Modal>
		</div>
	);
};

export default MapManager;
