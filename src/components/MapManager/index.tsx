import { Button, Grid, Modal, Box, Stack } from "@mui/material";
import { lazy, useState } from "react";
import { useDB } from "../../db/DataContext";
import { deleteEntireMapData } from "../../db/interactions";

import "./index.css";
import { ModalStyle } from "../../styles";
import UploadMap, { type MapImportMode } from "../UploadMap/UploadMap";
import { useOutletContext } from "react-router-dom";
import type { Context } from "../../definitions/Common";

const MapsCard = lazy(() => import("../../components/Cards/maps"));

const MapManager: React.FC = () => {
	const { activeMapId, setActive } = useDB();
	const { mapsList, reloadMapsList }: Context = useOutletContext();
	const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
	const [uploadMode, setUploadMode] = useState<MapImportMode>({
		kind: "create",
	});

	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const openCreateUpload = () => {
		setUploadMode({ kind: "create" });
		handleOpen();
	};

	const openUpdateUpload = () => {
		if (selectedMaps.length !== 1) {
			return;
		}

		setUploadMode({
			kind: "update",
			expectedMapId: selectedMaps[0],
		});

		handleOpen();
	};

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

		await Promise.all(selectedMaps.map((mapId) => deleteEntireMapData(mapId)));

		await reloadMapsList();

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
			<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
				{selectedMaps.length > 0 ? (
					<>
						<Button
							variant="contained"
							color="error"
							onClick={handleDeleteMaps}
							disabled={selectedMaps.length === 0}
						>
							Delete Selected Maps
						</Button>

						<Button
							variant="contained"
							color="warning"
							onClick={openUpdateUpload}
							disabled={selectedMaps.length !== 1}
						>
							Update Selected Map
						</Button>
					</>
				) : null}
				<Button variant="contained" onClick={openCreateUpload}>
					Upload New Map
				</Button>
			</Stack>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={ModalStyle} className="UploadMap-modal">
					<UploadMap
						mode={uploadMode}
						showDemoButton={uploadMode.kind === "create"}
						onComplete={async () => {
							await reloadMapsList();
							setSelectedMaps([]);
							handleClose();
						}}
					/>
				</Box>
			</Modal>
		</div>
	);
};

export default MapManager;
