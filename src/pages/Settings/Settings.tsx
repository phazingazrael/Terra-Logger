import {
	Checkbox,
	Container,
	FormControlLabel,
	FormGroup,
} from "@mui/material";
import type { Context } from "../../definitions/Common";
import { useMemo, useState } from "react";
import { IconContext } from "react-icons";
import { useRecoilState } from "recoil";

import "./Settings.css";

import appAtom from "../../atoms/app.tsx";
import MapManager from "../../components/MapManager/index.tsx";
import UploadMap from "../../components/UploadMap/UploadMap.tsx";
import { useOutletContext } from "react-router-dom";

function Settings(): JSX.Element {
	const [app, setApp] = useRecoilState(appAtom);
	const { userSettings } = app;
	const [selectAllDefaults, setSelectAllDefaults] = useState(false);
	const [defaults, setDefaults] = useState<Array<string>>([]);

	const { mapsList }: Context = useOutletContext();

	const defaultExports: Array<string> = [
		"Cities",
		"Countries",
		"Religions",
		"Cultures",
		"NPCs",
		"Governments",
		"Notes",
		"Map SVG",
		"Coat of Arms SVGs",
	];
	const handleSelectAllDefaults = () => {
		setSelectAllDefaults(!selectAllDefaults);
		setDefaults(selectAllDefaults ? [] : [...defaultExports]);
	};

	const handleSelectDefault = (option: string) => {
		const updatedDefaults = defaults.includes(option)
			? defaults.filter((item) => item !== option)
			: [...defaults, option];

		setDefaults(updatedDefaults);
	};

	const IconStyles = useMemo(() => ({ size: "1.5rem" }), []);

	return (
		<Container className="Settings">
			<IconContext.Provider value={IconStyles}>
				<form>
					<h3>Settings</h3>
					<div className="contentSubBody">
						<div className="section">
							<h4>Map Settings</h4>
							{mapsList.length > 0 ? (
								<div className="sectionAlt">
									<span id="MapsList">
										<MapManager />
									</span>
								</div>
							) : (
								<UploadMap />
							)}
						</div>

						<div className="section">
							<h4>General & Appearance Settings</h4>
							{/* <div>
                <label htmlFor="languageSelect">Language</label>
                <select id="languageSelect" className="select">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
                <div className="checkboxContainer">
                  <input
                    id="showLanguageSelector"
                    type="checkbox"
                    style={checkbox}
                  />
                  <label htmlFor="showLanguageSelector">Show Language Selector</label>
                </div>
              </div> */}
							<div>
								<label htmlFor="themeSelect">Theme</label>
								<select
									id="themeSelect"
									className="select"
									value={userSettings.theme}
									onChange={(e) =>
										setApp((prev) => ({
											...prev,
											userSettings: {
												...prev.userSettings,
												theme: e.target.value,
											},
										}))
									}
								>
									<option value="light">Light</option>
									<option value="dark">Dark</option>
								</select>
							</div>
							{/* <div className="checkboxContainer">
                <input id="darkModeToggle" type="checkbox" style={checkbox} />
                <label htmlFor="darkModeToggle">Show Dark Mode Toggle</label>
              </div> */}
							{/*<div>
                <label htmlFor="fontSizeSelect">Font Size</label>
                <select className="select" id="fontSizeSelect">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>  */}
						</div>

						<div className="section">
							<h4>Display Settings</h4>
							<div className="sectionAlt">
								<label htmlFor="screenSize" style={{ marginRight: "10px" }}>
									Screen Size
								</label>
								<span id="screenSize">
									appInfo.userSettings.screen.outerWidth x
									appInfo.userSettings.screen.outerHeight
								</span>
							</div>
							<div className="checkboxContainer">
								<input
									id="welcomeMessage"
									type="checkbox"
									className="checkbox"
								/>
								<label htmlFor="welcomeMessage">Show Welcome Message?</label>
							</div>
						</div>

						<div className="section">
							<h4>Export Settings</h4>
							<select id="languageSelect" className="select">
								<option>English</option>
								<option>Spanish</option>
								<option>French</option>
							</select>
							<div className="checkboxContainer">
								<div className="sectionAlt">
									<h5>Default Exports</h5>
									<p>
										These are the default exports. (not functional currently)
									</p>
								</div>
								<FormGroup>
									<FormControlLabel
										control={
											<Checkbox
												checked={selectAllDefaults}
												onChange={handleSelectAllDefaults}
											/>
										}
										label="Select All Defaults"
									/>
									{defaultExports.map((option) => (
										<FormControlLabel
											key={option}
											control={
												<Checkbox
													checked={defaults.includes(option)}
													onChange={() => handleSelectDefault(option)}
												/>
											}
											label={option}
										/>
									))}
								</FormGroup>
							</div>
						</div>
					</div>
				</form>
			</IconContext.Provider>
		</Container>
	);
}

export default Settings;
