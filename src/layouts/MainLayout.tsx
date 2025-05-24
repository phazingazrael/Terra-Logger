import {
	AppBar,
	Container,
	Grid2 as Grid,
	ThemeProvider,
	Toolbar,
	Typography,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useRecoilState } from "recoil";
import { ToastContainer } from "react-toastify";
import Icon from "../assets/icon.png";
import { appAtom } from "../atoms";

import { MainNav } from "../components";

import { ContentMain } from "../components/Styled";

import { getFullStore } from "../db/interactions.tsx";

import { Analytics } from "@vercel/analytics/react";

import type { MapInf } from "../definitions/TerraLogger";

import KuashanScript from "../assets/fonts/KaushanScript-Regular.ttf";

const light = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#8309ac",
		},
		secondary: {
			main: "#21d4e6",
		},
		background: {
			default: "#fff5da",
		},
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				colorSecondary: {
					color: "secondary",
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: `@font-face {
                        font-family: 'KaushanScript';
                        src: local('KaushanScript'), url(${KuashanScript}) format('truetype');
                    }`,
		},
	},
});

const dark = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#8309ac",
		},
		secondary: {
			main: "#21d4e6",
		},
		success: {
			main: "#0f0",
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: `@font-face {
                        font-family: 'KaushanScript';
                        src: local('KaushanScript'), url(${KuashanScript}) format('truetype');
                    }`,
		},
		MuiAppBar: {
			styleOverrides: {
				colorSecondary: {
					color: "secondary",
				},
			},
		},
		MuiStack: {
			styleOverrides: {
				root: {},
			},
		},
	},
});

function MainLayout() {
	const [mapsList, setMapsList] = useState<MapInf[]>([]);
	const [Theme, setTheme] = useState({});
	const [appData] = useRecoilState(appAtom);

	const {
		userSettings: { theme },
	} = appData;

	const selectedTheme = theme === "light" ? light : dark;

	/**
	 * Function to set the theme based on the user's preference.
	 * If the user prefers a dark theme, the class "dark" is added to the root element.
	 * If the user prefers a light theme, the class "dark" is removed from the root element.
	 */
	useEffect(() => {
		const rootElement = document.getElementById("root");

		if (rootElement) {
			if (theme === "dark") {
				// Add class "dark" to the root element
				rootElement.classList.add("dark");
				setTheme(dark);
			} else {
				// Remove class "dark" from the root element
				rootElement.classList.remove("dark");
				setTheme(light);
			}
		}
		/**
		 * The dependency array is set to [theme] so that the effect is re-run whenever the theme changes.
		 * This ensures that the theme is updated correctly when the user changes their preference.
		 */
	}, [theme]);

	/**
	 * Function to fetch the list of maps from the database and set it to the `mapsList` state.
	 * The function is called when the component mounts.
	 */

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fetchMapsList = async () => {
			/**
			 * Fetch the list of maps from the database.
			 * The `getFullStore` function returns a promise that resolves with an array of all data from the "maps" store.
			 */
			const mapsData = await getFullStore("maps");
			/**
			 * Set the `mapsList` state to the list of maps fetched from the database.
			 */
			setMapsList(mapsData);
		};

		/**
		 * Call the `fetchMapsList` function when the component mounts.
		 * The `useEffect` hook takes a dependency array as its second argument.
		 * An empty dependency array means that the effect is only run once, when the component is mounted.
		 */
		fetchMapsList();
	}, [mapsList, setMapsList]);

	return (
		<ThemeProvider theme={selectedTheme}>
			<AppBar position="static">
				<Toolbar disableGutters>
					<img
						src={Icon}
						alt="Terra-Logger Icon"
						style={{
							display: "inline",
							padding: "0.5rem",
							marginRight: "2rem",
							width: "4rem",
							height: "4rem",
						}}
					/>
					<Typography
						variant="h4"
						noWrap
						component="h4"
						sx={{ fontFamily: "KaushanScript" }}
					>
						Terra-Logger. Azgaar&apos;s Fantasy Map Generator to structured
						Markdown.
					</Typography>
				</Toolbar>
			</AppBar>
			<Container maxWidth="xl" className="pageBody">
				<Grid container spacing={2}>
					<Grid size={3}>
						<ContentMain className="Navigation">
							<MainNav mapsList={mapsList} />
						</ContentMain>
					</Grid>
					<Grid size={9}>
						<ContentMain className="Content" id="Content">
							<div className="contentBody">
								<Outlet context={{ Theme, mapsList }} />
							</div>
						</ContentMain>
					</Grid>
				</Grid>
				<ToastContainer
					position="bottom-left"
					autoClose={10000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="colored"
				/>
				<Analytics />
			</Container>
		</ThemeProvider>
	);
}

export default MainLayout;
