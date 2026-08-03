import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { type JSX, useEffect, useState } from "react";
import type { Context } from "../../definitions/Common";

import "./Settings.css";

import { useOutletContext } from "react-router-dom";
import MapManager from "../../components/MapManager/index";
import UploadMap, { type MapImportSummary } from "../../components/UploadMap/UploadMap";
import ImportSummaryContent from "../../components/UploadMap/ImportSummaryContent";

import { getAppSettings, setTheme } from "../../db/appSettings";
import { useDB } from "../../db/DataContext";
import type { AppInfo } from "../../definitions/AppInfo";
import GeneratorCatalogSettings from "./GeneratorCatalogSettings";

function Settings(): JSX.Element {
	const [app, setApp] = useState<AppInfo | null>(null);
	const [importSummary, setImportSummary] = useState<MapImportSummary | null>(null);
	const [isOpeningImportedMap, setOpeningImportedMap] = useState(false);
	const { setActive } = useDB();

	const { mapsList, setThemeName }: Context = useOutletContext();

	// Load current app settings from IndexedDB
	useEffect(() => {
		(async () => {
			const s = await getAppSettings();
			setApp(s);
		})();
	}, []);


	const handleImportSummary = (summary: MapImportSummary) => {
		// MainLayout's Content paper is the Settings page scroll container.
		document.querySelector<HTMLElement>(".Content")?.scrollTo({ top: 0 });
		setImportSummary(summary);
	};

	const openImportedMap = async () => {
		if (!importSummary || isOpeningImportedMap) return;

		setOpeningImportedMap(true);
		try {
			await setActive(importSummary.mapId);
			setImportSummary(null);
		} finally {
			setOpeningImportedMap(false);
		}
	};

	const updateTheme = (newTheme: "light" | "dark") => {
		setApp((prev) => {
			if (!prev) return prev;
			const next = {
				...prev,
				userSettings: { ...prev.userSettings, theme: newTheme },
			} as AppInfo;
			// persist using the same object we just committed to state (no stale reads)
			void setTheme(newTheme);

			// tell the layout to swap themes immediately (no global events)
			setThemeName(newTheme);

			return next;
		});
	};

	return (
		<Container className="Settings">
			<div className="contentSubBody">
				<div className="section">
					{mapsList.length > 0 ? (
						<span id="MapsList">
							<MapManager onImportSummary={handleImportSummary} />
						</span>
					) : (
						<UploadMap onImportSummary={handleImportSummary} />
					)}
				</div>

				<div className="section">
					<h4>General & Appearance Settings</h4>
					<div>
						<label htmlFor="themeSelect">Theme</label>
						<select
							id="themeSelect"
							className="select"
							value={app?.userSettings?.theme ?? "light"}
							onChange={(e) => updateTheme(e.target.value as "light" | "dark")}
						>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</select>
					</div>
				</div>

				<div className="section">
					<h4>Display Settings</h4>
					<div className="sectionAlt">
						<label htmlFor="screenSize" style={{ marginRight: "10px" }}>
							Screen Size
						</label>
						<span id="screenSize">
							{app
								? `${app.userSettings.screen.outerWidth} x ${app.userSettings.screen.outerHeight}`
								: "—"}
						</span>
					</div>
				</div>

				<div className="section">
					<GeneratorCatalogSettings />
				</div>
			</div>

			<Dialog
				open={importSummary !== null}
				onClose={(_, reason) => {
					if (reason !== "backdropClick" && !isOpeningImportedMap) {
						setImportSummary(null);
					}
				}}
				disableEscapeKeyDown={isOpeningImportedMap}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle>Map Import Complete</DialogTitle>
				<DialogContent dividers>
					<ImportSummaryContent summary={importSummary} />
				</DialogContent>
				<DialogActions>
					<Button
						variant="contained"
						onClick={() => void openImportedMap()}
						disabled={isOpeningImportedMap}
					>
						{isOpeningImportedMap ? "Opening Map..." : "Open Map"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

export default Settings;
