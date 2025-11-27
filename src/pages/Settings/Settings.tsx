import { Container } from "@mui/material";
import type { Context } from "../../definitions/Common";
import { useEffect, useMemo, useState } from "react";
import { IconContext } from "react-icons";

import "./Settings.css";

import MapManager from "../../components/MapManager/index.tsx";
import UploadMap from "../../components/UploadMap/UploadMap.tsx";
import { useOutletContext } from "react-router-dom";

import { getAppSettings, setTheme } from "../../db/appSettings";
import type { AppInfo } from "../../definitions/AppInfo";

function Settings(): JSX.Element {
	const [app, setApp] = useState<AppInfo | null>(null);

	const { mapsList }: Context = useOutletContext();

	const IconStyles = useMemo(() => ({ size: "1.5rem" }), []);

	// Load current app settings from IndexedDB
	useEffect(() => {
		(async () => {
			const s = await getAppSettings();
			setApp(s);
		})();
	}, []);

	const updateTheme = (newTheme: "light" | "dark") => {
		setApp((prev) => {
			if (!prev) return prev;
			const next = {
				...prev,
				userSettings: { ...prev.userSettings, theme: newTheme },
			};
			// persist using the same object we just committed to state (no stale reads)
			void setTheme(newTheme);
			// notify the app so MainLayout can swap themes immediately
			window.dispatchEvent(
				new CustomEvent("theme-change", { detail: { theme: newTheme } }),
			);
			return next;
		});
	};

	return (
		<Container className="Settings">
			<IconContext.Provider value={IconStyles}>
				<form>
					<div className="contentSubBody">
						<div className="section">
							{mapsList.length > 0 ? (
								<span id="MapsList">
									<MapManager />
								</span>
							) : (
								<UploadMap />
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
									onChange={(e) =>
										updateTheme(e.target.value as "light" | "dark")
									}
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
					</div>
				</form>
			</IconContext.Provider>
		</Container>
	);
}

export default Settings;
