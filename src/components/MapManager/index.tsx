import { Button, Grid2 as Grid, Modal, Box } from "@mui/material";
import { useState } from "react";
import { useDB } from "../../db/DataContext";
import {
	deleteDataFromStore,
	deleteDataFromStoreByMapId,
} from "../../db/interactions";

import "./index.css";
import { ModalStyle } from "../../styles";
import { MapsCard } from "../Cards/index";
import UploadMap from "../UploadMap/UploadMap";
import { useOutletContext } from "react-router-dom";
import type { Context } from "../../definitions/Common";

// import type { MapInf } from "../../definitions/TerraLogger";

const MapManager: React.FC = () => {
	const { activeMapId, setActive } = useDB();
	const { mapsList, reloadMapsList }: Context = useOutletContext();
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

		// ensure the sidebar list reflects deletions immediately
		await reloadMapsList();

		// if the active map was deleted, clear it
		if (selectedMaps.includes(activeMapId ?? "")) {
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
				<Box sx={ModalStyle} className="UploadMap-modal">
					<UploadMap />
				</Box>
			</Modal>
		</div>
	);
};

export default MapManager;
