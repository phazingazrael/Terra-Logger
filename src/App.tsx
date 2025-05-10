import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useRecoilState } from "recoil";
import mapAtom from "./atoms/map";
import { initDatabase } from "./db/database";
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
	const [map] = useRecoilState<MapInf>(mapAtom);

	// resize map
	useEffect(() => {
		/**
		 * Handles the window's resize event.
		 * This function is called whenever the user resizes the window.
		 */
		function handleResize() {
			// Get the new window dimensions
			const { innerHeight, innerWidth } = window;

			// Log the new window dimensions
			console.info("resized to: ", innerWidth, "x", innerHeight);

			// Get the map elements
			const mapElement = document.getElementById("map");
			const viewBox = document.getElementById("viewbox");

			// Get the original dimensions of the map
			const originalHeight = map.info.height;
			const originalWidth = map.info.width;

			// Scale the map to fit the new window dimensions
			if (mapElement) {
				if (viewBox) {
					// Set the new height and width of the map element
					mapElement.setAttribute("height", innerHeight as unknown as string);
					mapElement.setAttribute("width", innerWidth as unknown as string);

					// Set the new height and width of the viewBox element
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

	// Initialize the database
	useEffect(() => {
		/**
		 * Initializes the IndexedDB database.
		 * This function is called once, when the component mounts.
		 */
		const initializeDatabase = async () => {
			try {
				// Initialize the IndexedDB database
				const database = await initDatabase();

				if (database) {
					console.info("Database initialized");
				}
			} catch (error) {
				// Handle any errors that occur when initializing the database
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

	return <RouterProvider router={router} />;
};

export default App;
