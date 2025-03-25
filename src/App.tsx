import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAtom } from "jotai";
import Package from "../package.json";
import mapAtom from "./atoms/map";
import { initDatabase } from "./db/database";
import {
	addDataToStore,
	getDataFromStore,
	getFullStore,
} from "./db/interactions";
import MainLayout from "./layouts/MainLayout";
import {
	CitiesPage,
	CountriesPage,
	ErrorPage,
	HomePage,
	Overview,
	ReligionsPage,
	Settings,
	Tags,
	CityView,
	CountryView,
} from "./pages";

import "./App.css";

const App = (): JSX.Element => {
	const [map] = useAtom(mapAtom);

	useEffect(() => {
		function handleResize() {
			const { innerHeight, innerWidth } = window;
			console.log("resized to: ", innerWidth, "x", innerHeight);
			const mapElement = document.getElementById("map");
			const viewBox = document.getElementById("viewbox");
			const originalHeight = map.info.height;
			const originalWidth = map.info.width;
			if (mapElement) {
				console.log(originalHeight, originalWidth);
				console.log(innerHeight, innerWidth);
				console.log(originalHeight / innerHeight, originalWidth / innerWidth);
				console.log(innerHeight / originalHeight, innerWidth / originalWidth);

				if (viewBox) {
					mapElement.setAttribute("height", innerHeight as unknown as string);
					mapElement.setAttribute("width", innerWidth as unknown as string);
					viewBox.setAttribute("height", innerHeight as unknown as string);
					viewBox.setAttribute("width", innerWidth as unknown as string);

					// Apply transformation to scale content
					viewBox.setAttribute(
						"transform",
						`scale(${innerWidth / originalWidth},${innerHeight / originalHeight})`,
					);
				}
			}
		}

		window.addEventListener("resize", handleResize);
	});

	useEffect(() => {
		const initializeDatabase = async () => {
			try {
				const database = await initDatabase();

				if (database) {
					console.log("Database initialized");
				}

				// get data from appSettings store
				const appSettings = await getDataFromStore(
					"appSettings",
					`TL_${Package.version}`,
				);
				if (appSettings) {
					console.log("Application settings found, loading settings...");
					console.log(appSettings);
				} else {
					console.log(
						"First Time Load, Application settings not found, updating defaults...",
					);
					const defaultSettings = {
						id: `TL_${Package.version}`,
						application: {
							name: Package.name,
							version: Package.version,
							afmgVer: "1.95.00",
							supportedLanguages: ["en"],
							defaultLanguage: "en",
							onboarding: true,
							description: Package.descriptionFull,
						},
						userSettings: {
							theme: "light",
							language: "en",
							showWelcomeMessage: true,
							fontSize: "medium",
							exportOption: "",
							screen: {
								innerWidth: window.innerWidth,
								innerHeight: window.innerHeight,
								outerWidth: window.outerWidth,
								outerHeight: window.outerHeight,
								devicePixelRatio: window.devicePixelRatio,
							},
						},
					};
					addDataToStore("appSettings", defaultSettings);
				}

				// get data from map store
				const mapData = await getFullStore("maps");
				if (mapData && mapData.length > 0) {
					console.log("Map data found");
					console.log(mapData);
				} else {
					console.log("First Time Load or Map data not loaded");
				}
			} catch (error) {
				console.error("Failed to initialize database:", error);
			}
		};

		initializeDatabase();
	}, []);

	const router = createBrowserRouter([
		{
			path: "/",
			element: <MainLayout />,
			errorElement: <ErrorPage />,
			children: [
				{
					path: "/",
					element: <HomePage />,
					errorElement: <ErrorPage />,
				},
				{
					path: "overview",
					element: <Overview />,
					errorElement: <ErrorPage />,
				},
				{
					path: "tags",
					element: <Tags />,
					errorElement: <ErrorPage />,
				},
				{
					path: "settings",
					element: <Settings />,
					errorElement: <ErrorPage />,
				},
				{
					path: "countries",
					element: <CountriesPage />,
					errorElement: <ErrorPage />,
				},
				{
					path: "cities",
					element: <CitiesPage />,
					errorElement: <ErrorPage />,
				},
				{
					path: "religions",
					element: <ReligionsPage />,
					errorElement: <ErrorPage />,
				},
				// view routes here
				{
					path: "view_city/:_id",
					element: <CityView />,
					errorElement: <ErrorPage />,
				},
				{
					path: "view_country/:_id",
					element: <CountryView />,
					errorElement: <ErrorPage />,
				},
			],
		},
	]);

	return (
		<div>
			<RouterProvider router={router} />
		</div>
	);
};

export default App;
