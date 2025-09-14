import { useEffect, useState } from "react";
import {
	Button,
	Checkbox,
	FormControlLabel,
	Stack,
	Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getDataFromStore, updateDataInStore } from "../db/interactions";
import Package from "../../package.json";
import type { AppInfo } from "../definitions/AppInfo";

import "./MobileLayout.css";

const MobileLayout = () => {
	const [confirm, setConfirm] = useState(false);
	const [saving, setSaving] = useState(false);
	const [appSettings, setAppSettings] = useState<AppInfo | null>(null);
	const settingsId = `TL_${Package.version}`;

	// Load current app settings so we can persist the new flag without losing anything
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const existing = (await getDataFromStore(
					"appSettings",
					settingsId,
				)) as AppInfo | null;
				if (mounted) setAppSettings(existing ?? null);
			} catch (err) {
				console.error("Failed to load appSettings:", err);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [settingsId]);

	const enableForceMobile = async () => {
		if (!appSettings) return; // nothing to update (should exist already in your app flow)
		setSaving(true);
		try {
			await updateDataInStore("appSettings", settingsId, {
				...appSettings,
				userSettings: {
					...appSettings.userSettings,
					forceMobile: true,
				},
			});
			// optional: you could navigate or reload here if your app checks this on load
			// window.location.reload();
		} catch (err) {
			console.error("Failed to update appSettings.forceMobile:", err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="MobileLayout">
			<section className="section">
				<Typography variant="h2" align="center" gutterBottom>
					Hello! Thank you for visiting Terra-Logger!
				</Typography>

				<Typography variant="body1" align="center">
					<p>
						Unfortunately Terra-Logger does not support mobile devices, please
						use a computer to use this tool.
					</p>
					<p>
						Terra-Logger is unable to support mobile devices due to the fact
						that it requires processing power from your device to run. Most
						mobile devices aren't quite up to the task of the data modification
						and processing that Terra-Logger requires.
					</p>
					<br />
					<p>
						While I do not wish to fully discourage you from visiting the site
						on a mobile device, I cannot guarantee that it will work as intended
						for your device. If you wish to continue on—go with the saying “Here
						there be dragons”—you may do so by acknowledging below.
					</p>
				</Typography>

				<Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={confirm}
								onChange={(e) => setConfirm(e.target.checked)}
								sx={{ "&::before": { content: '"Acknowledge mobile risks"' } }}
							/>
						}
						label="I understand the risks and want to continue on mobile."
					/>

					{confirm ? (
						<Link to="/">
							<Button
								variant="contained"
								color="warning"
								disabled={!appSettings || saving}
								onClick={enableForceMobile}
							>
								{saving ? "Enabling…" : "Continue on mobile anyway"}
							</Button>
						</Link>
					) : null}
				</Stack>
			</section>
		</div>
	);
};

export default MobileLayout;
