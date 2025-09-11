import { Container, Divider, Typography } from "@mui/material";
import { useRecoilState } from "recoil";
import appAtom from "../../atoms/app";
import type { AppInfo } from "../../definitions/AppInfo";

const HomePage = () => {
	const [app] = useRecoilState<AppInfo>(appAtom);

	if (app) {
		console.log(app);
	} else {
	}

	return (
		<Container className="homePage">
			<div className="contentSubHead">
				<Typography variant="h5">
					Welcome to Terra-Logger!{" "}
					<sup>V{app.application.version ?? "0.0.0"}</sup>
				</Typography>
				<Typography variant="h6" component="div">
					Currently compatible with version {app.application.afmgVer ?? "0.0.0"}{" "}
					of Azgaar&#39;s Fantasy Map Generator and newer!
				</Typography>
			</div>
			<Divider sx={{ margin: "0.75rem" }} />
			<div className="contentSubBody">
				<Typography variant="body1" component="div">
					{`Terra-Logger is designed to simplify the process of
					organizing and managing data from Azgaar's Fantasy Map Generator.`}
				</Typography>
				<p>
					With Terra-Logger, you can streamline your world-building project by
					effortlessly converting your saved .map file
					<br /> into individual markdown files for Each City, Country and
					Religion along with any associated Emblem or Coat of Arms.
				</p>
				<Typography variant="h6" component="div">
					What Terra-Logger Offers:
				</Typography>
				<ul>
					<li>
						<strong>Simplified Organization:</strong> Automatically generate
						individual Markdown files for each city, country, and religious
						detail.
					</li>
					{/* <li>
						<strong>Customization:</strong> Edit and customize information
						before exporting, ensuring your documentation suits your unique
						needs.
					</li> */}
					<li>
						<strong>Visual Enhancement:</strong> Automatically include relevant
						emblems or coat of arms as SVG files to enrich your world-building
						documentation.
					</li>
					<li>
						<strong>Ease of Use:</strong> A user-friendly interface for a
						seamless experience.
					</li>
				</ul>
				<Typography variant="h6" component="div">
					Get Started
				</Typography>
				<p>To get started with Terra-Logger:</p>
				<ol>
					<li>
						Visit{" "}
						<a
							href="https://azgaar.github.io/Fantasy-Map-Generator/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Azgaar's Fantasy Map Generator
						</a>{" "}
						and save your .map file.
					</li>
					<li>
						Import Your .map file into Terra-Logger under the settings page.
					</li>
					{/* <li>View and Customize your data.</li> */}
					<li>View your data.</li>
					<li>Export the organized Markdown files.</li>
				</ol>
			</div>
		</Container>
	);
};

export default HomePage;
