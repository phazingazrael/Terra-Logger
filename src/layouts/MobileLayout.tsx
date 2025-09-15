import { useEffect, useState } from "react";
import {
	Button,
	Checkbox,
	FormControlLabel,
	Stack,
	Typography,
} from "@mui/material";
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
		if (!appSettings) return; // shouldn't happen
		setSaving(true);
		try {
			await updateDataInStore("appSettings", settingsId, {
				...appSettings,
				forceMobile: true,
			});
		} catch (err) {
			console.error("Failed to update appSettings.forceMobile:", err);
		} finally {
			setSaving(false);
			setTimeout(() => {
				window.location.reload();
			}, 3000);
		}
	};

	return (
		<div className="MobileLayout">
			<section className="section">
				<Typography variant="h2" align="center" gutterBottom>
					Hello! Thank you for visiting Terra-Logger!
				</Typography>

				<div>
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
				</div>

				<Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={confirm}
								onChange={(_, checked) => setConfirm(checked)}
								sx={{ "&::before": { content: '"Acknowledge mobile risks"' } }}
							/>
						}
						label="I understand the risks and want to continue on mobile."
					/>

					{confirm ? (
						<Button
							variant="contained"
							color="warning"
							disabled={!appSettings || saving}
							onClick={enableForceMobile}
						>
							{saving ? "Enabling…" : "Continue on mobile anyway"}
						</Button>
					) : null}
				</Stack>
			</section>
		</div>
	);
};

export default MobileLayout;
