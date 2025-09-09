import { Container } from "@mui/material";
import type { Context } from "../../definitions/Common";
import { useMemo } from "react";
import { IconContext } from "react-icons";
import { useRecoilState } from "recoil";

import "./Settings.css";
import Package from "../../../package.json"

import appAtom from "../../atoms/app.tsx";
import MapManager from "../../components/MapManager/index.tsx";
import UploadMap from "../../components/UploadMap/UploadMap.tsx";
import { useOutletContext } from "react-router-dom";
import { updateDataInStore } from "../../db/interactions.tsx";

function Settings(): JSX.Element {
	const [app, setApp] = useRecoilState(appAtom);
	const { userSettings } = app;

	const { mapsList }: Context = useOutletContext();

	const IconStyles = useMemo(() => ({ size: "1.5rem" }), []);

  const updateTheme = async (newTheme:string) => {
    setApp((prev)=>({
      ...prev,
      userSettings:{
        ...prev.userSettings,
        theme: newTheme,
      },
    }));

    updateDataInStore("appSettings", `TL_${Package.version}`,{
      ...app,
      userSettings:{
        ...app.userSettings,
        theme:newTheme,
      },
    })
  }


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
									value={userSettings.theme}
									onChange={(e) =>updateTheme(e.target.value)}
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
									{`${app.userSettings.screen.outerWidth} x ${app.userSettings.screen.outerHeight}`}
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
