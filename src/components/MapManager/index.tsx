import { Button, Dialog, DialogContent, Grid, Stack } from "@mui/material";
import { lazy, useState } from "react";
import { useDB } from "../../db/DataContext";
import { deleteEntireMapData } from "../../db/interactions";

import "./index.css";
import { useOutletContext } from "react-router-dom";
import type { Context } from "../../definitions/Common";
import UploadMap, { type MapImportMode, type MapImportSummary } from "../UploadMap/UploadMap";

const MapsCard = lazy(() => import("../../components/Cards/maps"));

type MapManagerProps = {
	onImportSummary: (summary: MapImportSummary) => void | Promise<void>;
};

const MapManager: React.FC<MapManagerProps> = ({ onImportSummary }) => {
	const { activeMapId, setActive } = useDB();
	const { mapsList, reloadMapsList }: Context = useOutletContext();
	const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
	const [uploadMode, setUploadMode] = useState<MapImportMode>({
		kind: "create",
	});
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleImportSummary = async (summary: MapImportSummary) => {
		setSelectedMaps([]);
		handleClose();
		await onImportSummary(summary);
	};

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
			await setActive(null);
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
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				maxWidth="lg"
				className="UploadMap-modal"
				aria-labelledby="map-upload-dialog-title"
				slotProps={{
					paper: {
						sx: {
							maxHeight: "calc(100dvh - 64px)",
							overflow: "hidden",
						},
					},
				}}
			>
				<DialogContent sx={{ p: { xs: 1, sm: 2 }, overflowY: "auto" }}>
					<Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
						<Button onClick={handleClose} disabled={false}>Close</Button>
					</Stack>
					<UploadMap
						mode={uploadMode}
						showDemoButton={uploadMode.kind === "create"}
						onImportSummary={handleImportSummary}
					/>
				</DialogContent>
			</Dialog>

		</div>
	);
};

export default MapManager;
