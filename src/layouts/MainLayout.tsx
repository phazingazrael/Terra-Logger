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
import appAtom from "../atoms/app.tsx";
import Item from "../components/Item.tsx";
import MainNav from "../components/MainNav.tsx";

import { getFullStore } from "../db/interactions.tsx";

import { Analytics } from "@vercel/analytics/react";

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

	useEffect(() => {
		const rootElement = document.getElementById("root");

		if (rootElement) {
			// Check if darkTheme is true
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
	}, [theme]);

	useEffect(() => {
		const fetchMapsList = async () => {
			const mapsData = await getFullStore("maps");
			setMapsList(mapsData);
		};

		fetchMapsList();
	}, []);

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
						<Item className="Navigation">
							<MainNav mapsList={mapsList} />
						</Item>
					</Grid>
					<Grid size={9}>
						<Item className="Content" id="Content">
							<div className="contentBody">
								<Outlet context={Theme} />
							</div>
						</Item>
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
